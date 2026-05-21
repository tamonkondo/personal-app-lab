import { asyncHandler } from "@/libs/asyncHandler";
import * as fetches from "./exerciseSet.notion";

// 直近のトレーニングセットのログを取得する。
export const getExerciseSets = asyncHandler(
  async (
    req: {
      query: { limit?: number; start_cursor?: string };
    },
    res,
  ) => {
    const { limit, start_cursor } = req.query; // 取得件数の上限
    const exerciseSetLogs = await fetches.fetchExerciseSets(
      limit ? Number(limit) : undefined,
      start_cursor,
    );
    res.json({ message: "getExerciseSets", data: exerciseSetLogs });
  },
);
export const getExerciseSet = asyncHandler(
  async (req: { params: { id: string } }, res) => {
    const { id } = req.params;
    const exerciseSetLog = await fetches.fetchExerciseSet(id);
    res.json({ message: "getExerciseSet", data: exerciseSetLog });
  },
);
export const createExerciseSet = asyncHandler(async (req, res) => {
  res.json({ message: "createExerciseSet" });
});
export const updateExerciseSet = asyncHandler(async (req, res) => {
  res.json({ message: "updateExerciseSet" });
});
export const deleteExerciseSet = asyncHandler(async (req, res) => {
  res.json({ message: "deleteExerciseSet" });
});
