import notionClient from "@/integrations/notion/notion.client";
import { config } from "@/libs/config";
import { AppError } from "@/libs/errors";
import notionLimit from "@/libs/notion/notionLimit";
import {
  notionCreatedPage,
  notionQueryEnvelope,
  toPaginationMeta,
} from "@/integrations/notion/notion.schema";
import type { CreateTrainingLogInput } from "@repo/schemas/notion-training-app";
import { mapExerciseName } from "../exercise/exercise.db";
import {
  exerciseLogProp,
  buildCreateExerciseLogProperties,
} from "../exerciseLog/exerciseLog.db";
import { buildCreateExerciseSetProperties } from "../exerciseSet/exerciseSet.db";
import type {
  CreateTrainingLogResult,
  NewestTrainingLogItemResponse,
  TrainingLogDetail,
  TrainingLogSummaryResponse,
} from "@repo/types/notion-training-app";
import { SortOrder } from "@repo/types";
import {
  buildCreateTrainingLogProperties,
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

/** 種目の既存ログ数を数える (name の連番採番用) */
async function countExerciseLogs(exerciseId: string): Promise<number> {
  let count = 0;
  let cursor: string | undefined;
  do {
    const envelope = notionQueryEnvelope.parse(
      await notionClient.dataSources.query({
        data_source_id: config.NOTION_EXERCISE_LOGS_DATABASE_ID,
        filter: {
          property: exerciseLogProp("exerciseRelation"),
          relation: { contains: exerciseId },
        },
        filter_properties: [exerciseLogProp("rest")],
        page_size: 100,
        start_cursor: cursor,
      }),
    );
    count += envelope.results.length;
    cursor = envelope.next_cursor ?? undefined;
  } while (cursor);
  return count;
}

/**
 * トレーニング記録の作成 (当日記録のみ)。
 * TRAINING_LOGS → 種目ごとの EXERCISE_LOGS → セットごとの EXERCISE_SETS の順に作成する。
 * 途中失敗時のロールバックは行わず、作成済みページ ID をエラーに含めて返す
 * (Notion 上で手直しできるようにするため)。
 */
export async function createTrainingLog(
  input: CreateTrainingLogInput,
): Promise<CreateTrainingLogResult> {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateName = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const dateKey = dateName.replaceAll("-", "");

  const createdIds: string[] = [];
  try {
    // 1. トレーニングログ本体
    const trainingLog = notionCreatedPage.parse(
      await notionClient.pages.create({
        parent: { data_source_id: config.NOTION_TRAINING_LOGS_DATABASE_ID },
        properties: buildCreateTrainingLogProperties({
          dateName,
          bodyWeight: input.bodyWeight,
          memo: input.memo,
        }) as never,
      }),
    );
    createdIds.push(trainingLog.id);

    // 2. 種目ごとの記録 (連番採番があるため直列で作成)
    const exerciseLogIds: string[] = [];
    for (const exercise of input.exercises) {
      const exerciseName = mapExerciseName(
        await notionClient.pages.retrieve({
          page_id: exercise.exerciseId,
          filter_properties: ["name"],
        }),
      ).name;
      const recordNumber = (await countExerciseLogs(exercise.exerciseId)) + 1;

      const exerciseLog = notionCreatedPage.parse(
        await notionClient.pages.create({
          parent: { data_source_id: config.NOTION_EXERCISE_LOGS_DATABASE_ID },
          properties: buildCreateExerciseLogProperties({
            recordNumber,
            exerciseName,
            rest: exercise.rest,
            memo: exercise.memo,
            exerciseId: exercise.exerciseId,
            trainingLogId: trainingLog.id,
          }) as never,
        }),
      );
      createdIds.push(exerciseLog.id);
      exerciseLogIds.push(exerciseLog.id);

      // 3. セット (並列 + レート制御)
      const setIds = await Promise.all(
        exercise.sets.map((set, index) =>
          notionLimit(async () => {
            const page = notionCreatedPage.parse(
              await notionClient.pages.create({
                parent: {
                  data_source_id: config.NOTION_EXERCISE_SETS_DATABASE_ID,
                },
                properties: buildCreateExerciseSetProperties({
                  setNumber: index + 1,
                  dateKey,
                  exerciseName,
                  kg: set.kg,
                  rep: set.rep,
                  memo: set.memo,
                  exerciseLogId: exerciseLog.id,
                }) as never,
              }),
            );
            return page.id;
          }),
        ),
      );
      createdIds.push(...setIds);
    }

    return {
      id: trainingLog.id,
      url: trainingLog.url,
      exerciseLogIds,
    };
  } catch (error) {
    const detail = createdIds.length
      ? ` (作成済みページ: ${createdIds.join(", ")})`
      : "";
    throw new AppError(
      `トレーニング記録の作成に失敗しました${detail}`,
      500,
      "TRAINING_LOG_CREATE_FAILED",
      { cause: error },
    );
  }
}
