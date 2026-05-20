import { asyncHandler } from "@/libs/asyncHandler";
import * as fetches from "./exerciseLog.notion";
// 最近の記録一覧を取得
export const getRecentTrainingLogs = asyncHandler(async (req, res) => {
  res.json({ message: "getRecentTrainingLogs" });
});
// 特定の種目の記録一覧を取得
export const getExerciseLogs = asyncHandler(
  async (req: { params: { exerciseId: string } }, res) => {
    const { exerciseId } = req.params; // exerciseId
    const exerciseLogs = await fetches.fetchExerciseLogs(exerciseId);
    res.json({ message: "getExerciseLogs", data: exerciseLogs });
  },
);
// 特定の種目のある日付の記録を取得
export const getExerciseLog = asyncHandler(
  async (req: { params: { id: string } }, res) => {
    const { id } = req.params; // exerciseLogId
    res.json({ message: "getExerciseLog", data: { id } });
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
