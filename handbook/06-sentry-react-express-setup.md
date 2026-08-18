# 06. Sentry 導入手順（Express + React）

> 対象: 開発者

このドキュメントは、この monorepo に Sentry を導入するための実践手順です。

- API: `apps/api`（Express）
- Frontend: `apps/personal-app`（React + Vite）

まず API 側を導入し、その後に React 側を追加します。
理由は、バックエンド例外を先に可視化すると障害調査の土台が安定するためです。

---

## 0. 事前準備（Sentry 側）

1. Sentry で Project を 2 つ作る

- `personal-app-lab-api`（Node/Express）
- `personal-app-lab-nta`（React。プロジェクト名は作成当時のまま）

2. DSN を控える

- API 用 DSN
- React 用 DSN

3. 環境名ルールを決める

- 例: `local`, `development`, `staging`, `production`

---

## 1. Express（apps/api）に導入

### 1-1. 依存追加

ルートで実行:

```bash
pnpm --filter @repo/api add @sentry/node @sentry/profiling-node
```

### 1-2. 環境変数を追加

`apps/api/.env`（または実行環境のシークレット）に以下を追加:

```env
SENTRY_DSN=YOUR_API_DSN
SENTRY_ENVIRONMENT=development
SENTRY_RELEASE=personal-app-lab-api@0.0.0
```

### 1-3. 初期化ファイルを作成

`apps/api/src/libs/sentry.ts`

```ts
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
  release: process.env.SENTRY_RELEASE,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE ?? 0.0),
  // 個人情報の扱いは要件に応じて調整する
  sendDefaultPii: false,
});

export { Sentry };
```

### 1-4. サーバー起動前に初期化

`apps/api/src/index.ts` の `app` import より前で Sentry 初期化を読み込む。

```ts
import "dotenv/config";
import "./libs/sentry";

import { app } from "./app";
```

### 1-5. エラーハンドリング順序を修正

重要ポイント:

- ルート定義より前に `errorHandler` を置くと、通常のルート例外を拾えない
- 既存の `apps/api/src/app.ts` では `errorHandler` が早すぎる位置にある

推奨順序:

1. ログ/パーサー系ミドルウェア
2. API ルート
3. Sentry のエラー取得ミドルウェア
4. 独自 `errorHandler`

例（概略）:

```ts
import express from "express";
import * as Sentry from "@sentry/node";

export const app = express();

// ... morgan/cors/cookie/json

app.use("/api/health", healthRouter);
app.use("/api/notion", notionRouter);
app.use("/api/notion-training-app", notionTrainingAppRouter);

app.use(Sentry.setupExpressErrorHandler());
app.use(errorHandler);
```

### 1-6. 動作確認

1. テスト用エンドポイントで例外を投げる
2. Sentry にイベントが届くことを確認
3. `environment` と `release` が正しいことを確認

---

## 2. React（apps/personal-app）に導入

### 2-1. 依存追加

ルートで実行:

```bash
pnpm --filter @repo/personal-app add @sentry/react
```

> `@sentry/tracing` は v8 以降コアに統合されたため不要（v7 の遺物）。
> `@sentry/vite-plugin` は source map をアップロードする 2-4 を実施するときだけ devDependency に追加する。
> 現状の `apps/personal-app` は 2-4 を設定していないため、どちらも入れていない。

### 2-2. 環境変数を追加

`apps/personal-app/.env` に追加:

```env
VITE_SENTRY_DSN=YOUR_WEB_DSN
VITE_SENTRY_ENVIRONMENT=development
VITE_SENTRY_RELEASE=personal-app-lab-nta@0.0.0
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

本番の source map アップロード用（CI シークレット推奨）:

```env
SENTRY_AUTH_TOKEN=YOUR_SENTRY_AUTH_TOKEN
SENTRY_ORG=YOUR_SENTRY_ORG
SENTRY_PROJECT=personal-app-lab-nta
```

### 2-3. React 初期化

`apps/personal-app/src/main.tsx` の先頭付近で初期化:

```ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
  release: import.meta.env.VITE_SENTRY_RELEASE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: Number(
    import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.1,
  ),
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 1.0,
});
```

必要であれば `ErrorBoundary` も追加:

```tsx
<Sentry.ErrorBoundary fallback={<p>エラーが発生しました</p>}>
  <RootRouter />
</Sentry.ErrorBoundary>
```

### 2-4. Vite に source map アップロード設定

`apps/personal-app/vite.config.ts`:

```ts
import { sentryVitePlugin } from "@sentry/vite-plugin";

plugins: [
  react(),
  tailwindcss(),
  sentryVitePlugin({
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    release: {
      name: process.env.VITE_SENTRY_RELEASE,
    },
    sourcemaps: {
      assets: "./dist/**",
    },
  }),
],
build: {
  sourcemap: true,
},
```

---

## 3. 運用でハマりやすい点

1. サンプリング率

- local/dev は高めでもよい
- production は `tracesSampleRate` を低めから開始

2. 個人情報

- body/header/cookie をそのまま送らない
- `beforeSend` でマスク方針を入れる

3. release 管理

- フロントと API で release 名を分ける
- CI のコミット SHA を release 名に含めると追跡しやすい

4. アラート

- 重要ルート（認証、保存処理）に優先度高い通知ルールを設定

---

## 4. このリポジトリ向けの推奨導入順

1. API だけ導入して 1 週間観測
2. エラー分類（想定内/想定外）を整理
3. React 側を導入
4. source map と release を CI で自動化

この順序だと、導入初期のノイズを抑えつつ調査品質を上げられます。
