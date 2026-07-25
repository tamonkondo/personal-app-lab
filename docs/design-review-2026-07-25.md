# 設計レビュー資料: `apps/*`（フロント）と `apps/api`

作成日: 2026-07-25 / 対象コミット: `59437ff`
※本資料は git にはコミットしていません（未追跡ファイル）。

---

## 0. 全体像

pnpm workspace のモノレポ。`apps/*` に 3 つのフロント（`portal` / `notion-training-app` / `notion-todo-pomodoro-app`）と `apps/api`、`packages/*` に共有モジュール（`ui` / `types` / `schemas` / `utils`）を配置。

```
apps/
  api/                     Express + Notion SDK バックエンド
  portal/                  アプリ一覧のランチャー（薄い静的ページ）
  notion-training-app/     トレーニング記録（一番成熟）
  notion-todo-pomodoro-app/ ポモドーロ + タスク（データ層が一番きれい）
packages/
  ui/       shadcn 系の共通コンポーネント（3アプリで共有）
  types/    レスポンス/ドメイン型（フロント・API 双方で共有）
  schemas/  zod スキーマ（types の enum から導出、フロント・API 双方で共有）
  utils/    formatDate のみ
```

**技術スタック**
- フロント: React 19 / react-router-dom 7 / Vite 8 / Tailwind v4 / SWR / Zustand / zod v4 / Sentry
- API: Node + Express / Notion SDK (`@notionhq/client` v5) / tsup / p-limit / zod / Sentry
- TypeScript 7 (strict) / pnpm 11 catalog でバージョン集中管理

---

## 1. 良いところ（設計として効いている点）

### 共通
- **契約（型・スキーマ）の単一ソース化。** `@repo/types` のレスポンス型と `@repo/schemas` の zod スキーマをフロントと API の両方が import している。しかも zod の enum は `@repo/types` の const 配列（`TASK_STATUSES` など）から導出しているので、ステータス/カテゴリの定義が二重管理にならない。**これが本リポジトリで一番効いている設計判断。**
- **catalog によるバージョン集中管理。** `pnpm-workspace.yaml` の catalog で react / vite / zod / typescript などを一括ピン留め。`minimumReleaseAgeExclude` まで運用しており、依存管理の意識が高い。
- **strict な TS ベースライン。** `tsconfig.base.json` で `strict` / `noUnusedLocals` / `noUnusedParameters` / `noFallthroughCasesInSwitch`。
- **秘密情報は未コミット。** `.env` は gitignore 済み、`.env.example` を用意。

### API
- **縦割り（feature-sliced）構成。** `modules/<app>/features/<feature>/` 配下に `handler` / `notion` / `types` / `schema` を co-locate。ルーティング → ハンドラ → Notion アクセス層の責務分離が明確。
- **Notion アクセスの抽象化。** `integrations/notion/notion.mapper.ts` に「型ガード + セーフ抽出」を集約（`getFormula` / `getRollup` / `getTitle` / `getRichText` / `getDate` …）。Notion SDK の生レスポンスの `unknown` を安全にドメイン値へ変換できている。
- **`filter_properties` を型安全に定義するヘルパー。** `notionDefineProperties<T>()([...])` + `NotionKeysOfProperties` で「取得するプロパティのキー配列」と「返却ページの型」を連動させている。過剰取得を防ぎつつ型がずれない工夫。
- **`asyncHandler` による async エラーの一元 catch。** `Promise.resolve(fn(...)).catch(next)` で try/catch の書き漏れを防止。
- **Notion API のレート制御。** `p-limit(3)` (`notionLimit`) でページ retrieve の並列数を絞っており、`fetchExerciseLogWithSets` で活用。
- **入力バリデーション（一部）。** `createTask` / `updateTask` は `safeParse` → 失敗時 400 + `issues` を返す、正しい形。

### フロント
- **URL をステートの主にする設計。** フィルタ状態を URL search params に持ち、zod `.catch()` でデフォルト付きパース（`taskListParamsSchema` は `.catch("active")`）。壊れたクエリでも UI が落ちない。
- **SWR フックの型付けが一貫。** `useSWRInfinite` の `getKey` が `meta.next_cursor` で終端する契約が統一されている。`revalidateOnFocus: false` 等も揃っている。
- **ntpa のミューテーション設計が模範的。** `useTaskMutations` が `mutateJson` + `useSWRConfig().mutate` のキー prefix マッチャで一覧キャッシュをまとめて revalidate、`isSubmitting` も管理。
- **ポモドーロタイマーが deadline ベース。** カウントダウン変数ではなく締切時刻(ms)を保持 → タブスロットリングに強い。`localStorage` の読み書きも try/catch。

---

## 2. 駄目なところ / リスク

### API

1. **エラーハンドラが全部 500 に丸める。**
   `middleware/errorHandler.ts` は常に `500 Internal Server Error`。ハンドラ内で `throw new Error("Exercise not found")` していても、クライアントには 404 ではなく 500 が返る（`fetchExerciseTrends` / `fetchExerciseSummaryLogs` など）。エラー種別 → HTTP ステータスのマッピングが無い。

