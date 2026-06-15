import { asyncHandler } from "@/libs/asyncHandler";
import * as fetches from "./exercise.notion";

export const getExerciseSummaryLogs = asyncHandler(
  async (req: { query: { limit?: number; start_cursor?: string } }, res) => {
    const { limit, start_cursor } = req.query; // 取得件数の上限

    const exerciseSummaryLogs = await fetches.fetchExerciseSummaryLogs(
      limit ? Number(limit) : undefined,
      start_cursor,
    );
    const meta = {
      next_cursor: exerciseSummaryLogs.next_cursor,
      has_more: exerciseSummaryLogs.has_more,
    };
    const data = exerciseSummaryLogs.data;
    res.status(200).json({ message: "getExerciseSummaryLogs", data, meta });
  },
);
