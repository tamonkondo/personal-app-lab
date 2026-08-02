import notionClient from "@/integrations/notion/notion.client";
import { config } from "@/libs/config";
import { AppError, NotFoundError } from "@/libs/errors";
import {
  notionCreatedPage,
  notionQueryEnvelope,
  toPaginationMeta,
} from "@/integrations/notion/notion.schema";
import type {
  ExerciseLogWithSetsResponse,
  ExerciseSummaryResponse,
  ExerciseDetail,
  ExerciseTrendPeriod,
  ExerciseTrends,
  CreateExerciseResult,
  UpdateExerciseResult,
  DeleteExerciseResult,
} from "@repo/types/notion-training-app";
import type {
  CreateExerciseInput,
  UpdateExerciseInput,
} from "@repo/schemas/notion-training-app";

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
  trendPeriodStart,
  buildExerciseTrendPoints,
  buildCreateExerciseProperties,
  buildUpdateExerciseProperties,
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

/**
 * 種目の重量トレンド (期間指定つき時系列) を取得する。
 * 目標重量は種目ページから、時系列は期間内の種目ログ (+セット) から組み立てる。
 * 期間フィルタ/ソートは DB プロパティに依存しない built-in の
 * timestamp (created_time) を使う。
 */
export async function fetchExerciseTrends(
  exerciseId: string,
  period: ExerciseTrendPeriod = "4w",
): Promise<ExerciseTrends> {
  const raw = await notionClient.pages
    .retrieve({
      page_id: exerciseId,
      filter_properties: [exerciseProp("maxGoalWeightRollup")],
    })
    .catch(() => {
      throw new NotFoundError(`Exercise not found: ${exerciseId}`);
    });
  const { maxGoalWeight } = mapExerciseTrends(raw);

  const since = trendPeriodStart(period, new Date());
  const relationFilter = {
    property: exerciseLogProp("exerciseRelation"),
    relation: { contains: exerciseId },
  };

  // 期間内の種目ログを全件取得 (ページネーション)
  const results: unknown[] = [];
  let cursor: string | undefined;
  do {
    const envelope = notionQueryEnvelope.parse(
      await notionClient.dataSources.query({
        data_source_id: config.NOTION_EXERCISE_LOGS_DATABASE_ID,
        filter: since
          ? {
              and: [
                relationFilter,
                {
                  timestamp: "created_time",
                  created_time: { on_or_after: since },
                },
              ],
            }
          : relationFilter,
        sorts: [{ timestamp: "created_time", direction: "ascending" }],
        filter_properties: [...exerciseLogWithSetsProperties],
        page_size: 100,
        start_cursor: cursor,
      }),
    );
    results.push(...envelope.results);
    cursor = envelope.next_cursor ?? undefined;
  } while (cursor);

  const logs = mapExerciseLogsWithSets({ results, exerciseId });

  return {
    maxGoalWeight,
    period,
    points: buildExerciseTrendPoints(logs),
  };
}

/** 種目マスタの作成 */
export async function createExercise(
  input: CreateExerciseInput,
): Promise<CreateExerciseResult> {
  const page = notionCreatedPage.parse(
    await notionClient.pages.create({
      parent: { data_source_id: config.NOTION_EXERCISES_DATABASE_ID },
      properties: buildCreateExerciseProperties(input) as never,
    }),
  );
  return { id: page.id, url: page.url };
}

/** 種目マスタの更新 (undefined のフィールドは変更しない) */
export async function updateExercise(
  exerciseId: string,
  input: UpdateExerciseInput,
): Promise<UpdateExerciseResult> {
  // 存在確認 (更新自体の失敗を 404 に丸めないよう retrieve と分ける)
  await notionClient.pages
    .retrieve({ page_id: exerciseId, filter_properties: ["name"] })
    .catch(() => {
      throw new NotFoundError(`Exercise not found: ${exerciseId}`);
    });

  await notionClient.pages.update({
    page_id: exerciseId,
    properties: buildUpdateExerciseProperties(input) as never,
  });
  return { id: exerciseId };
}

/** 種目に記録 (種目ログ) が1件でも紐づいているか */
async function hasExerciseLogs(exerciseId: string): Promise<boolean> {
  const envelope = notionQueryEnvelope.parse(
    await notionClient.dataSources.query({
      data_source_id: config.NOTION_EXERCISE_LOGS_DATABASE_ID,
      filter: {
        property: exerciseLogProp("exerciseRelation"),
        relation: { contains: exerciseId },
      },
      filter_properties: [exerciseLogProp("rest")],
      page_size: 1,
    }),
  );
  return envelope.results.length > 0;
}

/**
 * 種目マスタの削除 (アーカイブ)。
 * 記録が紐づいている種目は履歴の整合性が壊れるため 409 で拒否する。
 */
export async function deleteExercise(
  exerciseId: string,
): Promise<DeleteExerciseResult> {
  await notionClient.pages
    .retrieve({ page_id: exerciseId, filter_properties: ["name"] })
    .catch(() => {
      throw new NotFoundError(`Exercise not found: ${exerciseId}`);
    });

  if (await hasExerciseLogs(exerciseId)) {
    throw new AppError(
      "この種目には記録が残っているため削除できません",
      409,
      "EXERCISE_HAS_LOGS",
    );
  }

  await notionClient.pages.update({ page_id: exerciseId, in_trash: true });
  return { id: exerciseId };
}