2. **本番に残った `console.log` / `console.time` の量。**
   `exercise.notion.ts` の `console.log(exercises)`、`getExerciseSummaryLogs` の `console.log(exerciseSummaryLogs)`、各所の `console.time`、`app.ts` の `[START] ...` と `From message:` ログ。しかも Sentry の `consoleLoggingIntegration({ levels: ["log","warn","error"] })` により **`console.log` が全部 Sentry ログとして送信される**。ノイズ・コスト・情報漏洩の観点で問題。ログレベル制御 or logger 導入が必要。

3. **`process.env` を各所で直接参照（設定の一元化なし）。**
   `NOTION_EXERCISES_DATABASE_ID!` のような non-null assertion がハンドラ層に散在。起動時に env を zod で検証する `config` モジュールが無いため、環境変数の設定漏れが「実行時に Notion API が謎エラー」という形でしか露見しない。

4. **`as unknown as ...` 二段キャストが常態化。**
   Notion SDK 呼び出しの戻り値をほぼ全て `as unknown as NotionXxxResult` でねじ込んでいる。マッパー層は堅牢なのに、クエリ結果の `results` 配列側の型安全性はキャスト頼み。ランタイムでは検証していないので、Notion 側のスキーマ変更に弱い。

5. **バリデーションの一貫性欠如。**
   ポモドーロ側（task）は `safeParse` するのに、トレーニング側（exercise / trainingLog）はクエリを `Number(limit)` 等で素通し。`req.query as Partial<...>` のキャストだけで zod 検証していない。`schemas` に query スキーマを足して両モジュールで揃えるべき。

6. **CORS が実質全許可。** `cors({ origin: true, credentials: true })`。コメントに「後で許可するオリジンを指定」とある通り未対応。`credentials: true` と全 origin 許可の併用は本番で危険。

7. **ミドルウェアの登録順が一部おかしい。**
   `app.ts` で `Sentry.setupExpressErrorHandler(app)` を**ルート定義より前**に呼んでいる（本来はルートの後、エラーハンドラの直前）。また `express.json()` の登録が CORS/cookie の後になっており、コメント「Error handling middleware」の位置に実体が無いなど、配置が整理されていない。

8. **デッド/コメントアウトコード。** `libs/prisma.ts` は全行コメントアウト（README は「DBアクセス: Prisma」と書くが実際は未使用＝Notion が実データソース）。README と実態の乖離。

9. **`exerciseSet.lib.ts` の文字列パースが脆い。**
   Notion 数式が吐く `kg|rep|memo|_|maxWeight|id|pageName` を `split("|")` / `split(";;")` で分解。区切り文字がデータに混ざると壊れる、フォーマット変更に無防備。テストも無い。

### フロント

10. **`src/lib/fetch.ts` がアプリ間でコピペ＆分岐。**
    nta 版は英語メッセージの GET only、ntpa 版は日本語メッセージ + `mutateJson` 付きと**実装が乖離**。共有パッケージ（`@repo/api-client` 等）に無い。

11. **URL 組み立てが手書きテンプレートリテラルで壊れやすい（nta）。**
    `useExerciseSummaryInfinite.ts` 等で `?limit=5&sort=${elSort||""}&parts=${...}` のように連結。空パラメータ送信・未エンコード・ページ0とそれ以降でURL文字列を丸ごと重複。ntpa の `URLSearchParams` ベース（`buildTasksKey`）が正解なのに横展開されていない。

12. **エラーバウンダリが無い。** どのアプリにも React error boundary が無い。nta は Sentry 初期化済みだが `<Sentry.ErrorBoundary>` 未使用、**ntpa は DSN を .env に持つのに Sentry を import すらしていない（設定が死んでいる）**。

13. **env の型付け・検証なし。** `import.meta.env.VITE_API_URL as string` の無検査キャスト。`vite-env.d.ts` に `ImportMetaEnv` 型が無く、env が実質 `any`。未定義時のフォールバックも無い。

14. **レスポンス封筒型のローカル再定義。** `@repo/types` に `ApiResponse<T>` があるのに `useExerciseDetail.ts` が独自 `{ message; data }` を再宣言。共有型を使えていない箇所が散在。

15. **nta にミューテーション層が無い。** New/Edit ページは UI のみで「登録する」ボタンが `disabled`。`@repo/schemas` に `createTrainingLogSchema` は既にあるので、ntpa の `useTaskMutations` を移植すれば機能する。

16. **共通レイアウトの不在（nta）。** ダークヒーロー `<section class="rounded-3xl bg-zinc-950...">` を各ページで重複記述。ntpa は `AppLayout` で集約済みだが**その AppLayout も共有化されていない**。

17. **潜在バグ: ルート不整合。** `DailyLogsHeader.tsx` は `/training-log/${id}`（単数）へリンクするが、router は `/training-logs/:trainingId`（複数）。404 の地雷。

18. **細かい重複/残骸。** nta の body-part 定数が 2 箇所（`src/constants/parts.ts` と `features/exercise/constants/constants.ts`）、search-param リセットロジックが `lib/searchParams.ts` とフック内で二重実装、空ファイル `features/trainingLog/types/types.ts`。

