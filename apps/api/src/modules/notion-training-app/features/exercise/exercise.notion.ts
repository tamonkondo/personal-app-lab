import {
  getFormula,
  getRollup,
  getRollupRelationIds,
  getRollupArrayValue,
} from "@/integrations/notion/notion.mapper";
import notionClient from "@/integrations/notion/notion.client";
import {
  ExerciseData,
  ExerciseDetail,
  ExerciseDetailResponse,
  ExerciseResponse,
} from "./exercise.types";
import {
  ExerciseSet,
  ExerciseSummaryResponse,
} from "@repo/types/notion-training-app";
import { ExtractExerciseLogData } from "../exerciseLog/exerciseLog.types";
import { ExerciseLogProperties } from "../exerciseLog/exerciseLog.types";
import {
  ExerciseSetProperties,
  ExtractExerciseSetLog,
} from "../exerciseSet/exerciseSet.types";

// トレーニング種目一覧の取得
export async function fetchExercises() {
  const exercises: ExerciseData = (await notionClient.dataSources.query({
    data_source_id: process.env.NOTION_EXERCISES_DATABASE_ID!,
    filter_properties: [
      "name",
      "maxGoalWeightFormula",
      "currentMaxWeightRollup",
      "maxGoalStatusFormula",
      "musclesTypes",
    ],
  })) as unknown as ExerciseData;

  const responseData: ExerciseResponse[] = exercises.results.map(
    (exercise) => ({
      id: exercise.id,
      name: exercise.properties.name.title?.[0]?.plain_text || "",
      maxGoalWeight:
        Number(
          getFormula(exercise.properties.maxGoalWeightFormula, "number"),
        ) || 0,
      currentMaxWeight:
        Number(
          getRollup(exercise.properties.currentMaxWeightRollup, "number"),
        ) || 0,
      maxGoalStatus:
        getFormula(exercise.properties.maxGoalStatusFormula, "string") || "",
      musclesTypes:
        exercise.properties.musclesTypes.multi_select?.map(
          (muscle) => muscle.name,
        ) || [],
    }),
  );
  return responseData;
}
// トレーニング種目の取得
export async function fetchExerciseDetail(id: string) {
  const exercise: ExerciseDetail = (await notionClient.pages.retrieve({
    page_id: id,
    filter_properties: [
      "name",
      "maxGoalWeightFormula",
      "currentMaxWeightRollup",
      "maxGoalStatusFormula",
      "musclesTypes",
      "trainingRecordRelation",
      "theGoalsWeightRelation",
    ],
  })) as unknown as ExerciseDetail;
  const responseData: ExerciseDetailResponse = {
    id: exercise.id,
    name: exercise.properties.name.title?.[0]?.plain_text || "",
    maxGoalWeight:
      Number(getFormula(exercise.properties.maxGoalWeightFormula, "number")) ||
      0,
    currentMaxWeight:
      Number(getRollup(exercise.properties.currentMaxWeightRollup, "number")) ||
      0,
    maxGoalStatus:
      getFormula(exercise.properties.maxGoalStatusFormula, "string") || "",
    musclesTypes:
      exercise.properties.musclesTypes.multi_select?.map(
        (muscle) => muscle.name,
      ) || [],
    trainingRecordIds:
      exercise.properties.trainingRecordRelation.relation?.map(
        (relation) => relation.id,
      ) || [],
    theGoalsWeightId:
      exercise.properties.theGoalsWeightRelation.relation?.[0]?.id || null,
  };
  return responseData;
}

