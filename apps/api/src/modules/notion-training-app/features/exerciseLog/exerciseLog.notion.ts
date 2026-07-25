import notionClient from "@/integrations/notion/notion.client";
import type { ExerciseLogWithSetsItemResponse } from "@repo/types/notion-training-app";
import notionLimit from "@/libs/notion/notionLimit";
import {
  exerciseLogWithSetsProperties,
  mapExerciseLogWithSetsItem,
  emptyExerciseLogWithSets,
} from "./exerciseLog.db";

/** 種目ごとの最新/最大重量ログの参照 */
export interface ExerciseLogRefs {
  exerciseId: string;
  latestExerciseLogId: string | null;
  maxWeightExerciseLogId: string | null;
}

interface FetchExerciseLogWithSetsRes {
  exerciseId: string;
  maxWeightSets: ExerciseLogWithSetsItemResponse;
  latestSets: ExerciseLogWithSetsItemResponse;
}

export async function fetchExerciseLogWithSets(
  refs: ExerciseLogRefs[],
): Promise<FetchExerciseLogWithSetsRes[]> {
  /* refs から latest/maxWeight のログ ID を抜き取り、重複を除外する */
  const exerciseLogIdToExerciseIdMap = new Map<string, string>();
  const exerciseLogIds = [
    ...new Set(
      refs.flatMap((ref) => {
        const ids = [ref.latestExerciseLogId, ref.maxWeightExerciseLogId].filter(
          (id): id is string => typeof id === "string" && id.length > 0,
        );
        ids.forEach((id) => {
          exerciseLogIdToExerciseIdMap.set(id, ref.exerciseId);
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

      const raw = await notionLimit(() =>
        notionClient.pages.retrieve({
          page_id: exerciseLogId,
          filter_properties: [...exerciseLogWithSetsProperties],
        }),
      );

      return {
        exerciseLogId,
        exerciseLog: mapExerciseLogWithSetsItem(raw, exerciseId),
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

  // exerciseId をキーにして、maxWeightExerciseLog と latestExerciseLog を振り分ける
  return refs.map((ref) => {
    const maxWeightLog = ref.maxWeightExerciseLogId
      ? exerciseLogIdToLogMap.get(ref.maxWeightExerciseLogId) || null
      : null;
    const latestLog = ref.latestExerciseLogId
      ? exerciseLogIdToLogMap.get(ref.latestExerciseLogId) || null
      : null;
    return {
      exerciseId: ref.exerciseId,
      maxWeightSets: maxWeightLog || emptyExerciseLogWithSets(ref.exerciseId),
      latestSets: latestLog || emptyExerciseLogWithSets(ref.exerciseId),
    };
  });
}
