import { asyncHandler } from "@/libs/asyncHandler";
import type { ExerciseSummaryResponse } from "@repo/types/notion-training-app";
import * as fetches from "./exercise.notion";

export const getExerciseSummaryLogs = asyncHandler(
  async (req: { query: { limit?: number; start_cursor?: string } }, res) => {
    const { limit, start_cursor } = req.query; // 取得件数の上限

    const exerciseSummaryLogs = await fetches.fetchExerciseSummaryLogs(
      limit ? Number(limit) : undefined,
      start_cursor,
    );
    const response: ExerciseSummaryResponse = {
      message: "getExerciseSummaryLogs",
      ...exerciseSummaryLogs,
    };
    res.status(200).json(response);
  },
);
