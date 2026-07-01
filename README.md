# personal-app-lab

複数の個人アプリを実験・運用していくためのモノレポです。
フロントエンド複数アプリとAPIを同一リポジトリで管理し、共通の型・UI・ユーティリティを `packages` に切り出して再利用できる構成にしています。

## プロジェクト概要

- 目的: 小〜中規模の個人開発アプリを素早く試作し、改善を繰り返せる開発基盤を持つ
- 構成: `apps` 配下に複数のフロントエンドアプリとAPI、`packages` 配下に共通モジュール
- 運用: ローカル開発/本番想定のコンテナ構成を `compose*.yml` で管理

## おおまかな技術スタック

### 全体

- Monorepo: pnpm workspace
- 言語: TypeScript
- パッケージ管理: pnpm

### フロントエンド

- React
- Vite
- アプリ: `notion-training-app`, `notion-todo-pomodoro-app`, `portal`

### バックエンド

- Node.js + Express
- ビルド: tsup
- DBアクセス: Prisma
- エラートラッキング: Sentry (設定ファイルあり)

### 共有パッケージ

- `packages/types`: 共通型
- `packages/schemas`: 共通スキーマ
- `packages/ui`: 共通UIコンポーネント
- `packages/utils`: 共通ユーティリティ

### インフラ/開発環境

- Docker / Docker Compose
- Nginx

## 今後の実装タスク・残課題

### TODO

- [✅️] APIをUI側につなぎこみをする。 
- [ ] グラフのUI追加
- [ ] 各記録のCRUDAPIとUIを作成
- [ ] UI改善（導線整理）
- [ ] GCPとNeonにデプロイ

### FUTURE
- [ ] AIエージェントフレームワーク Flueを使用して、トレーニングメニューの提案や作成を行えるようにする。
    - [ ] トレーニング種目のハイライトは