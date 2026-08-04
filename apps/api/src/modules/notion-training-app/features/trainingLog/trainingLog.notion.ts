import notionClient from "@/integrations/notion/notion.client";
import { config } from "@/libs/config";
import { AppError } from "@/libs/errors";
import notionLimit from "@/libs/notion/notionLimit";
import {
  notionCreatedPage,
  notionQueryEnvelope,
  toPaginationMeta,
} from "@/integrations/notion/notion.schema";
import type {
  CreateTrainingLogInput,
  UpdateTrainingLogInput,
  UpdateTrainingLogSetInput,
} from "@repo/schemas/notion-training-app";
import { mapExerciseName } from "../exercise/exercise.db";
import {
  exerciseLogProp,
  buildCreateExerciseLogProperties,
  buildUpdateExerciseLogProperties,
} from "../exerciseLog/exerciseLog.db";
import {
  buildCreateExerciseSetProperties,
  buildUpdateExerciseSetProperties,
} from "../exerciseSet/exerciseSet.db";
import type {
  CreateTrainingLogResult,
  DeleteTrainingLogResult,
  NewestTrainingLogItemResponse,
  TrainingLogDetail,
  TrainingLogSummaryResponse,
  UpdateTrainingLogResult,
} from "@repo/types/notion-training-app";
import { SortOrder } from "@repo/types";
import {
  buildCreateTrainingLogProperties,
  buildUpdateTrainingLogProperties,
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

  // 期間フィルタは記録日 (date プロパティ) を見る。
  // date 未設定の旧レコードはヒットしないため、バックフィル済みであることが前提
  const dateFilters = [
    startDate
      ? {
          property: trainingLogProp("date"),
          date: {
            on_or_after: startDate,
          },
        }
      : undefined,
    endDate
      ? {
          property: trainingLogProp("date"),
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
              property: trainingLogProp("date"),
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
          property: trainingLogProp("date"),
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
 * トレーニング記録の作成。
 * 記録日は input.date (YYYY-MM-DD) を採用し、省略時は当日とする (過去日付の記録に対応)。
 * TRAINING_LOGS → 種目ごとの EXERCISE_LOGS → セットごとの EXERCISE_SETS の順に作成する。
 * 途中失敗時のロールバックは行わず、作成済みページ ID をエラーに含めて返す
 * (Notion 上で手直しできるようにするため)。
 */
export async function createTrainingLog(
  input: CreateTrainingLogInput,
): Promise<CreateTrainingLogResult> {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const dateName = input.date ?? today;
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
            date: dateName,
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

/** 種目ログとそのセットをまとめてアーカイブ (ゴミ箱へ) する */
async function archiveExerciseLogWithSets(
  exerciseLogId: string,
  setIds: string[],
): Promise<void> {
  await Promise.all(
    setIds.map((setId) =>
      notionLimit(() =>
        notionClient.pages.update({ page_id: setId, in_trash: true }),
      ),
    ),
  );
  await notionClient.pages.update({ page_id: exerciseLogId, in_trash: true });
}

/**
 * 既存の種目ログ配下のセットを入力 (あるべき状態) へ差分同期する。
 * - setId を持つセットは更新、持たないセットは新規作成
 * - 入力に含まれない既存セットはアーカイブ
 */
async function reconcileExerciseSets(params: {
  exerciseLogId: string;
  exerciseName: string;
  dateKey: string; // YYYYMMDD
  currentSetIds: string[];
  inputSets: UpdateTrainingLogSetInput[];
}): Promise<void> {
  const { exerciseLogId, exerciseName, dateKey, currentSetIds, inputSets } =
    params;

  const keepSetIds = new Set(
    inputSets
      .map((set) => set.setId)
      .filter((setId): setId is string => !!setId),
  );
  const removedSetIds = currentSetIds.filter(
    (setId) => !keepSetIds.has(setId),
  );

  await Promise.all([
    ...removedSetIds.map((setId) =>
      notionLimit(() =>
        notionClient.pages.update({ page_id: setId, in_trash: true }),
      ),
    ),
    ...inputSets.map((set, index) =>
      notionLimit(async () => {
        if (set.setId) {
          await notionClient.pages.update({
            page_id: set.setId,
            properties: buildUpdateExerciseSetProperties({
              kg: set.kg,
              rep: set.rep,
              memo: set.memo,
            }) as never,
          });
          return;
        }
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
            exerciseLogId,
          }) as never,
        });
      }),
    ),
  ]);
}

/**
 * トレーニング記録の更新。
 * 入力のネスト全体を「あるべき状態」として受け取り、
 * TRAINING_LOGS 本体 → 種目ごとの EXERCISE_LOGS → セットごとの EXERCISE_SETS を差分同期する。
 * - logId / setId を持つ要素は更新、持たない要素は新規作成
 * - 入力に含まれない既存の種目ログ / セットはアーカイブ (削除)
 * 作成と同様、途中失敗時のロールバックは行わない。
 */
