import notionClient from "@/integrations/notion/notion.client";
import type {
  NotionExerciseLogQueryResult,
  NotionExerciseLogPage,
  NotionExerciseLogProperties,
} from "./exerciseLog.types";
import { getFormula } from "@/integrations/notion/notion.mapper";

import type { ExerciseLogWithSetsItemResponse } from "@repo/types/notion-training-app";
import type { NotionExerciseQueryResult } from "../exercise/exercise.types";
import notionLimit from "@/libs/notion/notionLimit";
import { parseExerciseSetsText } from "../exerciseSet/exerciseSet.lib";
import {
  notionDefineProperties,
  type NotionKeysOfProperties,
} from "@/libs/notion/propertyExtract";

type ExerciseLogLookupProperties =
  | "latestExerciseLogId"
  | "maxWeightExerciseLogId";

interface Props {
  exercises: NotionExerciseQueryResult<ExerciseLogLookupProperties>;
}

interface FetchExerciseLogWithSetsRes {
  exerciseId: string;
  maxWeightSets: ExerciseLogWithSetsItemResponse;
  latestSets: ExerciseLogWithSetsItemResponse;
}

export const exerciseLogWithSetsProperties =
  notionDefineProperties<NotionExerciseLogProperties>()([
    "rest",
    "trainingNameFormula",
    "setsJsonFormula",
  ]);

export type ExerciseLogWithSetsProperties =
  NotionKeysOfProperties<typeof exerciseLogWithSetsProperties>;

function mapExerciseLogWithSetsItem(
  exerciseLog: NotionExerciseLogPage<ExerciseLogWithSetsProperties>,
  exerciseId: string,
): ExerciseLogWithSetsItemResponse {
  return {
    exerciseLogId: exerciseLog.id,
    exerciseId,
    rest: exerciseLog.properties.rest.number || 0,
    trainingName:
      getFormula(exerciseLog.properties.trainingNameFormula, "string") || "",
    createdTime: exerciseLog.created_time,
    sets: parseExerciseSetsText(
      getFormula(exerciseLog.properties.setsJsonFormula, "string"),
      exerciseLog.id,
    ),
    notionUrl: exerciseLog.url,
  };
}

function emptyExerciseLogWithSets(
  exerciseId: string,
): ExerciseLogWithSetsItemResponse {
  return {
    exerciseLogId: "",
    exerciseId,
    rest: 0,
    trainingName: "",
    createdTime: "",
    sets: [],
    notionUrl: "",
  };
}

export function mapExerciseLogsWithSets({
  exerciseLogs,
  exerciseId,
}: {
  exerciseLogs: NotionExerciseLogQueryResult<ExerciseLogWithSetsProperties>;
  exerciseId: string;
}): ExerciseLogWithSetsItemResponse[] {
  return exerciseLogs.results.map((exerciseLog) =>
    mapExerciseLogWithSetsItem(exerciseLog, exerciseId),
  );
}

export async function fetchExerciseLogWithSets({
  exercises,
}: Props): Promise<FetchExerciseLogWithSetsRes[]> {
  /* exercisesからlatestExerciseLogIdとmaxWeightExerciseLogIdを抜き取り、重複を除外する */
  const exerciseLogIdToExerciseIdMap = new Map<string, string>();
  const exerciseLogIds = [
    ...new Set(
      exercises.results.flatMap((exercise) => {
        const ids = [
          getFormula(exercise.properties.latestExerciseLogId, "string"),
          getFormula(exercise.properties.maxWeightExerciseLogId, "string"),
        ].filter((id): id is string => typeof id === "string" && id.length > 0);

        ids.forEach((id) => {
          exerciseLogIdToExerciseIdMap.set(id, exercise.id);
        });

        return ids;
      }),
    ),
  ];
  console.log("log count", exerciseLogIds.length);

  console.time("exerciseLogs");
  const exerciseLogs = await Promise.all(
    exerciseLogIds.map(async (exerciseLogId) => {
      const exerciseId = exerciseLogIdToExerciseIdMap.get(exerciseLogId);
      if (!exerciseId) {
        throw new Error(`Exercise ID not found for log: ${exerciseLogId}`);
      }

      const exerciseLog = (await notionLimit(() =>
        notionClient.pages.retrieve({
          page_id: exerciseLogId,
          filter_properties: [...exerciseLogWithSetsProperties],
        }),
      )) as unknown as NotionExerciseLogPage<ExerciseLogWithSetsProperties>;

      return {
        exerciseLogId,
        exerciseLog: mapExerciseLogWithSetsItem(exerciseLog, exerciseId),
      };
    }),
  );
  console.timeEnd("exerciseLogs");
  const exerciseLogIdToLogMap = new Map<
    string,
    ExerciseLogWithSetsItemResponse
  >(
    exerciseLogs.map(({ exerciseLogId, exerciseLog }) => [
      exerciseLogId,
      exerciseLog,
    ]),
  );
  // exerciseIdをキーにして、maxWeightExerciseLogとlatestExerciseLogを振り分ける
  const exerciseIdToLogsMap: Record<
    string,
    {
      maxWeightLog: ExerciseLogWithSetsItemResponse | null;
      latestLog: ExerciseLogWithSetsItemResponse | null;
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
    maxWeightSets: maxWeightLog || emptyExerciseLogWithSets(exerciseId),
    latestSets: latestLog || emptyExerciseLogWithSets(exerciseId),
  }));
  return responseData;
}
