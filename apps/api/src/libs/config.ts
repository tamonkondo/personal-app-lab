import "dotenv/config";
import { z } from "zod";

/**
 * 環境変数の一元管理。
 * 起動時に zod で検証し、設定漏れを「Notion API の謎エラー」ではなく
 * 起動エラーとして即座に検出できるようにする。
 */
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  /** CORS 許可オリジン(カンマ区切り)。未設定時は localhost のみ許可 */
  CORS_ORIGINS: z.string().default(""),
  SENTRY_DSN: z.string().optional(),
  NOTION_ACCESS_TOKEN: z.string().min(1),
  NOTION_TRAINING_LOGS_DATABASE_ID: z.string().min(1),
  NOTION_EXERCISES_DATABASE_ID: z.string().min(1),
  NOTION_EXERCISE_LOGS_DATABASE_ID: z.string().min(1),
  NOTION_EXERCISE_SETS_DATABASE_ID: z.string().min(1),
  NOTION_TODOS_DB: z.string().min(1),
  NOTION_PROJECTS_DB: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("環境変数の検証に失敗しました:\n" + z.prettifyError(parsed.error));
  throw new Error("Invalid environment variables");
}

export const config = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
