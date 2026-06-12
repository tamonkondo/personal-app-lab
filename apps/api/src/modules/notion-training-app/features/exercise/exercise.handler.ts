import { asyncHandler } from "@/libs/asyncHandler";
import * as fetches from "./exercise.notion";
export const getExercises = asyncHandler(async (_, res) => {
  const exercises = await fetches.fetchExercises();
  res.status(200).json({ message: "getExercises", data: exercises });
});
export const createExercise = asyncHandler(async (req, res) => {
  res.status(201).json({ message: "createExercise" });
});
export const updateExercise = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "updateExercise" });
});
export const deleteExercise = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "deleteExercise" });
});
export const getExerciseDetail = asyncHandler(
  async (req: { params: { id: string } }, res) => {
    const { id } = req.params;
    const exerciseDetail = await fetches.fetchExerciseDetail(id);
    res.status(200).json({
      message: "getExerciseDetail",
      data: exerciseDetail,
    });
  },
);
export const createExerciseDetail = asyncHandler(async (req, res) => {
  res.status(201).json({ message: "createExerciseDetail" });
});
export const updateExerciseDetail = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "updateExerciseDetail" });
});
export const deleteExerciseDetail = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "deleteExerciseDetail" });
});

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
