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

export function getRollupFormulaDate(property: unknown): DateResponse | null {
  const rollupArray = getRollupArray(property);
  if (!Array.isArray(rollupArray) || rollupArray.length === 0) return null;
  return getFormula(rollupArray[0], "date");
}
