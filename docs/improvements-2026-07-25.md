# 改善実施記録: 設計レビュー指摘への対応

実施日: 2026-07-25
対象レビュー: [design-review-2026-07-25.md](./design-review-2026-07-25.md)
※本資料・変更ともに git にはコミットしていません(作業ツリー上の変更のみ)。

---

## 1. API (`apps/api`)

### 1-1. 環境変数の一元化 + 起動時検証 (指摘3) ✅
- **新規** `src/libs/config.ts`: 全環境変数を zod で起動時検証。設定漏れは起動エラーとして即検出。
- 散在していた `process.env.X!` (non-null assertion) を全て `config.X` 参照に置換:
  - `notion.client.ts` / `task.notion.ts` / `project.notion.ts` / `exercise.notion.ts` / `trainingLog.notion.ts` / `sentry.ts` / `index.ts`
- `.env.example` に `CORS_ORIGINS` を追記。

### 1-2. エラー → HTTP ステータスのマッピング (指摘1) ✅
- **新規** `src/libs/errors.ts`: `AppError` / `NotFoundError` / `BadRequestError`。
- `middleware/errorHandler.ts`: `AppError` の `status`/`code` を返すよう修正(従来は全部 500)。4xx は `console.error` しない。
- `fetchExerciseTrends` の not found を `NotFoundError`(404)に変更。
- **動作確認済み**: 存在しない ID への `/trends` が `404 {"message":..., "code":"NOT_FOUND"}` を返す。

### 1-3. ログ整理 + Sentry 送信レベル絞り込み (指摘2) ✅
- デバッグ用 `console.log` / `console.time` を削除:
  - `exercise.notion.ts`(レスポンス丸ごと dump していた `console.log(exercises)` 等)
  - `exercise.handler.ts` / `trainingLog.handler.ts` / `trainingLog.notion.ts` / `exerciseLog.notion.ts`
- `app.ts` の `[START]` 独自ミドルウェアと morgan の `From message:` ラッパーを削除(morgan "tiny" のみに)。
- `libs/sentry.ts`: `consoleLoggingIntegration` の levels を `["log","warn","error"]` → `["warn","error"]` に。**console.log が全て Sentry に送信される問題を解消**。

### 1-4. CORS 許可リスト化 (指摘6) ✅
- `app.ts`: `origin: true`(全許可)→ `CORS_ORIGINS` 環境変数の許可リスト。未設定時は `localhost` のみ許可。

### 1-5. ミドルウェア順序の修正 (指摘7) ✅
- `Sentry.setupExpressErrorHandler(app)` をルート定義の**後**・自前 `errorHandler` の**前**に移動(従来はルートより前で呼ばれており機能していなかった)。

### 1-6. クエリバリデーション統一 (指摘5) ✅
- `@repo/schemas` に `paginationQuerySchema` を追加、`@repo/schemas/notion-training-app` に `trainingLogListQuerySchema` を追加。
- `exercise.handler.ts` / `trainingLog.handler.ts` の `as Partial<...>` キャスト+素通し `Number()` を zod パースに置換(不正値はデフォルトへフォールバック。`?limit=abc` でも 200 を確認)。

### 1-7. デッドコード削除 (指摘8) ✅
- 全行コメントアウトだった `src/libs/prisma.ts` を削除(参照ゼロを確認)。
- `README.md` の「DBアクセス: Prisma」を実態の「データソース: Notion API」に修正。

### 1-8. 【追加発見・修正】`/exercise/:id/trends` が常に 500 になるバグ ✅
- `fetchExerciseTrends` がデータソースに存在しない `id` プロパティで `query` していたため、Notion が `validation_error` を返し**どんな ID でも 500** だった。
- ページ ID で直接 `pages.retrieve` する方式に修正。失敗時は 404。

---

## 2. 共有パッケージ (`packages/*`)

### 2-1. `@repo/api-client` 新設 (指摘10,11) ✅
- **新規** `packages/api-client/index.ts`:
  - `fetcher<T>` / `mutateJson<T>`: 両アプリにコピペされ実装が乖離していたものを集約。
  - `ApiError`: `status` + レスポンスボディを保持。**API のエラーボディ (`message`) をパースしてエラーメッセージに反映**(従来は固定文言のみ)。
  - `buildQuery()`: `URLSearchParams` ベース。null/undefined/空文字は**送信しない**+自動エンコード。
- `tsconfig.base.json` と両アプリの `vite.config.ts` に `@repo/api-client` の alias を追加(既存の alias 方式に合わせた)。

### 2-2. 共有 `ErrorBoundary` を `@repo/ui` に追加 (指摘12) ✅
- **新規** `packages/ui/components/ui/error-boundary.tsx`(`onError` コールバック付き。Sentry 連携はアプリ側で注入)。

### 2-3. `packages/tsconfig.json` の既存問題を修正 ✅
- TypeScript 7 で削除された `baseUrl` が残っておりコンパイル不能だった → 削除。
- paths が base を上書きして `@repo/*` が解決不能だった → paths を補完。`tsc -p packages/tsconfig.json` がクリーンに通ることを確認。
- include に `api-client/index.ts` を追加。

