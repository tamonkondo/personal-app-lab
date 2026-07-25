/**
 * Notion プロパティの zod スキーマヘルパー。
 * 「生の Notion レスポンス (unknown) → ドメイン値」の変換をランタイム検証付きで行う。
 * (設計方針: docs/design-policy-2026-07-25.md Part 1 Step 2)
 *
 * - 各ヘルパーは Notion プロパティの構造を検証し、値だけを取り出して返す
 * - Notion 側のスキーマ変更 (プロパティ型の変更等) はここで ZodError として即検出される
 * - 例外的に構造が特殊/不定なプロパティは既存 mapper を transform で包んで使う
 */
import { z } from "zod";

/** title → プレーンテキスト (先頭要素。未設定は "") */
export const notionTitle = () =>
  z
    .object({
      type: z.literal("title"),
      title: z.array(z.object({ plain_text: z.string() })),
    })
    .transform((v) => v.title[0]?.plain_text ?? "");

/** rich_text → 全要素の plain_text 連結 (未設定は "") */
export const notionRichText = () =>
  z
    .object({
      type: z.literal("rich_text"),
      rich_text: z.array(z.object({ plain_text: z.string() })),
    })
    .transform((v) => v.rich_text.map((item) => item.plain_text).join(""));

/** number → number | null */
export const notionNumber = () =>
  z
    .object({ type: z.literal("number"), number: z.number().nullable() })
    .transform((v) => v.number);

/** select → name | null */
export const notionSelect = () =>
  z
    .object({
      type: z.literal("select"),
      select: z.object({ name: z.string() }).nullable(),
    })
    .transform((v) => v.select?.name ?? null);

/** status → name | null */
export const notionStatus = () =>
  z
    .object({
      type: z.literal("status"),
      status: z.object({ name: z.string() }).nullable(),
    })
    .transform((v) => v.status?.name ?? null);

/** multi_select → name の配列 */
export const notionMultiSelect = () =>
  z
    .object({
      type: z.literal("multi_select"),
      multi_select: z.array(z.object({ name: z.string() })),
    })
    .transform((v) => v.multi_select.map((item) => item.name));

/** date → { start, end } | null */
export const notionDate = () =>
  z
    .object({
      type: z.literal("date"),
      date: z
        .object({
          start: z.string().nullable(),
          end: z.string().nullable().optional(),
        })
        .nullable(),
    })
    .transform((v) =>
      v.date ? { start: v.date.start, end: v.date.end ?? null } : null,
    );

/** relation → id の配列 */
export const notionRelation = () =>
  z
    .object({
      type: z.literal("relation"),
      relation: z.array(z.object({ id: z.string() })),
    })
    .transform((v) => v.relation.map((item) => item.id));

/** created_time → ISO 文字列 | null */
export const notionCreatedTime = () =>
  z
    .object({ type: z.literal("created_time"), created_time: z.string() })
    .transform((v) => v.created_time);

/** formula (string) → string | null */
export const notionFormulaString = () =>
  z
    .object({
      type: z.literal("formula"),
      formula: z.object({ string: z.string().nullable().optional() }),
    })
    .transform((v) => v.formula.string ?? null);

/** formula (number) → number | null */
export const notionFormulaNumber = () =>
  z
    .object({
      type: z.literal("formula"),
      formula: z.object({ number: z.number().nullable().optional() }),
    })
    .transform((v) => v.formula.number ?? null);

/** formula (date) → { start, end } | null */
export const notionFormulaDate = () =>
  z
    .object({
      type: z.literal("formula"),
      formula: z.object({
        date: z
          .object({
            start: z.string().nullable(),
            end: z.string().nullable().optional(),
          })
          .nullable()
          .optional(),
      }),
    })
    .transform((v) =>
      v.formula.date
        ? { start: v.formula.date.start, end: v.formula.date.end ?? null }
        : null,
    );

/** rollup (number) → number | null */
export const notionRollupNumber = () =>
  z
    .object({
      type: z.literal("rollup"),
      rollup: z.object({ number: z.number().nullable().optional() }),
    })
    .transform((v) => v.rollup.number ?? null);

/** rollup (array の先頭 number) → number | null */
export const notionRollupArrayNumber = () =>
  z
    .object({
      type: z.literal("rollup"),
      rollup: z.object({
        array: z.array(
          z.object({ number: z.number().nullable().optional() }).or(z.unknown()),
        ),
      }),
    })
    .transform((v) => {
      const first = v.rollup.array[0];
      if (
        typeof first === "object" &&
        first !== null &&
        "number" in first &&
        typeof (first as { number: unknown }).number === "number"
      ) {
        return (first as { number: number }).number;
      }
      return null;
    });

/**
 * 構造が特殊/不定なプロパティ用の逃げ道。
 * 既存 mapper (getFormula 等) を包み、検証せず安全に値を取り出す。
 * 使う場合はコメントで理由を書くこと。
 */
export const notionLenient = <T>(extract: (value: unknown) => T) =>
  z.unknown().transform(extract);

/** ページ共通の封筒 (id / url / created_time / properties) */
export const notionPage = <T extends z.ZodRawShape>(properties: T) =>
  z.object({
    id: z.string(),
    url: z.string().catch(""),
    created_time: z.string().catch(""),
    properties: z.object(properties),
  });

/** dataSources.query の封筒 (results はページ単位で個別パースする) */
export const notionQueryEnvelope = z.object({
  results: z.array(z.unknown()),
  has_more: z.boolean().catch(false),
  next_cursor: z.string().nullable().catch(null),
});

export type NotionQueryEnvelope = z.infer<typeof notionQueryEnvelope>;

/** 封筒 → 共通ページネーション meta */
export const toPaginationMeta = (envelope: NotionQueryEnvelope) => ({
  has_more: envelope.has_more,
  next_cursor: envelope.next_cursor || undefined,
});
