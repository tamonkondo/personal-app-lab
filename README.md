# personal-app-lab

複数の個人アプリを実験・運用していくためのモノレポです。
フロントエンドアプリとAPIを同一リポジトリで管理し、共通の型・UI・ユーティリティを `packages` に切り出して再利用できる構成にしています。

## プロジェクト概要

- 目的: 小〜中規模の個人開発アプリを素早く試作し、改善を繰り返せる開発基盤を持つ
- 構成: `apps` 配下にフロントエンドアプリとAPI、`packages` 配下に共通モジュール
- 運用: ローカル開発/本番想定のコンテナ構成を `compose*.yml` で管理

## おおまかな技術スタック

### 全体

- Monorepo: pnpm workspace
- 言語: TypeScript
- パッケージ管理: pnpm

### フロントエンド

- React
- Vite
- アプリ: `personal-app`（トレーニング記録 / Todo・ポモドーロを1つのSPAに統合）

### バックエンド

- Node.js + Express
- ビルド: tsup
- テスト: Vitest
- データソース: Notion API (@notionhq/client)
- エラートラッキング: Sentry (設定ファイルあり)

### 共有パッケージ

- `packages/types`: 共通型
- `packages/schemas`: 共通スキーマ
- `packages/ui`: 共通UIコンポーネント
- `packages/utils`: 共通ユーティリティ

### インフラ/開発環境

- Docker / Docker Compose
- Nginx
- CI: GitHub Actions (typecheck / test / build)

## 今後の実装タスク・残課題

### TODO

- [✅️] APIをUI側につなぎこみをする。
- [✅️] トレーニング種目詳細の最近の傾向を期間を調整しながらAPIを作成する。
- [✅️] グラフのUI追加
- [✅️] 各記録のCRUDAPIとUIを作成（トレーニング記録の作成/更新/削除）
- [✅️] 種目マスタのCRUD APIとUIを作成（目標重量はNotion管理のためスコープ外）
- [✅️] UI改善（導線整理: テンプレート作成・種目プリセット・リンク切れ修正）
- [ ] GCPとNeonにデプロイ
- [ ] 認証（旧 portal の /login・/logout スタブは統合時に削除）をAPIと合わせて実装する

### FUTURE

- [ ] AIエージェントフレームワーク Flueを使用して、トレーニングメニューの提案や作成を行えるようにする。
  - [ ] トレーニング種目のハイライトはAIで査定をする。DB保存でもいいかも
