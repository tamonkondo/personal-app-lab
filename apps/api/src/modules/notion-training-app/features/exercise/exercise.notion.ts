import {
  getFormula,
  getRollup,
  getRollupArrayValue,
} from "@/integrations/notion/notion.mapper";
import notionClient from "@/integrations/notion/notion.client";
import { config } from "@/libs/config";
import { NotFoundError } from "@/libs/errors";
import type {
  NotionExercisePage,
  NotionExerciseProperties,
  NotionExerciseQueryResult,
} from "./exercise.types";
import type {
  ExerciseDetail,
  ExerciseLogWithSetsResponse,
  ExerciseSummaryResponse,
} from "@repo/types/notion-training-app";

import {
  exerciseLogWithSetsProperties,
  fetchExerciseLogWithSets,
  mapExerciseLogsWithSets,
} from "../exerciseLog/exerciseLog.notion";
import type { ExerciseLogWithSetsProperties } from "../exerciseLog/exerciseLog.notion";
import type { NotionExerciseLogQueryResult } from "../exerciseLog/exerciseLog.types";
import {
  notionDefineProperties,
  type NotionKeysOfProperties,
} from "@/libs/notion/propertyExtract";
import { exerciseRmTypesSchema } from "./exercise.schema";

type FetchExerciseSummaryLogsResult = Pick<
  ExerciseSummaryResponse,
  "data" | "meta"
>;
type FetchExerciseLogsResult = Pick<
  ExerciseLogWithSetsResponse,
  "data" | "meta"
>;

const exerciseNameProperties =
  notionDefineProperties<NotionExerciseProperties>()(["name"]);

const exerciseSummaryProperties =
  notionDefineProperties<NotionExerciseProperties>()([
    "name",
    "musclesTypes",
    "maxGoalWeightRollup",
    "maxWeightExerciseLogId",
    "latestExerciseLogId",
    "currentMaxWeightRollup",
  ]);

const exerciseDetailProperties =
  notionDefineProperties<NotionExerciseProperties>()([
    "name",
    "latestTrainingDateFormula",
    "musclesTypes",
    "maxGoalWeightRollup",
    "currentMaxWeightRollup",
    "totalSetsCountFormula",
    "totalTrainingDaysFormula",
    "totalTrainingVolumeWeightFormula",
    "rmTypes",
  ]);

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
  const exercises: NotionExerciseQueryResult<
    NotionKeysOfProperties<typeof exerciseSummaryProperties>
  > = (await notionClient.dataSources.query({
    data_source_id: config.NOTION_EXERCISES_DATABASE_ID,
    filter: {
      and: [
        {
          property: "theGoalsWeightRelation",
          relation: {
            is_not_empty: true,
          },
        },
        {
          property: "maxGoalWeightRollup",
          rollup: {
            any: {
              number: {
                is_not_empty: true,
              },
            },
          },
        },
        {
          property: "maxWeightExerciseLogId",
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
    data: exercises.results.map((log) => {
      const logWithSets = exerciseLogWithSetsMap.get(log.id);
      if (!logWithSets) {
        throw new Error(`Exercise log summary not found: ${log.id}`);
      }
      const maxGoalWeight =
        getRollupArrayValue(log.properties.maxGoalWeightRollup, "number") || 0;
      const currentMaxWeight =
        Number(getRollup(log.properties.currentMaxWeightRollup, "number")) || 0;
      return {
        id: log.id,
        musclesTypes:
          log.properties.musclesTypes.multi_select?.map(
            (muscle) => muscle.name,
          ) || [],
        trainingName: log.properties.name.title?.[0]?.plain_text || "",
        maxGoalWeight,
        currentMaxWeight,
        isPr: currentMaxWeight > maxGoalWeight,
        exerciseUrl: log.url,
        maxWeightSets: logWithSets.maxWeightSets,
        latestSets: logWithSets.latestSets,
      };
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
        property: "exerciseRelation",
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
  const exercise: NotionExercisePage<
    NotionKeysOfProperties<typeof exerciseDetailProperties>
  > = (await notionClient.pages.retrieve({
    page_id: exerciseId,
    filter_properties: [...exerciseDetailProperties],
  })) as unknown as NotionExercisePage<
    NotionKeysOfProperties<typeof exerciseDetailProperties>
  >;
  const properties = exercise.properties;

  const responseData: ExerciseDetail = {
    id: exercise.id,
    exerciseName: properties.name.title?.[0]?.plain_text || "",
    latestTrainingDate:
      getFormula(properties.latestTrainingDateFormula, "date")?.start || "",
    musclesTypes:
      properties.musclesTypes.multi_select?.map((muscle) => muscle.name) || [],
    trainingName: properties.name.title?.[0]?.plain_text || "",
    maxGoalWeight:
      getRollupArrayValue(properties.maxGoalWeightRollup, "number") || 0,
    currentMaxWeight:
      Number(getRollup(properties.currentMaxWeightRollup, "number")) || 0,
    totalSetsCount: getFormula(properties.totalSetsCountFormula, "number") || 0,
    totalTrainingDays:
      getFormula(properties.totalTrainingDaysFormula, "number") || 0,
    totalTrainingVolumeWeight:
      getFormula(properties.totalTrainingVolumeWeightFormula, "number") || 0,
    rmTypes: exerciseRmTypesSchema.parse(properties.rmTypes.select?.name),
  };
  return responseData;
}
export async function fetchExerciseTrends(exerciseId: string) {
  // 従来はデータソースに存在しない "id" プロパティで query しており常に 500 だったため、
  // ページ ID で直接 retrieve する方式に修正
  const exercise: NotionExercisePage<"maxGoalWeightRollup"> =
    (await notionClient.pages
      .retrieve({
        page_id: exerciseId,
        filter_properties: ["maxGoalWeightRollup"],
      })
      .catch(() => {
        throw new NotFoundError(`Exercise not found: ${exerciseId}`);
      })) as unknown as NotionExercisePage<"maxGoalWeightRollup">;

  const maxGoalWeight =
    getRollupArrayValue(exercise.properties.maxGoalWeightRollup, "number") || 0;
  return {
    maxGoalWeight,
  };
}
