// notionTypes.ts
import type {
  DateResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

/**
 * どのDBでも共通で持っているページのメタ情報
 */
export type NotionPropsOf<P extends PageObjectResponse> = P["properties"];
export type NotionPageProps = NotionPropsOf<PageObjectResponse>;
export type NotionProp<
  Name extends keyof NotionPageProps,
  Kind extends NotionPageProps[Name]["type"],
> = Extract<NotionPageProps[Name], { type: Kind }>;
export type NotionResults<T> = PageObjectResponse & {
  object: string;
  next_cursor: string | null;
  has_more: boolean;
  results: T[];
};
export type NotionPageResults<T> = PageObjectResponse & {
  object: string;
  properties: T;
};
export type BasePageMeta = Pick<
  PageObjectResponse,
  | "id"
  | "object"
  | "created_time"
  | "last_edited_time"
  | "created_by"
  | "last_edited_by"
  | "parent"
  | "in_trash"
  | "is_archived"
  | "is_locked"
  | "cover"
  | "icon"
  | "url"
  | "public_url"
>;

export type NotionPropertyType =
  | "string"
  | "number"
  | "date"
  | "title"
  | "array";

export type FormulaValueMap = {
  string: string | null;
  number: number | null;
  date: DateResponse | null;
  title: null;
  array: unknown[] | null;
};
export type RollupValueMap = {
  string: string | null;
  number: number | null;
  date: DateResponse | null;
  title: null;
  array: unknown[] | null;
};
export type NotionFormula<T extends NotionPropertyType> = {
  id: string;
  type: "formula";
  formula: { type: T } & Partial<Record<NotionPropertyType, unknown>> & {
      [K in T]: FormulaValueMap[K];
    };
};

export type NotionRollup<T extends NotionPropertyType> = {
  type: "rollup";
  rollup: { type: T } & Partial<Record<NotionPropertyType, unknown>> & {
      [K in T]: RollupValueMap[K];
    };
};
