import notionClient from "@/integrations/notion/notion.client";
import {
  ExerciseLogData,
  ExerciseLogProperties,
  ExerciseLogsResponse,
  ExtractExerciseLog,
} from "./exerciseLog.types";
import { getFormula, getRollup } from "@/integrations/notion/notion.mapper";

import {
  ExerciseSet,
  ExerciseLogWithSets,
} from "@repo/types/notion-training-app";
import { ExerciseData } from "../exercise/exercise.types";
import notionLimit from "@/libs/notion/notionLimit";
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
  const extractExerciseProperties = [
    "exerciseSetsRelation",
    "rest",
    "trainingNameFormula",
    "memo",
    "setsJsonFormula",
  ] as const satisfies (keyof ExerciseLogProperties)[];
  type ExtractedExerciseLogProperties =
    (typeof extractExerciseProperties)[number];

  /* exercisesからlatestExerciseLogIdとmaxWeightExerciseLogIdを抜き取り、重複を除外する */
  const exerciseLogIds = () =>
    [
      ...new Set(
        exercises.results.flatMap((exercise) => [
          getFormula(exercise.properties.latestExerciseLogId, "string"),
          getFormula(exercise.properties.maxWeightExerciseLogId, "string"),
        ]),
      ),
    ].filter((id): id is string => typeof id === "string" && id.length > 0);
  console.log("log count", exerciseLogIds().length);
  const parseSetsText = (value: string | null | undefined): ExerciseSet[] => {
    if (!value) return [];
    return value
      .replace(/^\[/, "")
      .replace(/\]$/, "")
      .split(";;")
      .map((row) => row.replace(/^,/, "").trim())
      .filter(Boolean)
      .map((row) => {
        const [kg, rep, memo, exerciseName, maxWeight] = row.split("|");
        return {
          exerciseId: exerciseName?.replace(/^@/, "") || "",
          id: "",
          kg: Number(kg) || 0,
          rep: Number(rep) || 0,
          memo: memo || "",
          maxWeight: Number(maxWeight) || 0,
          notionUrl: "",
        };
      });
  };
  console.time("exerciseLogs");
  const exerciseLogs = await Promise.all(
    exerciseLogIds().map(async (exerciseLogId) => {
      const exerciseLog = (await notionLimit(() =>
        notionClient.pages.retrieve({
          page_id: exerciseLogId,
          filter_properties: extractExerciseProperties,
        }),
      )) as unknown as ExtractExerciseLog<ExtractedExerciseLogProperties>;

      return {
        exerciseLogId,
        exerciseLog: {
          exerciseId: exerciseLog.id,
          rest: exerciseLog.properties.rest.number || 0,
          trainingName:
            getFormula(exerciseLog.properties.trainingNameFormula, "string") ||
            "",
          createdTime: exerciseLog.created_time,
          sets: parseSetsText(
            getFormula(exerciseLog.properties.setsJsonFormula, "string"),
          ),
          notionUrl: exerciseLog.url,
        },
      };
    }),
  );
  console.timeEnd("exerciseLogs");

  const exerciseLogIdToLogMap = new Map<string, ExerciseLogWithSets>(
    exerciseLogs.map(({ exerciseLogId, exerciseLog }) => [
      exerciseLogId,
      exerciseLog,
    ]),
  );
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
      maxWeightLog: maxWeightExerciseLogId
        ? exerciseLogIdToLogMap.get(maxWeightExerciseLogId) || null
        : null,
      latestLog: latestExerciseLogId
        ? exerciseLogIdToLogMap.get(latestExerciseLogId) || null
        : null,
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
