import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { errorHandler } from "./middleware/errorHandler";
import { healthRouter } from "./routes/health.routes";
import { notionRouter } from "./routes/notion.routes";
import { notionTrainingAppRouter } from "./routes/notion-training-app.routes";

export const app = express();

/** Initial Set Up */

// Logging middleware
const loggerStream = {
  write: (message: string) => console.log(`From message: ${message}`),
};
app.use(morgan("tiny", { stream: loggerStream }));
// CORS middleware
app.use(
  cors({
    origin: true, // 後で許可するオリジンを指定する
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    credentials: true,
  }),
);
// Cookie parser middleware
app.use(cookieParser());
// JSON body parser middleware
app.use(express.json());
// Error handling middleware
app.use(errorHandler);

/** API */

// ヘルスチェックエンドポイント
app.use("/api/health", healthRouter);

// Notion関連のエンドポイント
app.use("/api/notion", notionRouter);
app.use("/api/notion-training-app", notionTrainingAppRouter);
