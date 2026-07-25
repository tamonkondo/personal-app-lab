import "./libs/sentry";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import * as Sentry from "@sentry/node";
import { config } from "./libs/config";
import { errorHandler } from "./middleware/errorHandler";
import { healthRouter } from "./routes/health.routes";
import { notionTrainingAppRouter } from "./routes/notion-training-app.routes";
import { notionTodoPomodoroAppRouter } from "./routes/notion-todo-pomodoro-app.routes";

export const app = express();

/** Middleware */

// アクセスログ
app.use(morgan("tiny"));

// CORS: CORS_ORIGINS(カンマ区切り)で許可リストを指定。未設定時は localhost のみ許可
app.use(
  cors({
    origin:
      config.corsOrigins.length > 0
        ? config.corsOrigins
        : /^https?:\/\/localhost(:\d+)?$/,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

/** API */

// ヘルスチェックエンドポイント
app.use("/api/health", healthRouter);

// Notion関連のエンドポイント
app.use("/api/notion-training-app", notionTrainingAppRouter);
app.use("/api/notion-todo-pomodoro-app", notionTodoPomodoroAppRouter);

/** Error handling */

// Sentry のエラーハンドラはルート定義の後・自前ハンドラの前に置く
Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);