export async function fetchExerciseSummaryLogs(
  limit: number = 7,
  start_cursor?: string,
): Promise<ExerciseSummaryResponse> {
  // ゴール重量がある種目のみを取得
  const exercises: ExerciseData = (await notionClient.dataSources.query({
    data_source_id: process.env.NOTION_EXERCISES_DATABASE_ID!,
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
            number: {
              is_not_empty: true,
            },
          },
        },
      ],
    },
    filter_properties: [
      "name",
      "musclesTypes",
      "maxGoalStatusFormula",
      "maxGoalWeightRollup",
      "theGoalsWeightRelation",
      "maxWeightExerciseId",
      "latestExerciseId",
      "currentMaxWeightRollup",
    ],
    page_size: limit,
    start_cursor: start_cursor,
  })) as unknown as ExerciseData;
  // 直近のトレーニングログを1件のみ取得
  const extractExerciseSetsProperties = [
    "kg",
    "rep",
    "memo",
    "exerciseNameRollup",
  ] as const satisfies (keyof ExerciseSetProperties)[];
  const extractExerciseProperties = [
    "exerciseSetsRelation",
    "rest",
  ] as const satisfies (keyof ExerciseLogProperties)[];
  type ExtractedExerciseLogProperties =
    (typeof extractExerciseProperties)[number];
  type ExtractedExerciseSetLog = ExtractExerciseSetLog<
    (typeof extractExerciseSetsProperties)[number]
  >;
  const exerciseSetsDTO = (
    data: ExtractedExerciseSetLog | null,
  ): ExerciseSet => ({
    exerciseId:
      getRollupRelationIds(data?.properties.exerciseNameRollup)[0] || "",
    createdTime: data?.created_time || "",
    id: data?.id || "",
    kg: data?.properties.kg.number || 0,
    rep: data?.properties.rep.number || 0,
    memo: data?.properties.memo.rich_text[0]?.plain_text || "",
  });
  // 直近のトレーニング記録を取得
  const latestExerciseLogs = async (): Promise<ExerciseSet[]> => {
    const exerciseLogs: ExtractExerciseLogData<ExtractedExerciseLogProperties>[] =
      (await Promise.all(
        exercises.results.map(async (exercise) => {
          const queryResult = (await notionClient.dataSources.query({
            data_source_id: process.env.NOTION_EXERCISE_LOGS_DATABASE_ID!,
            filter: {
              property: "trainingExerciseRelation",
              relation: {
                contains: exercise.id,
              },
            },
            page_size: 1,
            sorts: [
              {
                timestamp: "created_time",
                direction: "descending",
              },
            ],
            filter_properties: ["exerciseSetsRelation", "rest", "memo"],
          })) as unknown as ExtractExerciseLogData<ExtractedExerciseLogProperties>[];
          return queryResult;
        }),
      )) as unknown as ExtractExerciseLogData<ExtractedExerciseLogProperties>[];
    const relationSetIds = exerciseLogs
      .map((log) => log.results[0]?.properties.exerciseSetsRelation.relation)
      .flat()
      .map((relation) => relation.id);
    // 直近のトレーニング記録の各セットデータを取得
    const exerciseSet: ExerciseSet[] = await Promise.all(
      relationSetIds.map(async (setId) => {
        const setData = (await notionClient.pages.retrieve({
          page_id: setId,
          filter_properties: ["kg", "rep", "memo", "exerciseNameRollup"],
        })) as unknown as ExtractedExerciseSetLog;
        return exerciseSetsDTO(setData);
      }),
    );
    return exerciseSet;
  };
  const goalExerciseLogs = async (): Promise<ExerciseSet[]> => {
    const exerciseLogs: ExtractExerciseLogData<ExtractedExerciseLogProperties>[] =
      (await Promise.all(
        exercises.results.map(async (exercise) => {
          const queryResult = (await notionClient.dataSources.query({
            data_source_id: process.env.NOTION_EXERCISE_LOGS_DATABASE_ID!,
            filter: {
              property: "trainingExerciseRelation",
              relation: {
                contains: exercise.id,
              },
            },
            page_size: 1,
            sorts: [
              {
                property: "todayMaxWeightFormula",
                direction: "descending",
              },
            ],
            filter_properties: ["exerciseSetsRelation", "rest", "memo"],
          })) as unknown as ExtractExerciseLogData<ExtractedExerciseLogProperties>;
          return queryResult;
        }),
      )) as unknown as ExtractExerciseLogData<ExtractedExerciseLogProperties>[];
    const relationSetIds = exerciseLogs
      .map((log) => log.results[0]?.properties.exerciseSetsRelation.relation)
      .flat()
      .map((relation) => relation.id);
    // 直近のトレーニング記録の各セットデータを取得
    const exerciseSet: ExerciseSet[] = await Promise.all(
      relationSetIds.map(async (setId) => {
        const setData = (await notionClient.pages.retrieve({
          page_id: setId,
          filter_properties: ["kg", "rep", "memo", "exerciseNameRollup"],
        })) as unknown as ExtractedExerciseSetLog;
        return exerciseSetsDTO(setData);
      }),
    );
    return exerciseSet;
  };
  const maxWeightSets = await goalExerciseLogs();
  const latestSets = await latestExerciseLogs();

  const responseData: ExerciseSummaryResponse = {
    data: exercises.results.map((log) => ({
      id: log.id,
      musclesTypes:
        log.properties.musclesTypes.multi_select?.map(
          (muscle) => muscle.name,
        ) || [],
      trainingName: log.properties.name.title?.[0]?.plain_text || "",
      maxGoalWeight:
        getRollupArrayValue(log.properties.maxGoalWeightRollup, "number") || 0,
      currentMaxWeight:
        Number(getRollup(log.properties.currentMaxWeightRollup, "number")) || 0,

      isPr:
        Number(getRollup(log.properties.currentMaxWeightRollup, "number")) >
        (getRollupArrayValue(log.properties.maxGoalWeightRollup, "number") ||
          0),
      maxWeightSets: maxWeightSets.filter((set) => set.exerciseId === log.id),
      latestSets: latestSets.filter((set) => set.exerciseId === log.id),
    })),
    next_cursor: exercises.next_cursor || undefined,
    has_more: exercises.has_more,
  };
  return responseData;
}
