import { z } from "zod";

type NumericStringOptions = {
  /** 最小値 (これ未満はエラー) */
  min?: number;
  /** true なら整数のみ許可 */
  integer?: boolean;
  /** true なら 0 より大きい値のみ許可 */
  positive?: boolean;
};

const defaultMessage = ({ min, integer, positive }: NumericStringOptions) => {
  if (positive) return "0より大きい数値で入力してください";
  if (integer) return `${min ?? 0}以上の整数で入力してください`;
  if (min !== undefined) return `${min}以上の数値で入力してください`;
  return "数値で入力してください";
};

/**
 * 空文字 (未入力) or 制約を満たす数値文字列のみ許可する zod スキーマ。
 * API 側の制約 (kg/rep/rest は 0 以上、体重は正の数など) と揃えて、
 * サーバで 400 になる値をクライアント側で弾くために使う。
 */
export const numericString = (
  options: NumericStringOptions = {},
  message = defaultMessage(options),
) => {
  const { min, integer = false, positive = false } = options;
  return z.string().refine((value) => {
    const trimmed = value.trim();
    if (trimmed === "") return true;
    const parsed = Number(trimmed);
    return (
      Number.isFinite(parsed) &&
      (!integer || Number.isInteger(parsed)) &&
      (min === undefined || parsed >= min) &&
      (!positive || parsed > 0)
    );
  }, { message });
};
