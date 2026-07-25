import type { ErrorRequestHandler } from "express";
import { AppError } from "@/libs/errors";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    // 4xx は想定内のエラーなので error ログにしない
    if (err.status >= 500) console.error(err);
    res.status(err.status).json({
      message: err.message,
      ...(err.code ? { code: err.code } : {}),
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    message: "Internal Server Error",
  });
};
