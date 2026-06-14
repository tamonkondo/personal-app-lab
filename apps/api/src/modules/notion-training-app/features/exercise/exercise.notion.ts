import {
  getFormula,
  getRollup,
  getRollupArrayValue,
} from "@/integrations/notion/notion.mapper";
import notionClient from "@/integrations/notion/notion.client";
import {
  ExerciseData,
  ExerciseDetail,
  ExerciseDetailResponse,
  ExerciseProperties,
  ExerciseResponse,
} from "./exercise.types";
import { ExerciseSummaryResponse } from "@repo/types/notion-training-app";
import { fetchExerciseLogWithSets } from "../exerciseLog/exerciseLog.notion";

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
  console.time("fetchExerciseSummaryLogs");
  const exercisesFilterProperties = [
    "name",
    "musclesTypes",
    "maxGoalStatusFormula",
    "maxGoalWeightRollup",
    "theGoalsWeightRelation",
    "maxWeightExerciseLogId",
    "latestExerciseLogId",
    "currentMaxWeightRollup",
  ] as const satisfies (keyof ExerciseProperties)[];
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
    filter_properties: exercisesFilterProperties,
    page_size: limit,
    start_cursor: start_cursor,
  })) as unknown as ExerciseData;

  const exerciseLogWithSets = await fetchExerciseLogWithSets({
    exercises,
  });

  const exerciseLogWithSetsMap = new Map(
    exerciseLogWithSets.map((log) => [log.exerciseId, log]),
  );

  const responseData: ExerciseSummaryResponse = {
    data: exercises.results.map((log) => {
      const logWithSets = exerciseLogWithSetsMap.get(log.id);
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
        maxWeightSets: logWithSets?.maxWeightSets,
        latestSets: logWithSets?.latestSets,
      };
    }),

    next_cursor: exercises.next_cursor || undefined,

    has_more: exercises.has_more,
  };
  console.timeEnd("fetchExerciseSummaryLogs");
  return responseData;
}
