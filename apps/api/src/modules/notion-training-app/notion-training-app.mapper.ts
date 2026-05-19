type NotionPropertyType = "string" | "number" | "created_time" | "title";

export type NotionFormula<T> = {
  id: string;
  type: "formula";
  formula: {
    type: T;
    [key: string]: T | null;
  };
};
export function isFormula(
  property: unknown,
  type: NotionPropertyType = "string",
): property is NotionFormula<typeof type> {
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

export function getFormula(
  property: unknown,
  type: NotionPropertyType,
): NotionPropertyType | null {
  if (!isFormula(property, type)) return null;
  return property.formula[type];
}
export type NotionRollup<T> = {
  type: "rollup";
  rollup: {
    type: T;
    [key: string]: T | null;
  };
};

export function isRollup(
  property: unknown,
  type: NotionPropertyType,
): property is NotionRollup<typeof type> {
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

export function getRollup(
  property: unknown,
  type: NotionPropertyType = "number",
): NotionPropertyType | null {
  if (!isRollup(property, type)) return null;
  return property.rollup[type];
}