19. **`packages/types` / `packages/schemas` に `package.json` が無い。** `packages/*` の workspace glob 対象なのに `name` を持つ `package.json` が無く、解決は tsconfig paths 頼み。ビルドツール依存（tsup/tsx が paths を解決できる前提）で、真の package 境界になっていない。

20. **`portal` の認証が未実装。** Login/Logout はプレースホルダ。分割された Vite アプリ間のセッション共有（Cookie 認証を API に集約する構想）が未着手。

---

## 3. 改善提案（優先度順）

### すぐ効く（Quick win / 低コスト）
- **P1: API のエラーマッピング。** `AppError`（`status`, `code`, `message`）クラスを導入し、`errorHandler` で `err.status ?? 500` を返す。「not found」系は 404 を返せるように。→ 項目1,9
- **P1: ログ整理。** `console.log(exercises)` などデバッグ出力を削除、Sentry の `consoleLoggingIntegration` の levels を `["warn","error"]` に絞る（または pino/debug 導入）。→ 項目2
- **P1: CORS の origin を env（許可リスト）で指定。** → 項目6
- **P1: ルート不整合 `/training-log` → `/training-logs` 修正。** → 項目17
- **P2: デッドコード削除。** `libs/prisma.ts`、空 `types.ts`、重複 body-part 定数、二重 search-param ヘルパー。README の「Prisma」記述を実態（Notion）に合わせる。→ 項目8,18

### 中期（構造の底上げ）
- **P1: 環境変数の一元化＋起動時検証。**
  - API: `libs/config.ts` で `process.env` を zod 検証し、そこ経由で参照（`NOTION_*_DATABASE_ID!` の散在を排除）。→ 項目3
  - フロント: `vite-env.d.ts` で `ImportMetaEnv` を型付け、`API_BASE` 定数を1箇所に。→ 項目11,13
- **P1: `@repo/api-client` パッケージを新設。**
  - `createFetcher` / `mutateJson`、`ApiError` クラス、`buildQuery(params)`（`URLSearchParams` ラッパ）を集約。
  - nta / ntpa の `src/lib/fetch.ts` を削除して置換、nta の手書きクエリを `buildQuery` に統一。→ 項目10,11
- **P2: フロントのバリデーション/型を共有型に寄せる。** ローカル封筒型を `ApiResponse<T>` / `PaginatedResponse<T>` に置換。→ 項目14
- **P2: エラーバウンダリを各アプリ root に追加。** `Sentry.ErrorBoundary` を `main.tsx` に。ntpa の Sentry は配線するか DSN を消すか決める。全 error 分岐を1経路の通報に。→ 項目12
- **P2: API のクエリバリデーション統一。** exercise/trainingLog にも zod query スキーマ（`@repo/schemas`）を用意し、`safeParse` を全ハンドラで統一。→ 項目5
- **P2: `packages/types` / `packages/schemas` に `package.json`（name/exports）を付与。** 真の workspace package にしてツール非依存の解決に。→ 項目19

### 長期 / 設計テーマ
- **P3: nta の共通 `AppLayout` 化 → できれば ntpa と共通レイアウトを `@repo/ui` へ。** ヒーロー/ナビの重複解消。→ 項目16
- **P3: nta の New/Edit にミューテーションを実装（ntpa の `useTaskMutations` パターン移植）。** → 項目15
- **P3: `exerciseSet.lib.ts` の文字列パースにテスト追加＋防御的パース。** → 項目9
- **P3: Notion クエリ結果の `as unknown as` を、`results` 配列に対する軽量ランタイム検証（zod など）へ段階的に置換。** → 項目4
- **P3: portal の認証（Cookie を API に集約）を設計・実装。** アプリ間セッション共有方針を決める。→ 項目20
- **P3: date フォーマットを `@repo/utils` に集約**（ntpa の `format.ts` を吸収）。

---

## 4. コード共有の現状（要約）

| 区分 | 状態 |
|---|---|
| `@repo/ui`（shadcn系 ~18 コンポーネント） | ✅ 3アプリで良好に共有 |
| `@repo/types`（レスポンス/ドメイン型） | ✅ フロント・API で共有 |
| `@repo/schemas`（zod、types の enum 由来） | ✅ フロント・API で共有 |
| `@repo/utils` | △ `formatDate` のみ。date系がアプリ内に散る |
| fetch / エラー処理 / クエリ組立 / env 参照 | ❌ **アプリ間で重複・不整合（最大の負債）** |
| レイアウト/ヒーロー markup | ❌ nta 内で重複、ntpa の AppLayout も未共有 |

**総評:** UI と「型・スキーマの契約」は良く共有できている。一方で**ランタイムのデータアクセス層（fetch・エラー処理・クエリ組立・env アクセス）が重複＆不統一**で、ここが 3 フロント横断の最大の技術的負債。API 側は縦割り構成とマッパー層が良い設計だが、**エラー→HTTP マッピング・ログ整理・env 検証・バリデーション統一**が次の一手。
