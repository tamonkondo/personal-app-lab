# Portfolio Monorepo

React + Vite の複数アプリと Express API を pnpm workspace で管理するモノレポです。

## Apps

- `apps/portal`: ポートフォリオトップ・ログイン導線
- `apps/notion-training-app`: 学習用アプリ1
- `apps/app2`: 学習用アプリ2
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

## Scripts

```bash
pnpm dev:portal
pnpm dev:notion-training-app
pnpm dev:app2
pnpm dev:api
pnpm build
pnpm typecheck
```
