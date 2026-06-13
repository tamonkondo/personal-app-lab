import notionClient from "@/integrations/notion/notion.client";
import {
  ExerciseLogData,
  ExerciseLogProperties,
  ExerciseLogsResponse,
  ExtractExerciseLogData,
} from "./exerciseLog.types";
import {
  getFormula,
  getRelatonIds,
  getRollup,
} from "@/integrations/notion/notion.mapper";
import {
  ExerciseSetProperties,
  ExtractExerciseSetLog,
} from "../exerciseSet/exerciseSet.types";
import {
  ExerciseSet,
  ExerciseLogWithSets,
} from "@repo/types/notion-training-app";
import { ExerciseData } from "../exercise/exercise.types";
import { NotionQueryDataSourceBodyParameters } from "@/integrations/notion/notion.types";
export async function fetchExerciseLogs(
  exerciseId: string,
  limit: number = 20,
  start_cursor?: string,
) {
  const logs: ExerciseLogData = (await notionClient.dataSources.query({
    data_source_id: process.env.NOTION_EXERCISE_LOGS_DATABASE_ID!,
    filter: {
      property: "trainingExerciseRelation",
      relation: {
        contains: exerciseId,
      },
    },
    filter_properties: [
      "todayMaxWeightRollup",
      "exerciseSetsRelation",
      "rest",
      "trainingNameFormula",
      "createdDate",
    ],
    page_size: limit,
    start_cursor: start_cursor,
  })) as unknown as ExerciseLogData;
  const responseData: ExerciseLogsResponse = {
    data: logs.results.map((log) => ({
      id: log.id,
      createdTime: log.created_time,
      todayMaxWeight:
        getRollup(log.properties.todayMaxWeightRollup, "number") || 0,
      rest: log.properties.rest.number || 0,
      trainingName:
        getFormula(log.properties.trainingNameFormula, "string") || "",
      exerciseSetsIds: log.properties.exerciseSetsRelation.relation.map(
        (relation) => relation.id,
      ),
    })),
    next_cursor: logs.next_cursor || undefined,
    has_more: logs.has_more,
  };
  return responseData;
}

interface FetchExerciseLogWithSets {
  exercises: ExerciseData;
  sorts: NotionQueryDataSourceBodyParameters["sorts"];
}

export async function fetchExerciseLogWithSets({
  exercises,
  sorts,
}: FetchExerciseLogWithSets) {
  const extractExerciseSetsProperties = [
    "kg",
    "rep",
    "memo",
    "exerciseNameRollup",
    "maxWeightFormula",
  ] as const satisfies (keyof ExerciseSetProperties)[];
  const extractExerciseProperties = [
    "exerciseSetsRelation",
    "rest",
    "trainingNameFormula",
    "memo",
  ] as const satisfies (keyof ExerciseLogProperties)[];
  type ExtractedExerciseLogProperties =
    (typeof extractExerciseProperties)[number];
  type ExtractedExerciseSetLog = ExtractExerciseSetLog<
    (typeof extractExerciseSetsProperties)[number]
  >;

  const exerciseSetsDTO = (
    data: ExtractedExerciseSetLog | null,
  ): ExerciseSet => ({
    exerciseId: getRollup(data?.properties.exerciseNameRollup, "string") || "",
    id: data?.id || "",
    kg: data?.properties.kg.number || 0,
    rep: data?.properties.rep.number || 0,
    memo: data?.properties.memo.rich_text[0]?.plain_text || "",
    maxWeight: getFormula(data?.properties.maxWeightFormula, "number") || 0,
    notionUrl: data?.url || "",
  });

  const exerciseLogs: ExerciseLogWithSets[] = (await Promise.all(
    exercises.results.map(async (exercise) => {
      const exerciseLog = (await notionClient.dataSources.query({
        data_source_id: process.env.NOTION_EXERCISE_LOGS_DATABASE_ID!,
        filter: {
          property: "trainingExerciseRelation",
          relation: {
            contains: exercise.id,
          },
        },
        page_size: 1,
        sorts: sorts,
        filter_properties: extractExerciseProperties,
      })) as unknown as ExtractExerciseLogData<ExtractedExerciseLogProperties>;
      const relationIds = getRelatonIds(
        exerciseLog.results[0]?.properties.exerciseSetsRelation,
      );
      const exerciseSet: ExerciseSet[] = await Promise.all(
        relationIds.map(async (setId) => {
          const setData = (await notionClient.pages.retrieve({
            page_id: setId,
            filter_properties: extractExerciseSetsProperties,
          })) as unknown as ExtractedExerciseSetLog;
          return exerciseSetsDTO(setData);
        }),
      );
      return {
        exerciseId: exercise.id,
        rest: exerciseLog.results[0]?.properties.rest.number || 0,
        trainingName:
          getFormula(
            exerciseLog.results[0]?.properties.trainingNameFormula,
            "string",
          ) || "",
        createdTime: exerciseLog.results[0]?.created_time,
        sets: exerciseSet,
        notionUrl: exerciseLog.results[0].url,
      };
    }),
  )) as unknown as ExerciseLogWithSets[];
  return exerciseLogs;
}

// トレーニング種目の取得、ただしゴールデータがあるものに限定する
