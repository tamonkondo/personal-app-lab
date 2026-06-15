# React + Express + Prisma + Zod + TypeScript 設計ガイド

> 対象: 開発者

このドキュメント群は、プロジェクト管理・タスク管理アプリを想定した設計メモです。
VS Code で開発中に迷った時に見返すための、実務寄りの判断フローをまとめています。

## 想定スタック

- Frontend: React
- Backend: Express
- ORM: Prisma
- Validation: Zod
- Language: TypeScript

## 基本方針

最初から厳密な DDD 構成にしすぎない。
小規模ではシンプルに作り、業務ルールや型の重複が増えてきたタイミングで段階的に分割する。

```txt
小規模
  controller + service + prisma + zod

中規模
  module 内で domain / infra / presenter を分割

大規模
  domain / application / infra / presentation を明確に分離
```

## ファイル一覧

| ファイル | 内容 |
| --- | --- |
| [01-small-scale.md](./01-small-scale.md) | 小規模時の型定義・フォルダ・コード例 |
| [02-when-to-split.md](./02-when-to-split.md) | 分割するタイミングの判断基準 |
| [03-medium-scale-flow.md](./03-medium-scale-flow.md) | 小規模から中規模への移行フロー |
| [04-task-example.md](./04-task-example.md) | Task を例にした段階的なコード分割 |
| [05-decision-cheatsheet.md](./05-decision-cheatsheet.md) | 迷った時のチートシート |
| [06-sentry-react-express-setup.md](./06-sentry-react-express-setup.md) | Sentry の段階的導入手順（Express → React） |
| [07-api-type-and-naming-guidelines.md](./07-api-type-and-naming-guidelines.md) | API型定義と変数・関数の命名規約 |

## 最重要ルール

```txt
DTO / API契約
→ zod + type

単純な値
→ zod branded type / Value Object

状態変更や業務ルール
→ Entity class

DB保存形式
→ Prisma model

画面表示用
→ Frontend ViewModel
```

## 共通化してよいもの

基本的に frontend と backend で共通化するのは API の契約です。

```txt
shared/contracts
  task.contract.ts
```

ここに置くもの:

- API Request schema
- API Response schema
- DTO type
- enum 的な値

置かない方がよいもの:

- backend domain entity
- Prisma type
- React 専用 ViewModel

```txt
shared/contracts の TaskResponse
  → APIで返す形

backend/domain の Task
  → 業務ルールを守るEntity

frontend の TaskCardViewModel
  → 画面表示に都合が良い形

Prisma の Task
  → DB保存形式
```
