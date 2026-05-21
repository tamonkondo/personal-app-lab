import {
  getFormula,
  getRollup,
  getTitle,
} from "@/integrations/notion/notion.mapper";
import notionClient from "@/integrations/notion/notion.client";
import {
  ExerciseData,
  ExerciseDetail,
  ExerciseDetailResponse,
  ExerciseResponse,
} from "./exercise.types";

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
      name: getTitle(exercise.properties.name),
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
    name: getTitle(exercise.properties.name),
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
