import {
  getRollup,
  getRollupArrayValue,
} from "@/integrations/notion/notion.mapper";
import notionClient from "@/integrations/notion/notion.client";
import type {
  NotionExerciseProperties,
  NotionExerciseQueryResult,
} from "./exercise.types";
import type { ExerciseSummaryResponse } from "@repo/types/notion-training-app";
import { fetchExerciseLogWithSets } from "../exerciseLog/exerciseLog.notion";

type FetchExerciseSummaryLogsResult = Pick<
  ExerciseSummaryResponse,
  "data" | "meta"
>;

export async function fetchExerciseSummaryLogs(
  limit: number = 7,
  start_cursor?: string,
): Promise<FetchExerciseSummaryLogsResult> {
  // ゴール重量がある種目のみを取得
  console.time("fetchExerciseSummaryLogs");
  const exercisesFilterProperties = [
    "name",
    "musclesTypes",
    "maxGoalWeightRollup",
    "maxWeightExerciseLogId",
    "latestExerciseLogId",
    "currentMaxWeightRollup",
  ] as const satisfies (keyof NotionExerciseProperties)[];
  const exercises: NotionExerciseQueryResult =
    (await notionClient.dataSources.query({
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
    })) as unknown as NotionExerciseQueryResult;

  const exerciseLogWithSets = await fetchExerciseLogWithSets({
    exercises,
  });

  const exerciseLogWithSetsMap = new Map(
    exerciseLogWithSets.map((log) => [log.exerciseId, log]),
  );

  const responseData: FetchExerciseSummaryLogsResult = {
    data: exercises.results.map((log) => {
      const logWithSets = exerciseLogWithSetsMap.get(log.id);
      if (!logWithSets) {
        throw new Error(`Exercise log summary not found: ${log.id}`);
      }
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
        maxWeightSets: logWithSets.maxWeightSets,
        latestSets: logWithSets.latestSets,
      };
    }),
    meta: {
      next_cursor: exercises.next_cursor || undefined,
      has_more: exercises.has_more,
    },
  };
  console.timeEnd("fetchExerciseSummaryLogs");
  return responseData;
}
