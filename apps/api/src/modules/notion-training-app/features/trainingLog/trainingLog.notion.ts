import notionClient from "@/integrations/notion/notion.client";
import { config } from "@/libs/config";
import notionLimit from "@/libs/notion/notionLimit";
import {
  notionQueryEnvelope,
  toPaginationMeta,
} from "@/integrations/notion/notion.schema";
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
  parseTrainingLogPage,
  parseSummaryExerciseLogPage,
  parseDetailExerciseLogPage,
  parseNewestExerciseLogRelations,
  parseExerciseSetWeight,
  mapTrainingLogSummaryItem,
  mapTrainingLogDetail,
  mapNewestTrainingLog,
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

  const envelope = notionQueryEnvelope.parse(
    await notionClient.dataSources.query({
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
    }),
  );
  const trainingLogs = envelope.results.map(parseTrainingLogPage);

  const exercisesRelationIds = trainingLogs.flatMap(
    (trainingLog) => trainingLog.properties.trainingExercisesRelation,
  );
  const exerciseLogs = await Promise.all(
    exercisesRelationIds.map((id) =>
      notionLimit(async () =>
        parseSummaryExerciseLogPage(
          await notionClient.pages.retrieve({
            page_id: id,
            filter_properties: [...trainingLogSummaryExerciseLogProperties],
          }),
        ),
      ),
    ),
  );

  return {
    data: trainingLogs.map((trainingLog) =>
      mapTrainingLogSummaryItem(trainingLog, exerciseLogs),
    ),
    meta: toPaginationMeta(envelope),
  };
}

// トレーニング詳細の取得
// /api/notion-training-app/training-logs/:id
export async function fetchTrainingLogDetail(
  id: string,
): Promise<TrainingLogDetail | null> {
  const trainingLog = parseTrainingLogPage(
    await notionLimit(() =>
      notionClient.pages.retrieve({
        page_id: id,
      }),
    ),
  );

  const exercisesRelationIds =
    trainingLog.properties.trainingExercisesRelation;
  // 種目ごとの記録データを取得
  const exerciseLogs = await Promise.all(
    exercisesRelationIds.map((exerciseLogId) =>
      notionLimit(async () =>
        parseDetailExerciseLogPage(
          await notionClient.pages.retrieve({
            page_id: exerciseLogId,
            filter_properties: [...trainingLogDetailExerciseLogProperties],
          }),
        ),
      ),
    ),
  );

  return mapTrainingLogDetail(trainingLog, exerciseLogs);
}

// 最新のトレーニングログを1件取得するクエリ
export async function fetchNewestTrainingLog(): Promise<NewestTrainingLogItemResponse | null> {
  /**
   * 取得したいもの
   * ・日付、メモ、種目数、セット数、総重量数
   */
  const envelope = notionQueryEnvelope.parse(
    await notionClient.dataSources.query({
      data_source_id: config.NOTION_TRAINING_LOGS_DATABASE_ID,
      page_size: 1,
      sorts: [
        {
          property: trainingLogProp("createdTime"),
          direction: "descending",
        },
      ],
    }),
  );

  const rawLog = envelope.results[0];
  if (!rawLog) {
    return null;
  }
  const log = parseTrainingLogPage(rawLog);

  // リレーションですべてのトレーニング種目を取得するために、最新のトレーニングログのIDを取得
  const relationIds = log.properties.trainingExercisesRelation;
  // 最新のトレーニングログのIDをもとに、リレーションでつながっているトレーニング種目をすべて取得
  const exerciseSetsRelationIds = (
    await Promise.all(
      relationIds.map((id) =>
        notionLimit(async () =>
          parseNewestExerciseLogRelations(
            await notionClient.pages.retrieve({
              page_id: id,
              filter_properties: [...newestLogExerciseLogProperties],
            }),
          ),
        ),
      ),
    )
  ).flat();

  // トレーニング種目に紐づくセットを取得し、総重量数を計算
  const exerciseSets = await Promise.all(
    exerciseSetsRelationIds.map((id) =>
      notionLimit(async () =>
        parseExerciseSetWeight(
          await notionClient.pages.retrieve({
            page_id: id,
            filter_properties: [...exerciseSetWeightProperties],
          }),
        ),
      ),
    ),
  );
  const totalWeight = exerciseSets.reduce(
    (acc, set) => acc + set.kg * set.rep,
    0,
  );

  return mapNewestTrainingLog(log, {
    exerciseCount: relationIds.length,
    totalWeight,
  });
}
