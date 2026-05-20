import { asyncHandler } from "@/libs/asyncHandler";

export const getExerciseSetLogs = asyncHandler(async (req, res) => {
  res.json({ message: "getExerciseSetLogs" });
});
export const getExerciseSetLog = asyncHandler(async (req, res) => {
  res.json({ message: "getExerciseSetLog" });
});
export const createExerciseSetLog = asyncHandler(async (req, res) => {
  res.json({ message: "createExerciseSetLog" });
});
export const updateExerciseSetLog = asyncHandler(async (req, res) => {
  res.json({ message: "updateExerciseSetLog" });
});
export const deleteExerciseSetLog = asyncHandler(async (req, res) => {
  res.json({ message: "deleteExerciseSetLog" });
});
