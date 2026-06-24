import { asyncHandler } from "@/libs/asyncHandler";
import type { ExerciseSummaryResponse } from "@repo/types/notion-training-app";
import * as fetches from "./exercise.notion";

type GetExerciseSummaryLogsRequest = {
  query: {
    limit: number;
    cursor: string;
    bodyParts: string;
  };
};

export const getExerciseSummaryLogs = asyncHandler(
  async (req: GetExerciseSummaryLogsRequest, res) => {
    const { limit, cursor, bodyParts } = req.query as Partial<
      GetExerciseSummaryLogsRequest["query"]
    >; // 取得件数の上限
    const arrayParts = bodyParts
      ? bodyParts
          .split(",")
          .map((part) => part.trim())
          .filter((part) => part.length > 0)
      : undefined;

    const exerciseSummaryLogs = await fetches.fetchExerciseSummaryLogs(
      limit ? Number(limit) : undefined,
      cursor,
    );
    const response: ExerciseSummaryResponse = {
      message: "getExerciseSummaryLogs",
      ...exerciseSummaryLogs,
    };
    res.status(200).json(response);
  },
);
