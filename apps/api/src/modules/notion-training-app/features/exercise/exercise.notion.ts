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
  ExerciseResponse,
} from "./exercise.types";
import { ExerciseSummaryResponse } from "@repo/types/notion-training-app";
import {
  ExerciseSetProperties,
  ExtractExerciseLog,
} from "../exerciseSet/exerciseSet.types";
import { ExerciseLogProperties } from "../exerciseLog/exerciseLog.types";

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
          property: "maxGoalWeight",
          rollup: {
            number: {
              is_not_empty: true,
            },
          },
        },
      ],
    },
    filter_properties: [
      "name",
      "musclesTypes",
      "maxGoalStatusFormula",
      "maxGoalWeight",
      "theGoalsWeightRelation",
      "maxWeightExerciseId",
      "latestExerciseId",
      "currentMaxWeightRollup",
    ],
    page_size: limit,
    start_cursor: start_cursor,
  })) as unknown as ExerciseData;
  // 直近のトレーニングログを1件のみ取得
  const extractExerciseProperties = [
    "exerciseSetsRelation",
    "rest"
  ] as const satisfies (keyof ExerciseLogProperties)[];
  type ExtractedExerciseSetLog = ExtractExerciseLog<
    (typeof extractExerciseProperties)[number]
  >;

  const latestExerciseLogs = await Promise.all(
    exercises.results.map(async (exercise) => {
      const queryResult = (await notionClient.dataSources.query({
        data_source_id: process.env.NOTION_EXERCISE_LOGS_DATABASE_ID!,
        filter: {
          property: "trainingExerciseRelation",
          relation: {
            contains: exercise.id,
          },
        },
        page_size: 1,
        sorts: [
          {
            timestamp: "created_time",
            direction: "descending",
          },
        ],
        // filter_properties: ["kg", "rep", "memo"],
      })) as unknown as { results: ExtractedExerciseSetLog[] };
      return queryResult;
    }),
  );
  // ゴールに近いもしくは達成している種目を取得
  // const goalExerciseLogs = await Promise.all(
  //   exercises.results.map(async (exercise) => {
  //     const maxWeightExerciseId = getFormula(
  //       exercise.properties.maxWeightExerciseId,
  //       "string",
  //     );
  //     if (!maxWeightExerciseId) {
  //       return {
  //         exerciseId: exercise.id,
  //         log: null,
  //       };
  //     }

  //     const goalLog = (await notionClient.pages.retrieve({
  //       page_id: maxWeightExerciseId,
  //       filter_properties: ["kg", "rep", "memo"],
  //     })) as unknown as ExtractedExerciseSetLog;

  //     return {
  //       exerciseId: exercise.id,
  //       log: goalLog,
  //     };
  //   }),
  // );

  // const exerciseSetsDTO = (data: ExtractedExerciseSetLog | null) => ({
  //   id: data?.id || "",
  //   kg: data?.properties.kg.number || 0,
  //   rep: data?.properties.rep.number || 0,
  //   memo: data?.properties.memo.rich_text[0]?.plain_text || "",
  // });

  // const latestByExerciseId = new Map(
  //   latestExerciseLogs.map((item) => [item.exerciseId, item.log]),
  // );
  // const goalByExerciseId = new Map(
  //   goalExerciseLogs.map((item) => [item.exerciseId, item.log]),
  // );
  // const responseData: ExerciseSummaryResponse = {
  //   data: exercises.results.map((log) => ({
  //     id: log.id,
  //     currentMaxWeight:
  //       Number(getRollup(log.properties.currentMaxWeightRollup, "number")) || 0,
  //     trainingName: log.properties.name.title?.[0]?.plain_text || "",
  //     isPr:
  //       Number(getRollup(log.properties.currentMaxWeightRollup, "number")) >
  //       (getRollupArrayValue(log.properties.maxGoalWeight, "number") || 0),
  //     maxWeightSets: exerciseSetsDTO(goalByExerciseId.get(log.id) || null),
  //     latestSets: exerciseSetsDTO(latestByExerciseId.get(log.id) || null),
  //   })),
  //   next_cursor: exercises.next_cursor || undefined,
  //   has_more: exercises.has_more,
  // };
  return { data: latestExerciseLogs };
}

// id(prop("setsRollup").filter(current.prop("maxWeightFormula") == prop("currentMaxWeightRollup")).first() )

// "exerciseNameRollup": {
//       "id": "bltv",
//       "type": "rollup",
//       "rollup": {
//         "type": "array",
//         "array": [
//           {
//             "type": "relation",
//             "relation": [
//               {
//                 "id": "172684c1-6338-8002-b527-d8f0b9a34943"
//               }
//             ]
//           }
//         ],
//         "function": "show_original"
//       }
//     },
