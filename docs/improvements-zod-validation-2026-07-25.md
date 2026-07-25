# 実施記録: 設計方針 Part 1 Step 2 (db.ts の zod 化・キャスト排除)

実施日: 2026-07-25
対象方針: [design-policy-2026-07-25.md](./design-policy-2026-07-25.md) Part 1 Step 2
前回記録: [improvements-step2-2026-07-25.md](./improvements-step2-2026-07-25.md)
※変更は作業ツリー上のみ。git にはコミットしていません。

---

## 1. 何をしたか (`apps/api`)

### 1-1. `integrations/notion/notion.schema.ts` 新設 — zod プロパティヘルパー
Notion プロパティごとの「構造検証 + ドメイン値への transform」を行うヘルパーを実装:

| ヘルパー | 変換 |
|---|---|
| `notionTitle` / `notionRichText` | → `string` |
| `notionNumber` / `notionFormulaNumber` / `notionRollupNumber` / `notionRollupArrayNumber` | → `number \| null` |
| `notionSelect` / `notionStatus` / `notionFormulaString` | → `string \| null` |
| `notionMultiSelect` / `notionRelation` | → `string[]` |
| `notionDate` / `notionFormulaDate` | → `{ start, end } \| null` |
| `notionCreatedTime` | → `string` |
| `notionLenient(extract)` | 構造が特殊なプロパティ用の逃げ道 (既存 mapper を包む) |
| `notionPage(props)` / `notionQueryEnvelope` / `toPaginationMeta` | ページ封筒 / クエリ封筒 / meta 変換 |

`type: z.literal(...)` を検証するため、**Notion 側でプロパティ型が変わると ZodError として即検出**される(従来はキャストで素通りし、値が静かに 0/"" になっていた)。

### 1-2. 全5 feature の `*.db.ts` を zod パースベースに変更
- map 関数が `unknown` を受け取り、内部で `schema.parse()` → ドメイン型を返す形に統一。
- `*.notion.ts` の **`as unknown as` キャストをコード上ゼロに**(grep で確認)。クエリ結果は `notionQueryEnvelope.parse()` + ページ単位パース。
- ページネーション meta の組み立ても `toPaginationMeta()` に共通化。

### 1-3. 型定義の整理
- 手書きのページ型/クエリ型 (`NotionTaskPage` / `NotionExerciseQueryResult<...>` 等) を廃止し、**zod スキーマからの `z.infer` に置換**。
  - `task.types.ts` / `project.types.ts` は丸ごと削除(TASK_PROPS マップが名前カタログを兼ねる)。
  - training-app 側の `*.types.ts` は「プロパティ名と型のカタログ」(filter_properties / `xxxProp()` の型付け用) のみに縮小。
  - `notion.types.ts` から未使用の封筒型 (`NotionResults` / `BasePageMeta` / `NotionPageResults` / `NotionQueryDataSourceBodyParameters`) を削除。
- モジュール間のページ受け渡しも整理: `fetchExerciseLogWithSets` は Notion ページではなく **プレーンな参照データ `ExerciseLogRefs[]`** を受け取る形になり、exercise ↔ exerciseLog 間の結合が薄くなった。

### 1-4. 挙動を意図的に維持した箇所 (`notionLenient` + コメント)
| 箇所 | 内容 |
|---|---|
| `trainingLog.db.ts` summary の `memo` | rich_text だが従来 `getTitle` で読んでおり常に `""`。挙動維持 (直すなら `notionRichText()` に変えるだけ) |
| `trainingLog.db.ts` detail の `muslesTypesRollup` | rollup だが従来 `getFormula("string")` で読んでおり常に `null`。挙動維持 |

→ どちらも既存レスポンスの値を変えないための判断。修正したい場合の変更方法をコメントに明記済み。

### 1-5. 小改善
- `/exercise/names` が生の Notion クエリ結果をそのまま返していたのを `{id, name}[]` に変更(フロント未使用エンドポイントのため互換性影響なし)。

## 2. 検証結果 (すべて実データ)

| 検証 | 結果 |
|---|---|
| `pnpm -r typecheck` / `pnpm --filter @repo/api build` | ✅ |
| 一覧系: tasks(50件) / projects / exercise/summary / training-logs / newest / exercise/names | ✅ 全て 200 (strict パース通過) |
| 詳細系: exercise/:id / :id/logs / :id/trends / training-logs/:id / tasks/:id | ✅ 全て 200 |
| 存在しない ID の /trends | ✅ 404 |
| レスポンス JSON 形状 | ✅ 不変 (names のみ上記の通り変更) |

## 3. これで完成した「定義集約」の形

```
features/<feature>/
  <feature>.types.ts   プロパティ名と型のカタログ (filter 参照の型付け専用)
  <feature>.db.ts      zod スキーマ + map 関数 = 生名と変換を知る唯一の場所
  <feature>.notion.ts  クエリ組み立て + API 呼び出しのみ (キャストなし)
  <feature>.handler.ts リクエスト検証 + レスポンス整形
```

- Notion スキーマ変更 → **db.ts の 1ファイル修正** + 実行時は ZodError で即検出
- 方針 Step 3 (introspection による自動生成) が必要になった場合も、生成対象は db.ts のスキーマ部分だけで済む土台になった

## 4. 次の候補

- 移行手順3: TrainingLogNew/Edit のフォーム分離 + 記録作成/更新 API の実装(書き込み先プロパティの設計確認が必要)
- `exerciseSet.lib.ts` の文字列パースへのテスト追加(vitest 導入)
- `notionLenient` にした2箇所 (memo / muslesTypesRollup) を「正しい読み方」に直すかの判断
