import { asyncHandler } from "@/libs/asyncHandler";
import type {
  ExerciseLogWithSetsResponse,
  ExerciseNamesResponse,
  ExerciseSummaryResponse,
  ExerciseTrendsResponse,
} from "@repo/types/notion-training-app";
import { paginationQuerySchema } from "@repo/schemas";
import {
  createExerciseSchema,
  updateExerciseSchema,
  exerciseTrendsQuerySchema,
} from "@repo/schemas/notion-training-app";
import * as fetches from "./exercise.notion";

export const getExerciseNames = asyncHandler(async (_, res) => {
  const names = await fetches.fetchExerciseNames();
  const response: ExerciseNamesResponse = {
    message: "getExerciseNames",
    data: names,
  };
  res.status(200).json(response);
});

export const getExerciseSummaryLogs = asyncHandler(async (req, res) => {
  const { limit, cursor } = paginationQuerySchema.parse(req.query);

  const exerciseSummaryLogs = await fetches.fetchExerciseSummaryLogs(
    limit,
    cursor,
  );
  const response: ExerciseSummaryResponse = {
    message: "getExerciseSummaryLogs",
    ...exerciseSummaryLogs,
  };
  res.status(200).json(response);
});

export const getExerciseLogs = asyncHandler(
  async (req: { params: { exerciseId: string }; query: unknown }, res) => {
    const { exerciseId } = req.params;
    const { limit, cursor } = paginationQuerySchema.parse(req.query);

    const exerciseLogs = await fetches.fetchExerciseLogs(
      exerciseId,
      limit,
      cursor,
    );

    const response: ExerciseLogWithSetsResponse = {
      message: "getExerciseLogs",
      ...exerciseLogs,
    };
    res.status(200).json(response);
  },
);

export const getExerciseDetail = asyncHandler(
  async (req: { params: { exerciseId: string } }, res) => {
    const { exerciseId } = req.params;

    const exerciseDetail = await fetches.fetchExerciseDetail(exerciseId);

    res.status(200).json({
      message: "getExerciseDetail",
      data: exerciseDetail,
    });
  },
);

export const getExerciseTrends = asyncHandler(
  async (req: { params: { exerciseId: string }; query: unknown }, res) => {
    const { exerciseId } = req.params;
    const { period } = exerciseTrendsQuerySchema.parse(req.query);

    const exerciseTrends = await fetches.fetchExerciseTrends(
      exerciseId,
      period,
    );

    const response: ExerciseTrendsResponse = {
      message: "getExerciseTrends",
      data: exerciseTrends,
    };
    res.status(200).json(response);
  },
);

// 種目マスタの作成エンドポイント
export const createExercise = asyncHandler(async (req, res) => {
  const parsed = createExerciseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid exercise payload",
      issues: parsed.error.issues,
    });
    return;
  }
  const result = await fetches.createExercise(parsed.data);
  res.status(201).json({ message: "createExercise", data: result });
});

// 種目マスタの更新エンドポイント (undefined のフィールドは変更しない)
export const updateExercise = asyncHandler(
  async (req: { params: { exerciseId: string }; body: unknown }, res) => {
    const parsed = updateExerciseSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Invalid exercise payload",
        issues: parsed.error.issues,
      });
      return;
    }
    const result = await fetches.updateExercise(
      req.params.exerciseId,
      parsed.data,
    );
    res.status(200).json({ message: "updateExercise", data: result });
  },
);

// 種目マスタの削除エンドポイント (記録が紐づく種目は 409)
export const deleteExercise = asyncHandler(
  async (req: { params: { exerciseId: string } }, res) => {
    const result = await fetches.deleteExercise(req.params.exerciseId);
    res.status(200).json({ message: "deleteExercise", data: result });
  },
);
