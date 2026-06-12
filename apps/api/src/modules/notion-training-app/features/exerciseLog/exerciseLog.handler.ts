import { asyncHandler } from "@/libs/asyncHandler";
import * as fetches from "./exerciseLog.notion";
// 最近の記録一覧を取得
export const getRecentTrainingLogs = asyncHandler(async (req, res) => {
  res.json({ message: "getRecentTrainingLogs" });
});
// 特定の種目の記録一覧を取得
export const getExerciseLogs = asyncHandler(
  async (
    req: {
      params: { exerciseId: string };
      query: { limit?: number; start_cursor?: string };
    },
    res,
  ) => {
    const { exerciseId } = req.params; // exerciseId
    const { limit, start_cursor } = req.query; // 取得件数の上限

    const exerciseLogs = await fetches.fetchExerciseLogs(
      exerciseId,
      limit ? Number(limit) : undefined,
      start_cursor,
    );
    res.json({ message: "getExerciseLogs", data: exerciseLogs });
  },
);
// 特定の種目のある日付の記録を取得
export const getExerciseSummaryLogs = asyncHandler(
  async (req: { query: { limit?: number; start_cursor?: string } }, res) => {
    const { limit, start_cursor } = req.query; // 取得件数の上限

    const exerciseSummaryLogs = await fetches.fetchExerciseSummaryLogs(
      limit ? Number(limit) : undefined,
      start_cursor,
    );
    res.json({ message: "getExerciseSummaryLogs", data: exerciseSummaryLogs });
  },
);
export const createExerciseLog = asyncHandler(async (req, res) => {
  res.json({ message: "createExerciseLog" });
});
export const updateExerciseLog = asyncHandler(async (req, res) => {
  res.json({ message: "updateExerciseLog" });
});
export const deleteExerciseLog = asyncHandler(async (req, res) => {
  res.json({ message: "deleteExerciseLog" });
});
