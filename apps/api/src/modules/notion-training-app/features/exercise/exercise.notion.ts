import notionClient from "@/integrations/notion/notion.client";
import { config } from "@/libs/config";
import { NotFoundError } from "@/libs/errors";
import {
  notionQueryEnvelope,
  toPaginationMeta,
} from "@/integrations/notion/notion.schema";
import type {
  ExerciseLogWithSetsResponse,
  ExerciseSummaryResponse,
  ExerciseDetail,
} from "@repo/types/notion-training-app";

import { fetchExerciseLogWithSets } from "../exerciseLog/exerciseLog.notion";
import {
  exerciseLogProp,
  exerciseLogWithSetsProperties,
  mapExerciseLogsWithSets,
} from "../exerciseLog/exerciseLog.db";
import {
  exerciseNameProperties,
  exerciseSummaryProperties,
  exerciseDetailProperties,
  exerciseProp,
  parseExerciseSummaryPage,
  readExerciseLogRefs,
  mapExerciseName,
  mapExerciseSummaryItem,
  mapExerciseDetail,
  mapExerciseTrends,
} from "./exercise.db";

type FetchExerciseSummaryLogsResult = Pick<
  ExerciseSummaryResponse,
  "data" | "meta"
>;
type FetchExerciseLogsResult = Pick<
  ExerciseLogWithSetsResponse,
  "data" | "meta"
>;

export async function fetchExerciseNames(): Promise<
  { id: string; name: string }[]
> {
  const envelope = notionQueryEnvelope.parse(
    await notionClient.dataSources.query({
      data_source_id: config.NOTION_EXERCISES_DATABASE_ID,
      filter_properties: [...exerciseNameProperties],
    }),
  );
  return envelope.results.map(mapExerciseName);
}

export async function fetchExerciseSummaryLogs(
  limit: number = 7,
  cursor?: string,
): Promise<FetchExerciseSummaryLogsResult> {
  // ゴール重量がある種目のみを取得
  const envelope = notionQueryEnvelope.parse(
    await notionClient.dataSources.query({
      data_source_id: config.NOTION_EXERCISES_DATABASE_ID,
      filter: {
        and: [
          {
            property: exerciseProp("theGoalsWeightRelation"),
            relation: {
              is_not_empty: true,
            },
          },
          {
            property: exerciseProp("maxGoalWeightRollup"),
            rollup: {
              any: {
                number: {
                  is_not_empty: true,
                },
              },
            },
          },
          {
            property: exerciseProp("maxWeightExerciseLogId"),
            formula: {
              string: {
                is_not_empty: true,
              },
            },
          },
        ],
      },
      filter_properties: [...exerciseSummaryProperties],
      page_size: limit,
      start_cursor: cursor,
    }),
  );
  const exercises = envelope.results.map(parseExerciseSummaryPage);

  const exerciseLogWithSets = await fetchExerciseLogWithSets(
    exercises.map((exercise) => ({
      exerciseId: exercise.id,
      ...readExerciseLogRefs(exercise),
    })),
  );

  const exerciseLogWithSetsMap = new Map(
    exerciseLogWithSets.map((log) => [log.exerciseId, log]),
  );

  return {
    data: exercises.map((exercise) => {
      const logWithSets = exerciseLogWithSetsMap.get(exercise.id);
      if (!logWithSets) {
        throw new Error(`Exercise log summary not found: ${exercise.id}`);
      }
      return mapExerciseSummaryItem(exercise, logWithSets);
    }),
    meta: toPaginationMeta(envelope),
  };
}

export async function fetchExerciseLogs(
  exerciseId: string,
  limit: number = 7,
  cursor?: string,
): Promise<FetchExerciseLogsResult> {
  const envelope = notionQueryEnvelope.parse(
    await notionClient.dataSources.query({
      data_source_id: config.NOTION_EXERCISE_LOGS_DATABASE_ID,
      filter: {
        property: exerciseLogProp("exerciseRelation"),
        relation: {
          contains: exerciseId,
        },
      },
      filter_properties: [...exerciseLogWithSetsProperties],
      page_size: limit,
      start_cursor: cursor,
    }),
  );

  return {
    data: mapExerciseLogsWithSets({
      results: envelope.results,
      exerciseId,
    }),
    meta: toPaginationMeta(envelope),
  };
}

export async function fetchExerciseDetail(
  exerciseId: string,
): Promise<ExerciseDetail> {
  const raw = await notionClient.pages.retrieve({
    page_id: exerciseId,
    filter_properties: [...exerciseDetailProperties],
  });
  return mapExerciseDetail(raw);
}

export async function fetchExerciseTrends(exerciseId: string) {
  // 従来はデータソースに存在しない "id" プロパティで query しており常に 500 だったため、
  // ページ ID で直接 retrieve する方式に修正
  const raw = await notionClient.pages
    .retrieve({
      page_id: exerciseId,
      filter_properties: [exerciseProp("maxGoalWeightRollup")],
    })
    .catch(() => {
      throw new NotFoundError(`Exercise not found: ${exerciseId}`);
    });

  return mapExerciseTrends(raw);
}
