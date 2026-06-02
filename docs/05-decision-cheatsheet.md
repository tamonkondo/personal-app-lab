# 05. 迷った時のチートシート

## まずこれを見る

```txt
APIの入出力？
→ shared/contracts の zod + type

値そのものの制約？
→ Value Object / zod branded type

状態変更のルール？
→ Entity class

複数データを見ないと判断できない？
→ Service / UseCase

DB保存形式？
→ Prisma model

画面表示用？
→ Frontend ViewModel
```

---

# type / zod / class の分け方

## type にする

```txt
- API Response
- React props
- ViewModel
- 単なるデータ構造
- Form state
```

例:

```ts
type TaskCardViewModel = {
  id: string;
  title: string;
  statusLabel: string;
  isDone: boolean;
};
```

---

## zod にする

```txt
- 外部から来る値
- API request
- API response
- フォーム入力
- 環境変数
- 値単体の制約
```

例:

```ts
const CreateTaskInputSchema = z.object({
  title: z.string().trim().min(1).max(100),
});
```

---

## Value Object にする

```txt
- 値に名前をつけたい
- 普通の string / number と区別したい
- 複数箇所で同じ検証をしている
- 値単体で正しさを判断できる
```

例:

```ts
const title = TaskTitle.create(input.title);
```

### Zod branded type でよいもの

```txt
TaskId
TaskTitle
UserId
Email
TaskStatus
TaskOrder
```

### class Value Object が向くもの

```txt
DateRange
Money
TaskPosition
WipLimit
```

---

## Entity にする

```txt
- IDで同一性を判断する
- 状態が変わる
- ライフサイクルがある
- 業務操作を持つ
```

例:

```ts
task.complete(now);
task.reopen(now);
task.archive(now);
```

---

# バリデーションと業務ルールの分け方

## バリデーション

```txt
値として正しいか？
```

例:

```txt
title は空ではない
email の形式が正しい
order は0以上の整数
status は enum に含まれる
```

置き場所:

```txt
Zod
Value Object
```

---

## 業務ルール

```txt
業務上、その操作をしてよいか？
```

例:

```txt
ARCHIVED のタスクは編集できない
DONE にしたら completedAt を入れる
DONE から戻したら completedAt を null にする
別BoardのColumnには移動できない
WIP制限を超えて移動できない
```

置き場所:

```txt
Entity
Service / UseCase
```

---

# Entity と Value Object の線引き

## Entity

```txt
同じIDなら同じもの
```

例:

```txt
Task
Project
Board
Column
User
Comment
```

## Value Object

```txt
同じ値なら同じもの
```

例:

```txt
TaskTitle
TaskStatus
TaskPosition
Email
UserName
DateRange
```

---

# 小規模でのおすすめ

```txt
shared/contracts
backend/modules/tasks/task.schema.ts
backend/modules/tasks/task.service.ts
backend/modules/tasks/task.controller.ts
frontend/features/tasks
```

小規模では以下はまだ不要。

```txt
Repository interface
Mapper
Presenter
Domain Service
Aggregate
```

---

# 中規模でのおすすめ

```txt
src/modules/tasks/
  domain/
    Task.ts
    TaskId.ts
    TaskTitle.ts
    TaskStatus.ts
    TaskRepository.ts

  infra/
    task.mapper.ts
    prismaTaskRepository.ts

  task.schema.ts
  task.service.ts
  task.presenter.ts
  task.controller.ts
  task.routes.ts
```

---

# 判断フロー

```txt
Q. これはAPIで送受信する形？
  YES → shared/contracts

Q. これは画面表示用？
  YES → frontend ViewModel

Q. これはDB保存用？
  YES → Prisma model

Q. これは値単体の制約？
  YES → Value Object / Zod

Q. これは状態変更や業務操作？
  YES → Entity

Q. 他のEntityやDB確認が必要？
  YES → Service / UseCase
```

---

# やらない方がいいこと

```txt
Prisma型をfrontendに出す
sharedにbackend domain entityを置く
controllerに業務ルールを書きすぎる
全てをclassにする
全てをzodのsuperRefineに詰め込む
小規模なのに最初からDDDフル装備にする
```

---

# 合言葉

```txt
共通化するのは API 契約。
業務ルールは backend に閉じ込める。
画面都合は frontend に閉じ込める。
DB都合は Prisma に閉じ込める。
```
