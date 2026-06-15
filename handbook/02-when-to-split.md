# 02. 分割するタイミングの判断基準

> 対象: 開発者

## 基本方針

分割は目的ではない。
以下のような痛みが出てきたら、段階的に分割する。

```txt
コード量が増えたから分ける
ではなく、
変更しづらくなったから分ける
```

## 分割サイン一覧

### 1. service が長くなってきた

目安:

```txt
1ファイル 200〜300行を超える
1メソッド 50行を超える
似たような if が複数出てくる
```

対応:

```txt
Value Object を切り出す
Entity を切り出す
Mapper を切り出す
```

---

### 2. 同じバリデーションが複数箇所に出てきた

例:

```ts
title.trim().length === 0
title.length > 100
```

対応:

```txt
TaskTitle Value Object に切り出す
```

```ts
const title = TaskTitle.create(input.title);
```

---

### 3. status と completedAt の整合性が不安になった

危険な状態:

```ts
task.status = "DONE";
task.completedAt = null;
```

対応:

```txt
Task Entity を作る
```

```ts
task.complete(new Date());
```

---

### 4. Prisma の型をあちこちで直接触っている

危険な状態:

```ts
import { Task } from "@prisma/client";
```

が controller / frontend / business logic に広がる。

対応:

```txt
Mapper を作る
Domain Task と Prisma Task を分ける
```

---

### 5. API Response が毎回手書きで重複している

例:

```ts
res.json({
  id: task.id,
  title: task.title,
  status: task.status,
  completedAt: task.completedAt?.toISOString() ?? null,
});
```

が複数 controller に出てくる。

対応:

```txt
Presenter を切り出す
```

```ts
res.json(toTaskResponse(task));
```

---

### 6. テストしたい業務ルールが増えた

例:

```txt
アーカイブ済みタスクは完了できない
DONE のタスクを再オープンしたら completedAt が null になる
タイトル変更時は updatedAt が更新される
```

対応:

```txt
Entity に業務ルールを移す
```

Entity は DB なしでテストしやすい。

---

### 7. DBを使わずに業務ルールを確認したくなった

対応:

```txt
Task Entity
TaskTitle Value Object
TaskRepository interface
```

に分割する。

---

## 分割順序

おすすめの順番:

```txt
Step 1
小規模構成: controller + service + prisma + zod

Step 2
Value Object を切り出す

Step 3
Entity を切り出す

Step 4
Mapper を切り出す

Step 5
Repository を切り出す

Step 6
Presenter を切り出す

Step 7
UseCase を service から分ける
```

## どこに何を置くか

```txt
値単体の制約
→ Value Object / Zod

状態変更のルール
→ Entity

複数EntityやDB確認が必要なルール
→ UseCase / Service

Prismaとの変換
→ Mapper

DB操作
→ Repository

API入出力
→ Controller / Presenter / shared contracts
```

## 分割しすぎのサイン

逆に、以下なら分けすぎかもしれない。

```txt
1つの処理を追うのに5ファイル以上開く必要がある
ほとんど中身のない class / interface が大量にある
業務ルールがないのに Entity を作っている
単なる string なのに全部 class Value Object にしている
```

## 判断フロー

```txt
Q. その値は複数箇所で検証している？
  YES → Value Objectへ
  NO  → そのままでOK

Q. そのデータに状態変更ルールがある？
  YES → Entityへ
  NO  → type / DTOでOK

Q. Prisma変換が邪魔？
  YES → Mapperへ
  NO  → service内でOK

Q. DB操作を差し替えたい、テストしづらい？
  YES → Repositoryへ
  NO  → Prisma直書きでOK

Q. Response変換が重複している？
  YES → Presenterへ
  NO  → controller内でOK
```
