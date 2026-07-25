import { asyncHandler } from "@/libs/asyncHandler";
import type {
  ExerciseLogWithSetsResponse,
  ExerciseSummaryResponse,
} from "@repo/types/notion-training-app";
import { paginationQuerySchema } from "@repo/schemas";
import * as fetches from "./exercise.notion";

export const getExerciseNames = asyncHandler(async (_, res) => {
  const nameData = await fetches.fetchExerciseNames();
  const response = {
    message: "getExerciseNames",
    nameData,
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
  async (req: { params: { exerciseId: string } }, res) => {
    const { exerciseId } = req.params;

    const exerciseTrends = await fetches.fetchExerciseTrends(exerciseId);

    res.status(200).json({
      message: "getExerciseTrends",
      ...exerciseTrends,
    });
  },
);
