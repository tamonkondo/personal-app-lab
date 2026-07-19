import type { DateResponse } from "@notionhq/client/build/src/api-endpoints/common";
import {
  NotionFormula,
  NotionPropertyType,
  FormulaValueMap,
  RollupValueMap,
  NotionRollup,
} from "./notion.types";

export function isFormula<T extends NotionPropertyType>(
  property: unknown,
  type: T,
): property is NotionFormula<T> {
  return (
    // リレーションを追加

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

export function isRollup<T extends NotionPropertyType>(
  property: unknown,
  type: T,
): property is NotionRollup<T> {
  return (
    typeof property === "object" &&
    property !== null &&
    "type" in property &&
    property.type === "rollup" &&
    "rollup" in property &&
    typeof property.rollup === "object" &&
    property.rollup !== null &&
    "type" in property.rollup &&
    property.rollup.type === type
  );
}

export function getRollup<T extends NotionPropertyType>(
  property: unknown,
  type: T,
): RollupValueMap[T] | null {
  if (!isRollup(property, type)) return null;
  const value = property.rollup[type] as RollupValueMap[T] | undefined;
  return value ?? null;
}

export function getRollupArray(property: unknown): unknown[] | null {
  const rollupArray = getRollup(property, "array");
  return Array.isArray(rollupArray) ? rollupArray : null;
}

type RollupArrayItemMap = {
  string: { type: "string"; string: string | null };
  number: { type: "number"; number: number | null };
  date: { type: "date"; date: DateResponse | null };
  array: { type: "array"; array: unknown[] | null };
  title: { type: "title"; title: null };
  relation: { type: "relation"; relation: { id: string }[] | null };
};

function isRollupRelationItem(
  item: unknown,
): item is RollupArrayItemMap["relation"] {
  if (
    typeof item !== "object" ||
    item === null ||
    !("type" in item) ||
    item.type !== "relation" ||
    !("relation" in item)
  ) {
    return false;
  }

  return item.relation === null || Array.isArray(item.relation);
}

function isRollupArrayItem<T extends NotionPropertyType>(
  item: unknown,
  type: T,
): item is RollupArrayItemMap[T] {
  return (
    typeof item === "object" &&
    item !== null &&
    "type" in item &&
    item.type === type &&
    type in item
  );
}

export function getRollupArrayValue<T extends NotionPropertyType>(
  property: unknown,
  type: T,
  index: number = 0,
): RollupValueMap[T] | null {
  const rollupArray = getRollupArray(property);
  if (!rollupArray || index < 0 || rollupArray.length <= index) return null;
  const item = rollupArray[index];
  if (!isRollupArrayItem(item, type)) return null;
  const typedItem = item as RollupArrayItemMap[T] &
    Record<T, RollupValueMap[T]>;
  return typedItem[type] ?? null;
}

export function getRollupRelationIds(
  property: unknown,
  index: number = 0,
): string[] {
  const rollupArray = getRollupArray(property);
  if (!rollupArray || index < 0 || rollupArray.length <= index) return [];

  const item = rollupArray[index];
  if (!isRollupRelationItem(item) || !item.relation) return [];

  return item.relation
    .filter(
      (relation): relation is { id: string } =>
        typeof relation === "object" &&
        relation !== null &&
        "id" in relation &&
        typeof relation.id === "string",
    )
    .map((relation) => relation.id);
}

export function getRollupFormulaDate(property: unknown): DateResponse | null {
  const rollupArray = getRollupArray(property);
  if (!Array.isArray(rollupArray) || rollupArray.length === 0) return null;
  return getFormula(rollupArray[0], "date");
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

export function getRelationIds(property: unknown): string[] {
  if (
    typeof property === "object" &&
    property !== null &&
    "type" in property &&
    property.type === "relation" &&
    "relation" in property &&
    Array.isArray(property.relation)
  ) {
    return property.relation.map((relation) => relation.id);
  }
  return [];
}

/** 内部ヘルパー: type が一致するプロパティの値部分を取り出す */
function getPropValue<T extends string>(property: unknown, type: T): unknown {
  if (
    typeof property === "object" &&
    property !== null &&
    "type" in property &&
    (property as { type: unknown }).type === type &&
    type in property
  ) {
    return (property as Record<string, unknown>)[type];
  }
  return null;
}

/** rich_text プロパティを plain_text 連結で取得 */
export function getRichText(property: unknown): string {
  const value = getPropValue(property, "rich_text");
  if (!Array.isArray(value)) return "";
  return value
    .map((item) =>
      typeof item === "object" && item !== null && "plain_text" in item
        ? String((item as { plain_text: unknown }).plain_text ?? "")
        : "",
    )
    .join("");
}

/** select プロパティの name を取得（未設定は null） */
export function getSelectName(property: unknown): string | null {
  const value = getPropValue(property, "select");
  if (typeof value === "object" && value !== null && "name" in value) {
    return String((value as { name: unknown }).name ?? "") || null;
  }
  return null;
}

/** status プロパティの name を取得（未設定は null） */
export function getStatusName(property: unknown): string | null {
  const value = getPropValue(property, "status");
  if (typeof value === "object" && value !== null && "name" in value) {
    return String((value as { name: unknown }).name ?? "") || null;
  }
  return null;
}

/** multi_select プロパティの name 配列を取得 */
export function getMultiSelectNames(property: unknown): string[] {
  const value = getPropValue(property, "multi_select");
  if (!Array.isArray(value)) return [];
  return value
    .map((item) =>
      typeof item === "object" && item !== null && "name" in item
        ? String((item as { name: unknown }).name ?? "")
        : "",
    )
    .filter((name) => name.length > 0);
}

/** date プロパティの { start, end } を取得（未設定は null） */
export function getDate(
  property: unknown,
): { start: string | null; end: string | null } | null {
  const value = getPropValue(property, "date");
  if (typeof value === "object" && value !== null && "start" in value) {
    const v = value as { start: unknown; end?: unknown };
    return {
      start: v.start != null ? String(v.start) : null,
      end: v.end != null ? String(v.end) : null,
    };
  }
  return null;
}

/** checkbox プロパティの真偽値を取得 */
export function getCheckbox(property: unknown): boolean {
  const value = getPropValue(property, "checkbox");
  return typeof value === "boolean" ? value : false;
}

/** created_time プロパティの ISO 文字列を取得 */
export function getCreatedTime(property: unknown): string | null {
  const value = getPropValue(property, "created_time");
  return typeof value === "string" ? value : null;
}
