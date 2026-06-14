import notionClient from "@/integrations/notion/notion.client";
import {
  ExerciseLogData,
  ExerciseLogProperties,
  ExerciseLogsResponse,
  ExtractExerciseLog,
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

interface Props {
  exercises: ExerciseData;
}

interface FetchExerciseLogWithSetsRes {
  exerciseId: string;
  maxWeightSets: ExerciseLogWithSets;
  latestSets: ExerciseLogWithSets;
}

export async function fetchExerciseLogWithSets({
  exercises,
}: Props): Promise<FetchExerciseLogWithSetsRes[]> {
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
  /* exercisesからlatestExerciseLogIdとmaxWeightExerciseLogIdを抜き取る*/
  const exerciseLogIds = () => {
    // latestExerciseLogId
    const latestExerciseLogIds = exercises.results.map((exercise) =>
      getFormula(exercise.properties.latestExerciseLogId, "string"),
    );
    // maxWeightExerciseLogId
    const maxWeightExerciseLogIds = exercises.results.map((exercise) =>
      getFormula(exercise.properties.maxWeightExerciseLogId, "string"),
    );
    return [...latestExerciseLogIds, ...maxWeightExerciseLogIds].filter(
      (id): id is string => typeof id === "string" && id.length > 0,
    );
  };

  const exerciseLogs: ExerciseLogWithSets[] = (await Promise.all(
    exerciseLogIds().map(async (exerciseLogId) => {
      const exerciseLog = (await notionClient.pages.retrieve({
        page_id: exerciseLogId,
        filter_properties: extractExerciseProperties,
      })) as unknown as ExtractExerciseLog<ExtractedExerciseLogProperties>;
      const relationIds = getRelatonIds(
        exerciseLog?.properties.exerciseSetsRelation,
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
        exerciseId: exerciseLogId,
        rest: exerciseLog.properties.rest.number || 0,
        trainingName:
          getFormula(exerciseLog.properties.trainingNameFormula, "string") ||
          "",
        createdTime: exerciseLog.created_time,
        sets: exerciseSet,
        notionUrl: exerciseLog.url,
      };
    }),
  )) as unknown as ExerciseLogWithSets[];
  // exerciseIdをキーにして、maxWeightExerciseLogとlatestExerciseLogを振り分ける
  const exerciseIdToLogsMap: Record<
    string,
    {
      maxWeightLog: ExerciseLogWithSets | null;
      latestLog: ExerciseLogWithSets | null;
    }
  > = {};
  exercises.results.forEach((exercise) => {
    const exerciseId = exercise.id;
    const latestExerciseLogId = getFormula(
      exercise.properties.latestExerciseLogId,
      "string",
    );
    const maxWeightExerciseLogId = getFormula(
      exercise.properties.maxWeightExerciseLogId,
      "string",
    );
    exerciseIdToLogsMap[exerciseId] = {
      maxWeightLog:
        exerciseLogs.find((log) => log.exerciseId === maxWeightExerciseLogId) ||
        null,
      latestLog:
        exerciseLogs.find((log) => log.exerciseId === latestExerciseLogId) ||
        null,
    };
  });
  const responseData: FetchExerciseLogWithSetsRes[] = Object.entries(
    exerciseIdToLogsMap,
  ).map(([exerciseId, { maxWeightLog, latestLog }]) => ({
    exerciseId,
    maxWeightSets: maxWeightLog || {
      exerciseId,
      rest: 0,
      trainingName: "",
      createdTime: "",
      sets: [],
      notionUrl: "",
    },
    latestSets: latestLog || {
      exerciseId,
      rest: 0,
      trainingName: "",
      createdTime: "",
      sets: [],
      notionUrl: "",
    },
  }));
  return responseData;
}

// トレーニング種目の取得、ただしゴールデータがあるものに限定する
