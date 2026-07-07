import { asyncHandler } from "@/libs/asyncHandler";
import type {
  ExerciseLogWithSetsResponse,
  ExerciseSummaryResponse,
} from "@repo/types/notion-training-app";
import * as fetches from "./exercise.notion";

type GetExerciseSummaryLogsRequest = {
  query: {
    limit: number;
    cursor: string;
    bodyParts: string;
  };
};

export const getExerciseNames = asyncHandler(async (_, res) => {
  const nameData = await fetches.fetchExerciseNames();
  const response = {
    message: "getExerciseNames",
    nameData,
  };
  res.status(200).json(response);
});

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
    console.log(exerciseSummaryLogs);
    const response: ExerciseSummaryResponse = {
      message: "getExerciseSummaryLogs",
      ...exerciseSummaryLogs,
    };
    res.status(200).json(response);
  },
);

export const getExerciseLogs = asyncHandler(
  async (
    req: {
      params: { exerciseId: string };
      query: { limit?: string; cursor?: string };
    },
    res,
  ) => {
    const { exerciseId } = req.params;
    const { limit, cursor } = req.query as Partial<{
      limit: string;
      cursor: string;
    }>;

    const exerciseLogs = await fetches.fetchExerciseLogs(
      exerciseId,
      limit ? Number(limit) : undefined,
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
