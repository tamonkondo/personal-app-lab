# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## リポジトリ概要

単一のフロントエンドアプリとExpress APIを管理するpnpmワークスペースのモノレポ。データソースはNotion API。

- `apps/personal-app` (port 5173) — 統合フロントエンド。ルート `/` にトップ、`/training/*` にトレーニング記録、`/todo/*` にTodo/ポモドーロ
- `apps/api` (port 3000) — Express API
- `packages/*` — 共有モジュール（`@repo/types`, `@repo/schemas`, `@repo/ui`, `@repo/utils`, `@repo/api-client`）

フロントは1つだが、APIは `notion-training-app` / `notion-todo-pomodoro-app` という**モジュール単位**で分かれたままにしている（`/api/<モジュール名>/...`）。`packages/types` と `packages/schemas` のサブディレクトリ名もこのモジュール名と対応しており、フロントのルート名（`/training`, `/todo`）とは独立している。

`docs/` はAIエージェント向けの実装コンテキスト、`handbook/` は開発者向け設計ガイド（命名規約・分割判断など）。設計判断に迷ったら `handbook/07-api-type-and-naming-guidelines.md` を参照する。

## コマンド

```bash
pnpm install                # 依存インストール（pnpm@11 / packageManagerフィールド準拠）

# 開発サーバー（ルートから）
pnpm dev:api                # API (tsx watch)
pnpm dev:app                # personal-app

# 検証（CIと同じ: typecheck → test → build）
pnpm typecheck              # 全ワークスペース tsc --noEmit
pnpm -r test                # 全ワークスペースの Vitest
pnpm build                  # 全ワークスペースのビルド

# 単一ワークスペース・単一テスト
pnpm --filter @repo/api test
pnpm --filter @repo/api exec vitest run src/modules/notion-training-app/features/trainingLog/trainingLog.db.test.ts
pnpm --filter @repo/personal-app exec vitest run <path>

# shadcn/ui コンポーネントの追加（packages/ui に入る。手動コピーしない）
pnpm add:ui <component-name>
```

Docker（本番想定 + Nginx）は `pnpm docker:up` / 開発向けは `pnpm docker:dev:up` 系を使用。

## アーキテクチャ

### 依存バージョンは catalog で一元管理

React / Vite / TypeScript / zod などの共通依存は `pnpm-workspace.yaml` の `catalog:` で管理。各 package.json では `"react": "catalog:"` のように参照する。共通依存を追加・更新するときは catalog 側を変更する。

### 共有パッケージの解決は2箇所に登録が必要

`@repo/*` のパス解決は **`tsconfig.base.json` の `paths`** と **各アプリの `vite.config.ts` / `vitest.config.ts` の `resolve.alias`** で定義されている。新しい共有パッケージを作る／エクスポートを増やす場合は全部を更新すること。アプリの `tsconfig.json` で `paths` を定義すると `extends` 元とマージされず**上書き**になるので、その場合は `@repo/*` を全て再掲する必要がある。

### API: modules/features 構成

`apps/api/src/modules/<アプリ名>/features/<feature>/` に機能単位でまとめる。1つのfeatureは以下のファイルで構成される:

- `<feature>.handler.ts` — Expressハンドラ（ルートは `src/routes/<アプリ名>.routes.ts` で `/api/<アプリ名>/...` にマウント）
- `<feature>.notion.ts` — Notion APIとの入出力（生データ変換）
- `<feature>.db.ts` — 取得・変換ロジック
- `<feature>.types.ts` — API内部型
- `*.test.ts` — 同じディレクトリに配置するVitestテスト

Sentry初期化は `src/app.ts` の先頭importで行い、Sentryのエラーハンドラは「ルート定義の後・自前 `errorHandler` の前」に置く（順序を崩さない）。

### 型の置き場所ルール（handbook/07 準拠）

- Notionなど外部サービスの生データ型 → API内部のみで使用（共有しない）
- APIレスポンス型（API契約） → `packages/types` に置き、APIとフロントで共有
- 画面表示専用の型 → 各フロントエンドアプリ内に定義
- レスポンスは `ApiResponse<T>`、ページネーション一覧は `PaginatedResponse<T>` を使用
- 同じ項目を持っていても役割が異なる型は統合しない

バリデーションスキーマ（zod）は `packages/schemas` にアプリ別サブディレクトリで共有。

### フロントエンド: features 構成

`src/features/<feature>/` に `components/` `hooks/` `store/` とフォームスキーマ（`*Form.schema.ts` + テスト）を持つ。features は**フラットに並べる**（ドメイン別にネストしない）。ドメインの分割は `src/pages/<domain>/` とルートプレフィックス（`/training`, `/todo`）で表現する。技術スタック:

- データ取得: SWR + `@repo/api-client` の `fetcher` / `mutateJson`（アプリ内に独自のfetchラッパーを作らない — 過去にコピペで乖離した経緯があり集約済み）
- フォーム: react-hook-form + zod（`@hookform/resolvers`）
- クライアント状態: zustand
- UI: `packages/ui`（shadcn/ui ベース、Tailwind CSS v4）

Viteの `base` は `/`。Nginxは `/` を `apps/personal-app` の成果物、`/api/` を APIコンテナに割り当てる。

API のベースURLは `src/lib/fetch.ts` に集約し、`VITE_API_URL`（APIのルート。例 `http://localhost:3000/api`）から `TRAINING_API_BASE` / `TODO_API_BASE` の2本を導出する。各フックで `import.meta.env` を直接参照しない。本番イメージには `.env` が入らないため、未設定時は同一オリジンの `/api` にフォールバックする。
