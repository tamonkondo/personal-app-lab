# Portfolio Monorepo

React + Vite の複数アプリと Express API を pnpm workspace で管理するモノレポです。

## Apps

- `apps/portal`: ポートフォリオトップ・ログイン導線
- `apps/notion-training-app`: 学習用アプリ1
- `apps/notion-todo-pomodoro`: 学習用アプリ2
- `apps/api`: Express API

## Packages

- `packages/ui`: shadcn/ui ベースの共通UI
- `packages/types`: 共通型
- `packages/schemas`: 共通バリデーションschema
- `packages/utils`: 共通utility

## 方針

- ESMに統一
- TypeScript importでは拡張子を書かない
- React/Viteアプリは `moduleResolution: bundler`
- APIはtsupでESMバンドル
- shadcn/uiは `packages/ui` に集約

## Documentation

- [`handbook/`](./handbook/): 開発者向けの設計資料、手順、命名規約
- [`docs/`](./docs/): AIエージェント向けのプロジェクトコンテキスト

## Scripts

```bash
pnpm dev:portal
pnpm dev:nta
pnpm dev:ntpa
pnpm dev:api
pnpm build
pnpm typecheck
```

## Docker Dev (HMR)

docker compose を開発モードで起動すると、api + frontend 3アプリが立ち上がります。

```bash
pnpm docker:dev:build
pnpm docker:dev:up
```

アクセス先:

- http://localhost/
- http://localhost/notion-training-app/
- http://localhost/notion-todo-pomodoro-app/
- http://localhost/api/health

ログ確認と停止:

```bash
pnpm docker:dev:logs
pnpm docker:dev:down
```
