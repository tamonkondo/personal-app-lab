import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8)
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * カーソルページネーション共通クエリ。
 * API ハンドラ側で req.query の検証に使う (不正値はデフォルトへフォールバック)
 */
export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().catch(undefined),
  cursor: z.string().optional().catch(undefined),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
