import { asyncHandler } from "@/libs/asyncHandler";
import type {
  NewestTrainingLogResponse,
  TrainingLogSummaryResponse,
} from "@repo/types/notion-training-app";
import * as fetches from "./trainingLog.notion";

// トレーニングログ一覧の取得エンドポイント
type GetTrainingLogsRequest = {
  query: {
    cursor?: string;
    limit?: number;
    startDate?: string;
    endDate?: string;
    sort?: "asc" | "desc";
    parts?: string;
  };
};
export const getTrainingLogs = asyncHandler(
  async (req: GetTrainingLogsRequest, res) => {
    const { cursor, limit, startDate, endDate, sort, parts } = req.query;
    console.log("getTrainingLogs query:", parts);
    const arrayParts = parts
      ? parts
          .split(",")
          .map((part) => part.trim())
          .filter((part) => part.length > 0)
      : undefined;
    const trainingLogs = await fetches.fetchTrainingLogs(
      cursor,
      limit ? Number(limit) : undefined,
      startDate,
      endDate,
      sort,
      arrayParts,
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
