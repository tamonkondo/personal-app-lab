import { asyncHandler } from "@/libs/asyncHandler";
import type {
  NewestTrainingLogResponse,
  TrainingLogSummaryResponse,
} from "@repo/types/notion-training-app";
import * as fetches from "./trainingLog.notion";

// トレーニングログ一覧の取得エンドポイント
export const getTrainingLogs = asyncHandler(
  async (req: { query: { cursor?: string; limit?: number } }, res) => {
    const { cursor, limit } = req.query;
    const trainingLogs = await fetches.fetchTrainingLogs(
      cursor,
      limit ? Number(limit) : undefined,
    );
    const response: TrainingLogSummaryResponse = {
      message: "getTrainingLogs",
      ...trainingLogs,
    };
    res.status(200).json(response);
  },
);

// 最新のトレーニングログを取得するエンドポイント
export const getNewestTrainingLog = asyncHandler(async (_, res) => {
  // idがない場合は今日の日付を反映
  const trainingLog = await fetches.fetchNewestTrainingLog();
  const response: NewestTrainingLogResponse = {
    message: "getNewestTrainingLog",
    data: trainingLog,
  };
  res.status(200).json(response);
});