export async function updateTrainingLog(
  id: string,
  input: UpdateTrainingLogInput,
): Promise<UpdateTrainingLogResult> {
  // 現在の状態を取得 (存在確認 + 既存の種目ログ / セット ID の把握)
  const current = await fetchTrainingLogDetail(id);
  if (!current) {
    throw new AppError(
      "更新対象のトレーニング記録が見つかりません",
      404,
      "TRAINING_LOG_NOT_FOUND",
    );
  }

  // セット名の採番などに使う記録日は元の記録日ベース (date プロパティ優先の値)
  const recordDate = current.createdTime.slice(0, 10); // YYYY-MM-DD
  const dateKey = recordDate.replaceAll("-", "");

  // 既存の種目ログを logId で引けるようにする
  const currentLogsById = new Map(
    current.exercises.map((exercise) => [
      exercise.exerciseSets.exerciseLogId,
      exercise,
    ]),
  );

  try {
    // 1. トレーニングログ本体を更新
    const trainingLog = notionCreatedPage.parse(
      await notionClient.pages.update({
        page_id: id,
        properties: buildUpdateTrainingLogProperties({
          bodyWeight: input.bodyWeight,
          memo: input.memo,
        }) as never,
      }),
    );

    // 2. 入力に残っていない既存の種目ログ (とそのセット) をアーカイブ
    const keepLogIds = new Set(
      input.exercises
        .map((exercise) => exercise.logId)
        .filter((logId): logId is string => !!logId),
    );
    for (const [logId, currentLog] of currentLogsById) {
      if (keepLogIds.has(logId)) continue;
      await archiveExerciseLogWithSets(
        logId,
        currentLog.exerciseSets.sets.map((set) => set.id),
      );
    }

    // 3. 入力の種目を upsert (連番採番があるため直列で処理)
    const exerciseLogIds: string[] = [];
    for (const exercise of input.exercises) {
      const existing = exercise.logId
        ? currentLogsById.get(exercise.logId)
        : undefined;

      if (existing) {
        // 3a. 既存の種目ログ: rest / memo を更新し、セットを差分同期
        const exerciseLogId = existing.exerciseSets.exerciseLogId;
        await notionClient.pages.update({
          page_id: exerciseLogId,
          properties: buildUpdateExerciseLogProperties({
            rest: exercise.rest,
            memo: exercise.memo,
          }) as never,
        });
        await reconcileExerciseSets({
          exerciseLogId,
          exerciseName: existing.trainingName,
          dateKey,
          currentSetIds: existing.exerciseSets.sets.map((set) => set.id),
          inputSets: exercise.sets,
        });
        exerciseLogIds.push(exerciseLogId);
      } else {
        // 3b. 新規の種目ログ: 作成フローと同じ手順で作成
        const exerciseName = mapExerciseName(
          await notionClient.pages.retrieve({
            page_id: exercise.exerciseId,
            filter_properties: ["name"],
          }),
        ).name;
        const recordNumber =
          (await countExerciseLogs(exercise.exerciseId)) + 1;

        const exerciseLog = notionCreatedPage.parse(
          await notionClient.pages.create({
            parent: {
              data_source_id: config.NOTION_EXERCISE_LOGS_DATABASE_ID,
            },
            properties: buildCreateExerciseLogProperties({
              recordNumber,
              exerciseName,
              date: recordDate,
              rest: exercise.rest,
              memo: exercise.memo,
              exerciseId: exercise.exerciseId,
              trainingLogId: id,
            }) as never,
          }),
        );
        exerciseLogIds.push(exerciseLog.id);

        await Promise.all(
          exercise.sets.map((set, index) =>
            notionLimit(async () => {
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
              });
            }),
          ),
        );
      }
    }

    return {
      id: trainingLog.id,
      url: trainingLog.url,
      exerciseLogIds,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "トレーニング記録の更新に失敗しました",
      500,
      "TRAINING_LOG_UPDATE_FAILED",
      { cause: error },
    );
  }
}

/**
 * トレーニング記録の削除。
 * 紐づく種目ごとの EXERCISE_LOGS とそのセット EXERCISE_SETS、
 * および TRAINING_LOGS 本体をまとめてアーカイブ (ゴミ箱へ) する。
 * Notion のアーカイブは復元可能なため物理削除ではない。
 */
export async function deleteTrainingLog(
  id: string,
): Promise<DeleteTrainingLogResult> {
  const current = await fetchTrainingLogDetail(id);
  if (!current) {
    throw new AppError(
      "削除対象のトレーニング記録が見つかりません",
      404,
      "TRAINING_LOG_NOT_FOUND",
    );
  }

  try {
    // 種目ログ + セットを先にアーカイブ
    for (const exercise of current.exercises) {
      await archiveExerciseLogWithSets(
        exercise.exerciseSets.exerciseLogId,
        exercise.exerciseSets.sets.map((set) => set.id),
      );
    }
    // 最後にトレーニングログ本体をアーカイブ
    await notionClient.pages.update({ page_id: id, in_trash: true });
    return { id };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "トレーニング記録の削除に失敗しました",
      500,
      "TRAINING_LOG_DELETE_FAILED",
      { cause: error },
    );
  }
}
