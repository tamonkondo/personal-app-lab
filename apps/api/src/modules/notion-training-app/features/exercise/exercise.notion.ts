import notionClient from "@/integrations/notion/notion.client";
import { config } from "@/libs/config";
import { NotFoundError } from "@/libs/errors";
import type {
  NotionExercisePage,
  NotionExerciseQueryResult,
} from "./exercise.types";
import type {
  ExerciseDetail,
  ExerciseLogWithSetsResponse,
  ExerciseSummaryResponse,
} from "@repo/types/notion-training-app";

import { fetchExerciseLogWithSets } from "../exerciseLog/exerciseLog.notion";
import {
  exerciseLogProp,
  exerciseLogWithSetsProperties,
  mapExerciseLogsWithSets,
  type ExerciseLogWithSetsProperties,
} from "../exerciseLog/exerciseLog.db";
import type { NotionExerciseLogQueryResult } from "../exerciseLog/exerciseLog.types";
import { type NotionKeysOfProperties } from "@/libs/notion/propertyExtract";
import {
  exerciseNameProperties,
  exerciseSummaryProperties,
  exerciseDetailProperties,
  exerciseProp,
  mapExerciseSummaryItem,
  mapExerciseDetail,
  mapExerciseTrends,
  type ExerciseSummaryPage,
  type ExerciseDetailPage,
} from "./exercise.db";

type FetchExerciseSummaryLogsResult = Pick<
  ExerciseSummaryResponse,
  "data" | "meta"
>;
type FetchExerciseLogsResult = Pick<
  ExerciseLogWithSetsResponse,
  "data" | "meta"
>;

export async function fetchExerciseNames() {
  return (await notionClient.dataSources.query({
    data_source_id: config.NOTION_EXERCISES_DATABASE_ID,
    filter_properties: [...exerciseNameProperties],
  })) as unknown as NotionExerciseQueryResult<
    NotionKeysOfProperties<typeof exerciseNameProperties>
  >;
}

export async function fetchExerciseSummaryLogs(
  limit: number = 7,
  cursor?: string,
): Promise<FetchExerciseSummaryLogsResult> {
  // ゴール重量がある種目のみを取得
  const exercises = (await notionClient.dataSources.query({
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
  })) as unknown as NotionExerciseQueryResult<
    NotionKeysOfProperties<typeof exerciseSummaryProperties>
  >;
  const exerciseLogWithSets = await fetchExerciseLogWithSets({
    exercises,
  });

  const exerciseLogWithSetsMap = new Map(
    exerciseLogWithSets.map((log) => [log.exerciseId, log]),
  );

  const responseData: FetchExerciseSummaryLogsResult = {
    data: exercises.results.map((exercise: ExerciseSummaryPage) => {
      const logWithSets = exerciseLogWithSetsMap.get(exercise.id);
      if (!logWithSets) {
        throw new Error(`Exercise log summary not found: ${exercise.id}`);
      }
      return mapExerciseSummaryItem(exercise, logWithSets);
    }),
    meta: {
      next_cursor: exercises.next_cursor || undefined,
      has_more: exercises.has_more,
    },
  };
  return responseData;
}

export async function fetchExerciseLogs(
  exerciseId: string,
  limit: number = 7,
  cursor?: string,
): Promise<FetchExerciseLogsResult> {
  const exerciseLogs: NotionExerciseLogQueryResult<ExerciseLogWithSetsProperties> =
    (await notionClient.dataSources.query({
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
    })) as unknown as NotionExerciseLogQueryResult<ExerciseLogWithSetsProperties>;

  const responseData: FetchExerciseLogsResult = {
    data: mapExerciseLogsWithSets({
      exerciseLogs,
      exerciseId,
    }),
    meta: {
      next_cursor: exerciseLogs.next_cursor || undefined,
      has_more: exerciseLogs.has_more,
    },
  };
  return responseData;
}

export async function fetchExerciseDetail(
  exerciseId: string,
): Promise<ExerciseDetail> {
  const exercise: ExerciseDetailPage = (await notionClient.pages.retrieve({
    page_id: exerciseId,
    filter_properties: [...exerciseDetailProperties],
  })) as unknown as ExerciseDetailPage;

  return mapExerciseDetail(exercise);
}

export async function fetchExerciseTrends(exerciseId: string) {
  // 従来はデータソースに存在しない "id" プロパティで query しており常に 500 だったため、
  // ページ ID で直接 retrieve する方式に修正
  const exercise: NotionExercisePage<"maxGoalWeightRollup"> =
    (await notionClient.pages
      .retrieve({
        page_id: exerciseId,
        filter_properties: [exerciseProp("maxGoalWeightRollup")],
      })
      .catch(() => {
        throw new NotFoundError(`Exercise not found: ${exerciseId}`);
      })) as unknown as NotionExercisePage<"maxGoalWeightRollup">;

  return mapExerciseTrends(exercise);
}
