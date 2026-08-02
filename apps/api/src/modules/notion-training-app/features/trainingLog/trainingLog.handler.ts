import { asyncHandler } from "@/libs/asyncHandler";
import type {
  NewestTrainingLogResponse,
  TrainingLogSummaryResponse,
} from "@repo/types/notion-training-app";
import {
  createTrainingLogSchema,
  updateTrainingLogSchema,
  trainingLogListQuerySchema,
} from "@repo/schemas/notion-training-app";
import * as fetches from "./trainingLog.notion";

// トレーニングログ一覧の取得エンドポイント
export const getTrainingLogs = asyncHandler(async (req, res) => {
  const { cursor, limit, startDate, endDate, sort, parts } =
    trainingLogListQuerySchema.parse(req.query);
  const arrayParts = parts
    ? parts
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
    : undefined;
  const trainingLogs = await fetches.fetchTrainingLogs(
    cursor,
    limit,
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
});
// トレーニングログ一詳細のエンドポイント
export const getTrainingLogDetail = asyncHandler(
  async (req: { params: { id: string } }, res) => {
    const { id } = req.params;
    const trainingLogDetail = await fetches.fetchTrainingLogDetail(id);
    if (!trainingLogDetail) {
      res.status(404).json({ message: "Training log not found" });
      return;
    }
    res.status(200).json({
      message: "getTrainingLogDetail",
      data: trainingLogDetail,
    });
  },
);

// トレーニング記録の作成エンドポイント (当日記録のみ)
export const createTrainingLog = asyncHandler(async (req, res) => {
  const parsed = createTrainingLogSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid training log payload",
      issues: parsed.error.issues,
    });
    return;
  }
  const result = await fetches.createTrainingLog(parsed.data);
  res.status(201).json({ message: "createTrainingLog", data: result });
});

// トレーニング記録の更新エンドポイント (ネスト全体を差分同期)
export const updateTrainingLog = asyncHandler(
  async (req: { params: { id: string }; body: unknown }, res) => {
    const parsed = updateTrainingLogSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Invalid training log payload",
        issues: parsed.error.issues,
      });
      return;
    }
    const result = await fetches.updateTrainingLog(req.params.id, parsed.data);
    res.status(200).json({ message: "updateTrainingLog", data: result });
  },
);

// トレーニング記録の削除エンドポイント (種目ログ・セットもまとめてアーカイブ)
export const deleteTrainingLog = asyncHandler(
  async (req: { params: { id: string } }, res) => {
    const result = await fetches.deleteTrainingLog(req.params.id);
    res.status(200).json({ message: "deleteTrainingLog", data: result });
  },
);

// 最新のトレーニングログを取得するエンドポイント
export const getNewestTrainingLog = asyncHandler(async (_, res) => {
  const trainingLog = await fetches.fetchNewestTrainingLog();
  const response: NewestTrainingLogResponse = {
    message: "getNewestTrainingLog",
    data: trainingLog,
  };
  res.status(200).json(response);
});
