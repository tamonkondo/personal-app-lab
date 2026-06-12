import { asyncHandler } from "@/libs/asyncHandler";
import * as fetches from "./trainingLog.notion";

// トレーニングログ一覧の取得エンドポイント
export const getTrainingLogs = asyncHandler(
  async (req: { query: { cursor?: string; limit?: number } }, res) => {
    const { cursor, limit } = req.query;
    const trainingLogs = await fetches.fetchTrainingLogs(
      cursor,
      limit ? Number(limit) : undefined,
    );
    const meta = {
      next_cursor: trainingLogs.next_cursor,
      has_more: trainingLogs.has_more,
    };
    const data = trainingLogs.data;
    res.status(200).json({ message: "getTrainingLogs", data, meta });
  },
);

// 最新のトレーニングログを取得するエンドポイント
export const getNewestTrainingLog = asyncHandler(async (_, res) => {
  // idがない場合は今日の日付を反映
  const trainingLog = await fetches.fetchNewestTrainingLog();
  res.status(200).json({
    message: "getNewestTrainingLog",
    data: trainingLog,
  });
});
