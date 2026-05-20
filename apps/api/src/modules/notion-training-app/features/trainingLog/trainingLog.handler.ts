import { asyncHandler } from "@/libs/asyncHandler";
import * as fetches from "./trainingLog.notion";

export const getTrainingLogs = asyncHandler(
  async (req: { query: { cursor?: string; limit?: number } }, res) => {
    const { cursor, limit } = req.query;
    const trainingLogs = await fetches.fetchTrainingLogs(
      cursor,
      limit ? Number(limit) : undefined,
    );
    res.status(200).json({ message: "getTrainingLogs", data: trainingLogs });
  },
);
export const getTrainingLog = asyncHandler(
  async (req: { params: { id: string } }, res) => {
    const { id } = req.params;
    const trainingLog = await fetches.fetchTrainingLog(id);
    res.status(200).json({
      message: "getTrainingLog",
      data: trainingLog,
    });
  },
);
export const getTrainingLogDetail = asyncHandler(
  async (req: { params: { id: string } }, res) => {
    const { id } = req.params;
    const trainingLogDetail = await fetches.fetchTrainingLogDetail(id);
    res.status(200).json({
      message: "getTrainingLogDetail",
      data: trainingLogDetail,
    });
  },
);
export const createTrainingLog = asyncHandler(async (req, res) => {
  res.json({ message: "createTrainingLog" });
});
export const updateTrainingLog = asyncHandler(async (req, res) => {
  res.json({ message: "updateTrainingLog" });
});
export const deleteTrainingLog = asyncHandler(async (req, res) => {
  res.json({ message: "deleteTrainingLog" });
});
