import notionClient from "@/integrations/notion/notion.client";
import type {
  NotionExerciseLogPage,
  NotionExerciseLogProperties,
} from "./exerciseLog.types";
import { getFormula } from "@/integrations/notion/notion.mapper";

import type {
  ExerciseLogWithSetsItemResponse,
  ExerciseSetBase,
} from "@repo/types/notion-training-app";
import type { NotionExerciseQueryResult } from "../exercise/exercise.types";
import notionLimit from "@/libs/notion/notionLimit";
import { parseExerciseSetsText } from "../exerciseSet/exerciseSet.lib";

interface Props {
  exercises: NotionExerciseQueryResult;
}

interface FetchExerciseLogWithSetsRes {
  exerciseId: string;
  maxWeightSets: ExerciseLogWithSetsItemResponse;
  latestSets: ExerciseLogWithSetsItemResponse;
}

export async function fetchExerciseLogWithSets({
  exercises,
}: Props): Promise<FetchExerciseLogWithSetsRes[]> {
  const extractExerciseProperties = [
    "rest",
    "trainingNameFormula",
    "setsJsonFormula",
  ] as const satisfies (keyof NotionExerciseLogProperties)[];
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

  console.time("exerciseLogs");
  const exerciseLogs = await Promise.all(
    exerciseLogIds().map(async (exerciseLogId) => {
      const exerciseLog = (await notionLimit(() =>
        notionClient.pages.retrieve({
          page_id: exerciseLogId,
          filter_properties: extractExerciseProperties,
        }),
      )) as unknown as NotionExerciseLogPage<ExtractedExerciseLogProperties>;

      return {
        exerciseLogId,
        exerciseLog: {
          exerciseId: exerciseLog.id,
          rest: exerciseLog.properties.rest.number || 0,
          trainingName:
            getFormula(exerciseLog.properties.trainingNameFormula, "string") ||
            "",
          createdTime: exerciseLog.created_time,
          sets: parseExerciseSetsText(
            getFormula(exerciseLog.properties.setsJsonFormula, "string"),
            exerciseLog.id,
          ),
          notionUrl: exerciseLog.url,
        },
      };
    }),
  );
  console.timeEnd("exerciseLogs");
  console.log("exerciseLogs", exerciseLogs);
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
