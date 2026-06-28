import notionClient from "@/integrations/notion/notion.client";
import notionLimit from "@/libs/notion/notionLimit";
import {
  getFormula,
  getRelationIds,
  getRollup,
  getTitle,
} from "@/integrations/notion/notion.mapper";
import type {
  NotionTrainingLogPage,
  NotionTrainingLogQueryResult,
} from "./trainingLog.types";
import type { NotionExerciseSetWeightPage } from "../exerciseSet/exerciseSet.types";
import type {
  NotionExerciseLogPage,
  NotionExerciseLogProperties,
} from "../exerciseLog/exerciseLog.types";
import type {
  NewestTrainingLogItemResponse,
  TrainingLogDetail,
  TrainingLogSummaryResponse,
} from "@repo/types/notion-training-app/index";
import { parseExerciseSetsText } from "../exerciseSet/exerciseSet.lib";
import { SortOrder } from "@repo/types";

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
        property: "musleTypesFormulaWrapper",
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
          property: "createdTime",
          date: {
            on_or_after: startDate,
          },
        }
      : undefined,
    endDate
      ? {
          property: "createdTime",
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
      data_source_id: process.env.NOTION_TRAINING_LOGS_DATABASE_ID!,
      page_size: limit,
      start_cursor: cursor,
      filter_properties: [
        "trainingExercisesRelation",
        "createdTime",
        "bodyWeight",
        "memo",
        "musleTypesFormulaWrapper",
      ],
      filter: filters,
      sorts: sort
        ? [
            {
              property: "createdTime",
              direction: sort === "asc" ? "ascending" : "descending",
            },
          ]
        : undefined,
    })) as unknown as NotionTrainingLogQueryResult;
  const exercisesRelationIds = trainingLogs.results.flatMap(
    (trainingLog) =>
      getRelationIds(trainingLog.properties.trainingExercisesRelation) || [],
  );
  const extractExerciseProperties = [
    "exerciseSetsRelation",
    "todayMaxWeightRollup",
    "trainingNameFormula",
    "memo",
    "rest",
  ] as const satisfies (keyof NotionExerciseLogProperties)[];
  const exerciseLogs: NotionExerciseLogPage<
    (typeof extractExerciseProperties)[number]
  >[] = (await Promise.all(
    exercisesRelationIds.map((id) =>
      notionLimit(() =>
        notionClient.pages.retrieve({
          page_id: id,
          filter_properties: [...extractExerciseProperties],
        }),
      ),
    ),
  )) as unknown as NotionExerciseLogPage<
    (typeof extractExerciseProperties)[number]
  >[];
  const responseData: FetchTrainingLogsResult = {
    data: trainingLogs.results.map((trainingLog) => ({
      id: trainingLog.id,
      createdTime: trainingLog.properties.createdTime.created_time,
      bodyWeight: trainingLog.properties.bodyWeight.number || 0,
      memo: trainingLog.properties.memo.rich_text[0]?.plain_text || "",
      exercises: exerciseLogs
        .filter((exerciseLog) =>
          trainingLog.properties.trainingExercisesRelation.relation?.some(
            (relation) => relation.id === exerciseLog.id,
          ),
        )
        .map((exerciseLog) => ({
          name:
            getFormula(exerciseLog.properties.trainingNameFormula, "string") ||
            "",
          todayMaxWeight:
            Number(
              getRollup(exerciseLog.properties.todayMaxWeightRollup, "number"),
            ) || 0,
          rest: exerciseLog.properties.rest.number || 0,
          memo: getTitle(exerciseLog.properties.memo),
          sets:
            getRelationIds(exerciseLog.properties.exerciseSetsRelation)
              ?.length || 0,
        })),
    })),
    meta: {
      next_cursor: trainingLogs.next_cursor || undefined,
      has_more: trainingLogs.has_more,
    },
  };
  return responseData;
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
  const trainingLogProperties = trainingLog.properties;
  console.log(trainingLog);
  if (!trainingLog) {
    return null;
  }
  const totalExerciseCount =
    trainingLogProperties.trainingExercisesRelation.relation?.length || 0;

  const exercisesRelationIds =
    getRelationIds(trainingLog.properties.trainingExercisesRelation) || [];
  const extractExerciseProperties = [
    "exerciseSetsRelation",
    "todayMaxWeightRollup",
    "trainingNameFormula",
    "setsJsonFormula",
    "muslesTypesRollup",
    "memo",
    "rest",
    "goalWeightRollup",
  ] as const satisfies (keyof NotionExerciseLogProperties)[];
  // 種目ごとの記録データを取得
  const exerciseLogs = (await Promise.all(
    exercisesRelationIds.map((id) =>
      notionLimit(() =>
        notionClient.pages.retrieve({
          page_id: id,
          filter_properties: [...extractExerciseProperties],
        }),
      ),
    ),
  )) as unknown as NotionExerciseLogPage<
    (typeof extractExerciseProperties)[number]
  >[];

  const exercises: TrainingLogDetail["exercises"] = exerciseLogs.map(
    (exerciseLog) => {
      return {
        id: exerciseLog.id,
        trainingName:
          getFormula(exerciseLog.properties.trainingNameFormula, "string") ||
          "",
        maxGoalWeight:
          getRollup(exerciseLog.properties.goalWeightRollup, "number") || 0,
        currentMaxWeight:
          getRollup(exerciseLog.properties.todayMaxWeightRollup, "number") || 0,
        isPr:
          getRollup(exerciseLog.properties.todayMaxWeightRollup, "number") ===
          getRollup(exerciseLog.properties.goalWeightRollup, "number"),
        musclesTypes:
          getFormula(exerciseLog.properties.muslesTypesRollup, "string")
            ?.split(",")
            .map((part) => part.trim()) || [],
        exerciseSets: {
          exerciseId: exerciseLog.id,
          createdTime: exerciseLog.created_time,
          rest: exerciseLog.properties.rest.number || 0,
          trainingName:
            getFormula(exerciseLog.properties.trainingNameFormula, "string") ||
            "",
          sets: parseExerciseSetsText(
            getFormula(exerciseLog.properties.setsJsonFormula, "string"),
            exerciseLog.id,
          ),
          notionUrl: exerciseLog.url,
        },
      };
    },
  );
  const totalSetsCount = exercises.reduce(
    (acc, exercise) => acc + exercise.exerciseSets.sets.length,
    0,
  );
  const totalTrainingVolumeWeight = exercises.reduce(
    (acc, exercise) =>
      acc +
      exercise.exerciseSets.sets.reduce(
        (setAcc, set) => setAcc + set.kg * set.rep,
        0,
      ),
    0,
  );
  const responseData: TrainingLogDetail = {
    id: trainingLog.id,
    createdTime: trainingLogProperties.createdTime.created_time,
    bodyParts:
      getFormula(trainingLogProperties.musleTypesFormula, "string")
        ?.split(",")
        .map((part) => part.trim()) || [],
    memo: trainingLogProperties.memo.rich_text[0]?.plain_text || "",
    bodyWeight: trainingLogProperties.bodyWeight.number || 0,
    totalExerciseCount,
    totalSetsCount,
    totalTrainingVolumeWeight,
    exercises,
  };
  return responseData;
}
// 最新のトレーニングログを1件取得するクエリ
export async function fetchNewestTrainingLog(): Promise<NewestTrainingLogItemResponse | null> {
  /**
   * 取得したいもの
   * ・日付、メモ、種目数、セット数、総重量数
   */
  const newestLog = await notionClient.dataSources.query({
    data_source_id: process.env.NOTION_TRAINING_LOGS_DATABASE_ID!,
    page_size: 1,
    sorts: [
      {
        property: "createdTime",
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
            filter_properties: ["exerciseSetsRelation"],
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
          filter_properties: ["kg", "rep"],
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

  const responseData: NewestTrainingLogItemResponse = {
    id: log.id,
    createdTime: log.properties.createdTime.created_time,
    bodyWeight: log.properties.bodyWeight.number || 0,
    memo: log.properties.memo.rich_text[0]?.plain_text || "",
    exerciseCount: relationIds?.length || 0,
    totalWeight,
  };
  return responseData;
}
