/**
 * 過去日付対応の一回限りの移行スクリプト。
 * TRAINING_LOGS / EXERCISE_LOGS の全ページについて、date プロパティが
 * 未設定のレコードへ created_time (Asia/Tokyo の日付) を書き込む。
 *
 * 前提: 両 DB に date という名前の「日付」プロパティを Notion UI で作成済みであること。
 *
 * 実行方法 (apps/api で):
 *   pnpm exec tsx scripts/backfill-record-dates.ts           # dry-run (書き込みなし)
 *   pnpm exec tsx scripts/backfill-record-dates.ts --apply   # 実際に書き込む
 */
import notionClient from "../src/integrations/notion/notion.client";
import { config } from "../src/libs/config";
import notionLimit from "../src/libs/notion/notionLimit";
import { notionQueryEnvelope } from "../src/integrations/notion/notion.schema";
import { z } from "zod";

const apply = process.argv.includes("--apply");

/** created_time (UTC ISO) → Asia/Tokyo の YYYY-MM-DD */
function toJstDateString(isoDateTime: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(isoDateTime));
}

const backfillPageSchema = z.object({
  id: z.string(),
  created_time: z.string(),
  properties: z.object({
    date: z
      .object({
        type: z.literal("date"),
        date: z.object({ start: z.string().nullable() }).nullable(),
      })
      .optional(),
  }),
});

async function backfillDatabase(label: string, dataSourceId: string) {
  console.log(`\n=== ${label} ===`);
  let cursor: string | undefined;
  let total = 0;
  let updated = 0;
  let skipped = 0;

  do {
    const envelope = notionQueryEnvelope.parse(
      await notionClient.dataSources.query({
        data_source_id: dataSourceId,
        page_size: 100,
        start_cursor: cursor,
      }),
    );

    for (const raw of envelope.results) {
      const page = backfillPageSchema.parse(raw);
      total += 1;

      if (page.properties.date === undefined) {
        throw new Error(
          `${label} に date プロパティがありません。先に Notion UI で「日付」型の date プロパティを作成してください。`,
        );
      }
      if (page.properties.date.date?.start) {
        skipped += 1;
        continue;
      }

      const dateString = toJstDateString(page.created_time);
      if (apply) {
        await notionLimit(() =>
          notionClient.pages.update({
            page_id: page.id,
            properties: { date: { date: { start: dateString } } },
          }),
        );
        console.log(`  更新: ${page.id} → ${dateString}`);
      } else {
        console.log(`  [dry-run] ${page.id} → ${dateString}`);
      }
      updated += 1;
    }

    cursor = envelope.next_cursor ?? undefined;
  } while (cursor);

  console.log(
    `${label}: 全${total}件 / ${apply ? "更新" : "更新予定"}${updated}件 / 設定済みスキップ${skipped}件`,
  );
}

async function main() {
  console.log(
    apply
      ? "--apply 指定: date プロパティへ書き込みます"
      : "dry-run: 書き込みは行いません (--apply で実行)",
  );
  await backfillDatabase(
    "TRAINING_LOGS",
    config.NOTION_TRAINING_LOGS_DATABASE_ID,
  );
  await backfillDatabase(
    "EXERCISE_LOGS",
    config.NOTION_EXERCISE_LOGS_DATABASE_ID,
  );
  console.log("\n完了");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