---

## 3. フロントエンド

### 3-1. `notion-training-app` (nta)
- **env の型付け+検証 (指摘13)**: `src/vite-env.d.ts` 新設(`ImportMetaEnv` 型付け)。`lib/fetch.ts` で `VITE_API_URL` 未設定時に起動エラー。`API_BASE` を単一箇所で定義し、フック内の `import.meta.env` 直接参照を全廃。
- **fetch 層の共有化 (指摘10)**: `lib/fetch.ts` は `@repo/api-client` の薄い re-export + `API_BASE` のみに。
- **手書きクエリ文字列の撲滅 (指摘11)**: `useTrainingLogsInfinite` / `useExerciseSummaryInfinite` / `useExerciseLogsInfinite` を `buildQuery()` に置換。空パラメータ送信 (`sort=&parts=`)・未エンコード・1ページ目とそれ以降の URL 重複を解消。
- **封筒型の共有化 (指摘14)**: `useExerciseDetail` のローカル `ExerciseDetailResponse` を `ApiResponse<ExerciseDetail | null>`(`@repo/types`)に置換。
- **ErrorBoundary (指摘12)**: `main.tsx` を `<ErrorBoundary onError={Sentry.captureException}>` でラップ。
- **Sentry レベル絞り込み (指摘2と同種)**: `lib/sentry.ts` の levels を `["warn","error"]` に。
- **ルート不整合の修正 (指摘17)**: `DailyLogsHeader.tsx` のリンク `/training-log/${id}` → `/training-logs/${id}`(潜在 404 を解消)。
- **二重実装の解消 (指摘18)**: `useExerciseDetailParams` 内の search-param リセットロジックを `lib/searchParams.ts` の `createSetSearchParamsWithReset` に置換。
- **残骸削除 (指摘18)**: 空ファイル `features/trainingLog/types/types.ts` を削除。

### 3-2. `notion-todo-pomodoro-app` (ntpa)
- `lib/fetch.ts` を `@repo/api-client` の re-export + `API_BASE`(未設定時エラー)に置換。既存の named import (`fetcher`, `mutateJson`, `API_BASE`) はそのまま動作。
- `src/vite-env.d.ts` 新設。
- `main.tsx` を `<ErrorBoundary>` でラップ。

---

## 4. レビュー指摘の訂正

- **指摘18の一部は誤りだった**: 「body-part 定数が nta 内の2箇所に重複」とあったが、実際は `src/constants/parts.ts`(部位リスト)と `features/exercise/constants/constants.ts`(トレンド期間オプション)で**別物**。統合は不要と判断し、変更していない。

---

## 5. 検証結果

| 検証 | 結果 |
|---|---|
| `pnpm -r typecheck`(4アプリ) | ✅ 全て成功 |
| `tsc -p packages/tsconfig.json` | ✅ エラーなし(修正前はコンパイル不能) |
| `pnpm --filter @repo/api build`(tsup) | ✅ 成功 |
| `pnpm --filter @repo/notion-training-app build`(vite) | ✅ 成功 |
| `pnpm --filter @repo/notion-todo-pomodoro-app build`(vite) | ✅ 成功 |
| API 起動 + `/api/health` | ✅ `{"ok":true}` |
| 存在しない ID の `/trends` | ✅ 404 + `NOT_FOUND`(修正前は常に500) |
| `/tasks?scope=active` `/training-logs?limit=2&sort=desc` | ✅ 200 |
| `/training-logs?limit=abc`(不正値) | ✅ 200(デフォルトへフォールバック) |

---

## 6. 未対応(今後の課題として残したもの)

| 項目 | 理由 |
|---|---|
| nta の共通 `AppLayout` 化・ヒーロー markup 重複解消 (指摘16) | UI 構造の変更を伴う大きめの作業。デザイン確認が必要 |
| nta の New/Edit ミューテーション実装 (指摘15) | 新機能実装に相当(`useTaskMutations` パターン移植で対応可) |
| `exerciseSet.lib.ts` の文字列パース防御+テスト (指摘9) | テスト基盤(vitest 等)の導入から必要 |
| Notion クエリ結果の `as unknown as` のランタイム検証化 (指摘4) | 段階的な移行が必要な大きめのリファクタ |
| `packages/types`/`schemas` への package.json 付与 (指摘19) | 現構成は全体が tsconfig paths + vite alias 方式で統一されており、部分的な導入はかえって不整合。やるなら packages 全体の再構成として実施すべき |
| portal の認証実装 (指摘20) | 未着手の機能領域 |
| ntpa の `.env` にある未配線 SENTRY_DSN | `.env` はローカル設定のため触っていない。Sentry を配線するか DSN を消すかは要判断 |
| date フォーマットの `@repo/utils` 集約 | 影響範囲確認が必要な小リファクタ |
