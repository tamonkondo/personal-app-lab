/**
 * 各CRUDに対応するハンドラー関数を定義するファイル
 * 処理手順
 * 1. zodスキーマを元にリクエストのバリデーションを行う
 * 2. notion-training-app.notion.tsのfetch関数を呼び出して、Notion APIからデータを取得する
 * 3. 取得したデータを整形する。
 * 4. 取得したデータをレスポンスとして返す
 * */

import { asyncHandler } from "@/libs/asyncHandler";
import * as fetches from "./notion-training-app.notion";

export const getTrainingLogs = asyncHandler(async (req, res) => {
  const trainingLogs = await fetches.fetchTrainingLogs();
  res.json({ message: "getTrainingLogs", data: trainingLogs });
});
export const getTrainingLog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const trainingLog = await fetches.fetchTrainingLog(id as string);

  res.json({
    message: "getTrainingLog",
    data: trainingLog,
  });
});
export const createTrainingLog = asyncHandler(async (req, res) => {
  res.json({ message: "createTrainingLog" });
});
export const updateTrainingLog = asyncHandler(async (req, res) => {
  res.json({ message: "updateTrainingLog" });
});
export const deleteTrainingLog = asyncHandler(async (req, res) => {
  res.json({ message: "deleteTrainingLog" });
});
export const getGoalWeights = asyncHandler(async (req, res) => {
  res.json({ message: "getGoalWeights" });
});
export const getExercise = asyncHandler(async (req, res) => {
  res.json({ message: "getExercise" });
});
export const createExercise = asyncHandler(async (req, res) => {
  res.json({ message: "createExercise" });
});
export const updateExercise = asyncHandler(async (req, res) => {
  res.json({ message: "updateExercise" });
});
export const deleteExercise = asyncHandler(async (req, res) => {
  res.json({ message: "deleteExercise" });
});
export const getExerciseDetail = asyncHandler(async (req, res) => {
  res.json({ message: "getExerciseDetail" });
});
export const createExerciseDetail = asyncHandler(async (req, res) => {
  res.json({ message: "createExerciseDetail" });
});
export const updateExerciseDetail = asyncHandler(async (req, res) => {
  res.json({ message: "updateExerciseDetail" });
});
export const deleteExerciseDetail = asyncHandler(async (req, res) => {
  res.json({ message: "deleteExerciseDetail" });
});
export const getExerciseLogs = asyncHandler(async (req, res) => {
  res.json({ message: "getExerciseLogs" });
});
export const getExerciseLog = asyncHandler(async (req, res) => {
  res.json({ message: "getExerciseLog" });
});
export const createExerciseLog = asyncHandler(async (req, res) => {
  res.json({ message: "createExerciseLog" });
});
export const updateExerciseLog = asyncHandler(async (req, res) => {
  res.json({ message: "updateExerciseLog" });
});
export const deleteExerciseLog = asyncHandler(async (req, res) => {
  res.json({ message: "deleteExerciseLog" });
});
export const getExerciseSetLogs = asyncHandler(async (req, res) => {
  res.json({ message: "getExerciseSetLogs" });
});
export const getExerciseSetLog = asyncHandler(async (req, res) => {
  res.json({ message: "getExerciseSetLog" });
});
export const createExerciseSetLog = asyncHandler(async (req, res) => {
  res.json({ message: "createExerciseSetLog" });
});
export const updateExerciseSetLog = asyncHandler(async (req, res) => {
  res.json({ message: "updateExerciseSetLog" });
});
export const deleteExerciseSetLog = asyncHandler(async (req, res) => {
  res.json({ message: "deleteExerciseSetLog" });
});
