/**
 * Notion プロパティのセーフ抽出ヘルパー (レガシー)。
 *
 * ページの読み取りは原則 notion.schema.ts の zod ヘルパーで行う。
 * ここに残っているのは、構造が特殊で notionLenient() 経由でのみ使う関数だけ
 * (利用箇所: trainingLog.db.ts)。新規コードでの直接利用は避けること。
 */
import {
  NotionFormula,
  NotionPropertyType,
  FormulaValueMap,
} from "./notion.types";

function isFormula<T extends NotionPropertyType>(
  property: unknown,
  type: T,
): property is NotionFormula<T> {
  return (
    typeof property === "object" &&
    property !== null &&
    "type" in property &&
    property.type === "formula" &&
    "formula" in property &&
    typeof property.formula === "object" &&
    property.formula !== null &&
    "type" in property.formula &&
    property.formula.type === type
  );
}

export function getFormula<T extends NotionPropertyType>(
  property: unknown,
  type: T,
): FormulaValueMap[T] | null {
  if (!isFormula(property, type)) return null;
  const value = property.formula[type] as FormulaValueMap[T] | undefined;
  return value ?? null;
}

export function getTitle(property: unknown): string {
  if (
    typeof property === "object" &&
    property !== null &&
    "type" in property &&
    property.type === "title" &&
    "title" in property &&
    Array.isArray(property.title) &&
    property.title.length > 0 &&
    "plain_text" in property.title[0]
  ) {
    return property.title[0].plain_text;
  }
  return "";
}
