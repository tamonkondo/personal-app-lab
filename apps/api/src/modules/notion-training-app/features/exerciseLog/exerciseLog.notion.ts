import notionClient from "@/integrations/notion/notion.client";
import type {
  NotionExerciseLogPage,
} from "./exerciseLog.types";
import type { ExerciseLogWithSetsItemResponse } from "@repo/types/notion-training-app";
import type { NotionExerciseQueryResult } from "../exercise/exercise.types";
import notionLimit from "@/libs/notion/notionLimit";
import { readExerciseLogRefs } from "../exercise/exercise.db";
import {
  exerciseLogWithSetsProperties,
  mapExerciseLogWithSetsItem,
  emptyExerciseLogWithSets,
  type ExerciseLogWithSetsProperties,
} from "./exerciseLog.db";

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

export async function fetchExerciseLogWithSets({
  exercises,
}: Props): Promise<FetchExerciseLogWithSetsRes[]> {
  /* exercisesからlatestExerciseLogIdとmaxWeightExerciseLogIdを抜き取り、重複を除外する */
  const exerciseLogIdToExerciseIdMap = new Map<string, string>();
  const exerciseLogIds = [
    ...new Set(
      exercises.results.flatMap((exercise) => {
        const refs = readExerciseLogRefs(exercise);
        const ids = [
          refs.latestExerciseLogId,
          refs.maxWeightExerciseLogId,
        ].filter((id): id is string => typeof id === "string" && id.length > 0);

        ids.forEach((id) => {
          exerciseLogIdToExerciseIdMap.set(id, exercise.id);
        });

        return ids;
      }),
    ),
  ];

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
    const { latestExerciseLogId, maxWeightExerciseLogId } =
      readExerciseLogRefs(exercise);
    exerciseIdToLogsMap[exercise.id] = {
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
