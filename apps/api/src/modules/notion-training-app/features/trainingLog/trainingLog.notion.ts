import notionClient from "@/integrations/notion/notion.client";
import { config } from "@/libs/config";
import notionLimit from "@/libs/notion/notionLimit";
import { getRelationIds } from "@/integrations/notion/notion.mapper";
import type {
  NotionTrainingLogPage,
  NotionTrainingLogQueryResult,
} from "./trainingLog.types";
import type { NotionExerciseSetWeightPage } from "../exerciseSet/exerciseSet.types";
import type { NotionExerciseLogPage } from "../exerciseLog/exerciseLog.types";
import type {
  NewestTrainingLogItemResponse,
  TrainingLogDetail,
  TrainingLogSummaryResponse,
} from "@repo/types/notion-training-app";
import { SortOrder } from "@repo/types";
import {
  trainingLogProp,
  trainingLogSummaryExerciseLogProperties,
  trainingLogDetailExerciseLogProperties,
  newestLogExerciseLogProperties,
  exerciseSetWeightProperties,
  mapTrainingLogSummaryItem,
  mapTrainingLogDetail,
  mapNewestTrainingLog,
  type TrainingLogSummaryExerciseLogPage,
  type TrainingLogDetailExerciseLogPage,
} from "./trainingLog.db";

type FetchTrainingLogsResult = Pick<
  TrainingLogSummaryResponse,
  "data" | "meta"
>;

// トレーニングログ一覧の取得
// /api/notion-training-app/training-logs/?cursor=xxx&limit=20

export async function fetchTrainingLogs(
  cursor?: string,
  limit: number = 20,
  startDate?: string,
  endDate?: string,
  sort?: SortOrder,
  parts?: string[],
): Promise<FetchTrainingLogsResult> {
  const partsFilters = parts?.length
    ? parts.map((part) => ({
        property: trainingLogProp("musleTypesFormulaWrapper"),
        formula: {
          string: {
            contains: part,
          },
        },
      }))
    : [];

  const dateFilters = [
    startDate
      ? {
          property: trainingLogProp("createdTime"),
          date: {
            on_or_after: startDate,
          },
        }
      : undefined,
    endDate
      ? {
          property: trainingLogProp("createdTime"),
          date: {
            on_or_before: endDate,
          },
        }
      : undefined,
  ].filter((filter): filter is NonNullable<typeof filter> => !!filter);
  const filters =
    partsFilters.length > 0
      ? {
          and: [
            ...dateFilters,
            {
              or: partsFilters,
            },
          ],
        }
      : // parts がないときは日付だけ
        {
          and: dateFilters,
        };

  const trainingLogs: NotionTrainingLogQueryResult =
    (await notionClient.dataSources.query({
      data_source_id: config.NOTION_TRAINING_LOGS_DATABASE_ID,
      page_size: limit,
      start_cursor: cursor,
      filter: filters,
      sorts: sort
        ? [
            {
              property: trainingLogProp("createdTime"),
              direction: sort === "asc" ? "ascending" : "descending",
            },
          ]
        : undefined,
    })) as unknown as NotionTrainingLogQueryResult;
  const exercisesRelationIds = trainingLogs.results.flatMap(
    (trainingLog) =>
      getRelationIds(trainingLog.properties.trainingExercisesRelation) || [],
  );
  const exerciseLogs: TrainingLogSummaryExerciseLogPage[] = (await Promise.all(
    exercisesRelationIds.map((id) =>
      notionLimit(() =>
        notionClient.pages.retrieve({
          page_id: id,
          filter_properties: [...trainingLogSummaryExerciseLogProperties],
        }),
      ),
    ),
  )) as unknown as TrainingLogSummaryExerciseLogPage[];

  return {
    data: trainingLogs.results.map((trainingLog) =>
      mapTrainingLogSummaryItem(trainingLog, exerciseLogs),
    ),
    meta: {
      next_cursor: trainingLogs.next_cursor || undefined,
      has_more: trainingLogs.has_more,
    },
  };
}

// トレーニング詳細の取得
// /api/notion-training-app/training-logs/:id
export async function fetchTrainingLogDetail(
  id: string,
): Promise<TrainingLogDetail | null> {
  const trainingLog = (await notionLimit(() =>
    notionClient.pages.retrieve({
      page_id: id,
    }),
  )) as unknown as NotionTrainingLogPage;
  if (!trainingLog) {
    return null;
  }

  const exercisesRelationIds =
    getRelationIds(trainingLog.properties.trainingExercisesRelation) || [];
  // 種目ごとの記録データを取得
  const exerciseLogs: TrainingLogDetailExerciseLogPage[] = (await Promise.all(
    exercisesRelationIds.map((exerciseLogId) =>
      notionLimit(() =>
        notionClient.pages.retrieve({
          page_id: exerciseLogId,
          filter_properties: [...trainingLogDetailExerciseLogProperties],
        }),
      ),
    ),
  )) as unknown as TrainingLogDetailExerciseLogPage[];

  return mapTrainingLogDetail(trainingLog, exerciseLogs);
}

// 最新のトレーニングログを1件取得するクエリ
export async function fetchNewestTrainingLog(): Promise<NewestTrainingLogItemResponse | null> {
  /**
   * 取得したいもの
   * ・日付、メモ、種目数、セット数、総重量数
   */
  const newestLog = await notionClient.dataSources.query({
    data_source_id: config.NOTION_TRAINING_LOGS_DATABASE_ID,
    page_size: 1,
    sorts: [
      {
        property: trainingLogProp("createdTime"),
        direction: "descending",
      },
    ],
  });
  const logs = newestLog as unknown as NotionTrainingLogQueryResult;

  const log = logs.results[0];
  if (!log) {
    return null;
  }

  // リレーションですべてのトレーニング種目を取得するために、最新のトレーニングログのIDを取得
  const relationIds = getRelationIds(log.properties.trainingExercisesRelation);
  // 最新のトレーニングログのIDをもとに、リレーションでつながっているトレーニング種目をすべて取得
  const exerciseLogs: NotionExerciseLogPage<"exerciseSetsRelation">[] =
    (await Promise.all(
      relationIds?.map((id) =>
        notionLimit(() =>
          notionClient.pages.retrieve({
            page_id: id,
            filter_properties: [...newestLogExerciseLogProperties],
          }),
        ),
      ) || [],
    )) as unknown as NotionExerciseLogPage<"exerciseSetsRelation">[];
  const exerciseSetsRelationIds = exerciseLogs.flatMap(
    (exerciseLog) =>
      getRelationIds(exerciseLog.properties.exerciseSetsRelation) || [],
  );
  // トレーニング種目に紐づくセットのリレーションをすべて取得

  const exerciseSets = (await Promise.all(
    exerciseSetsRelationIds.map((id) =>
      notionLimit(() =>
        notionClient.pages.retrieve({
          page_id: id,
          filter_properties: [...exerciseSetWeightProperties],
        }),
      ),
    ),
  )) as unknown as NotionExerciseSetWeightPage[];
  // 取得したkgとrepをもとに、総重量数を計算
  let totalWeight = 0;
  exerciseSets.forEach((exerciseSet) => {
    const kg = exerciseSet.properties.kg.number || 0;
    const rep = exerciseSet.properties.rep.number || 0;
    totalWeight += kg * rep;
  });

  return mapNewestTrainingLog(log, {
    exerciseCount: relationIds?.length || 0,
    totalWeight,
  });
}
