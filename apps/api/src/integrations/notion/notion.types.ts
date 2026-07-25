// notionTypes.ts
import type {
  DateResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

/**
 * Notion プロパティの型カタログ用ユーティリティ。
 * 各 feature の *.types.ts が「プロパティ名 → プロパティ型」の宣言に使う。
 * (ページ封筒/クエリ結果の型は zod スキーマ (notion.schema.ts) から z.infer で導出するため廃止)
 */
export type NotionPropsOf<P extends PageObjectResponse> = P["properties"];
export type NotionPageProps = NotionPropsOf<PageObjectResponse>;
export type NotionProp<
  Name extends keyof NotionPageProps,
  Kind extends NotionPageProps[Name]["type"],
> = Extract<NotionPageProps[Name], { type: Kind }>;

export type NotionPropertyType =
  | "string"
  | "number"
  | "date"
  | "title"
  | "array"
  | "relation";

export type FormulaValueMap = {
  string: string | null;
  number: number | null;
  date: DateResponse | null;
  title: null;
  array: unknown[] | null;
  relation: unknown[] | null;
};
export type NotionFormula<T extends NotionPropertyType> = {
  id: string;
  type: "formula";
  formula: { type: T } & Partial<Record<NotionPropertyType, unknown>> & {
      [K in T]: FormulaValueMap[K];
    };
};
