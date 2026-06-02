# 04. Task の段階的コード例

このファイルでは、Task だけを対象にして「小規模実装」から「Entity / Value Object 分割後」までの差分を見る。

---

# Before: 小規模 service 中心

```ts
export class TaskService {
  constructor(private prisma: PrismaClient) {}

  async completeTask(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error("タスクが見つかりません");
    }

    if (task.status === "ARCHIVED") {
      throw new Error("アーカイブ済みタスクは完了できません");
    }

    if (task.status === "DONE") {
      return task;
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        status: "DONE",
        completedAt: new Date(),
      },
    });
  }
}
```

## 問題点

```txt
- 業務ルールが service にある
- status と completedAt の整合性を service が毎回守る必要がある
- complete / reopen / archive が増えると service が太る
```

---

# After Step 1: Value Object

## TaskTitle

```ts
import { z } from "zod";

export const TaskTitleSchema = z
  .string()
  .trim()
  .min(1, "タイトルは必須です")
  .max(100, "タイトルは100文字以内です")
  .brand<"TaskTitle">();

export type TaskTitle = z.infer<typeof TaskTitleSchema>;

export const TaskTitle = {
  create(value: string): TaskTitle {
    return TaskTitleSchema.parse(value);
  },
};
```

## TaskId

```ts
import { z } from "zod";

export const TaskIdSchema = z.string().min(1).brand<"TaskId">();

export type TaskId = z.infer<typeof TaskIdSchema>;

export const TaskId = {
  create(value: string): TaskId {
    return TaskIdSchema.parse(value);
  },
};
```

## TaskStatus

```ts
export const TaskStatusValues = [
  "TODO",
  "DONE",
  "ARCHIVED",
] as const;

export type TaskStatus = typeof TaskStatusValues[number];

export const TaskStatus = {
  TODO: "TODO" as const,
  DONE: "DONE" as const,
  ARCHIVED: "ARCHIVED" as const,
};
```

---

# After Step 2: Task Entity

```ts
import { TaskId } from "./TaskId";
import { TaskTitle } from "./TaskTitle";
import { TaskStatus } from "./TaskStatus";

type TaskProps = {
  id: TaskId;
  title: TaskTitle;
  status: TaskStatus;
  completedAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class Task {
  private constructor(private props: TaskProps) {}

  static create(params: {
    id: TaskId;
    title: TaskTitle;
    now: Date;
  }) {
    return new Task({
      id: params.id,
      title: params.title,
      status: "TODO",
      completedAt: null,
      archivedAt: null,
      createdAt: params.now,
      updatedAt: params.now,
    });
  }

  static reconstruct(props: TaskProps) {
    return new Task(props);
  }

  changeTitle(title: TaskTitle, now: Date) {
    if (this.props.status === "ARCHIVED") {
      throw new Error("アーカイブ済みタスクのタイトルは変更できません");
    }

    this.props.title = title;
    this.props.updatedAt = now;
  }

  complete(now: Date) {
    if (this.props.status === "ARCHIVED") {
      throw new Error("アーカイブ済みタスクは完了できません");
    }

    if (this.props.status === "DONE") {
      return;
    }

    this.props.status = "DONE";
    this.props.completedAt = now;
    this.props.updatedAt = now;
  }

  reopen(now: Date) {
    if (this.props.status !== "DONE") {
      throw new Error("完了済みタスクだけ再オープンできます");
    }

    this.props.status = "TODO";
    this.props.completedAt = null;
    this.props.updatedAt = now;
  }

  archive(now: Date) {
    if (this.props.status === "ARCHIVED") {
      return;
    }

    this.props.status = "ARCHIVED";
    this.props.archivedAt = now;
    this.props.updatedAt = now;
  }

  get id() {
    return this.props.id;
  }

  get title() {
    return this.props.title;
  }

  get status() {
    return this.props.status;
  }

  get completedAt() {
    return this.props.completedAt;
  }

  get archivedAt() {
    return this.props.archivedAt;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }
}
```

---

# After Step 3: service がスリムになる

```ts
export class TaskService {
  constructor(private taskRepository: TaskRepository) {}

  async completeTask(taskId: string) {
    const task = await this.taskRepository.findById(TaskId.create(taskId));

    if (!task) {
      throw new Error("タスクが見つかりません");
    }

    task.complete(new Date());

    await this.taskRepository.save(task);

    return task;
  }
}
```

## 変わったこと

Before:

```ts
if (task.status === "ARCHIVED") {
  throw new Error("アーカイブ済みタスクは完了できません");
}

return prisma.task.update({
  data: {
    status: "DONE",
    completedAt: new Date(),
  },
});
```

After:

```ts
task.complete(new Date());
await taskRepository.save(task);
```

業務ルールが `Task.complete()` に閉じ込められた。

---

# After Step 4: Mapper

```ts
import { Task as PrismaTask } from "@prisma/client";
import { Task } from "../domain/Task";
import { TaskId } from "../domain/TaskId";
import { TaskTitle } from "../domain/TaskTitle";
import { TaskStatusValues } from "../domain/TaskStatus";

const toTaskStatus = (value: string) => {
  if (!TaskStatusValues.includes(value as any)) {
    throw new Error(`Invalid task status: ${value}`);
  }

  return value as typeof TaskStatusValues[number];
};

export const TaskMapper = {
  toDomain(raw: PrismaTask): Task {
    return Task.reconstruct({
      id: TaskId.create(raw.id),
      title: TaskTitle.create(raw.title),
      status: toTaskStatus(raw.status),
      completedAt: raw.completedAt,
      archivedAt: raw.archivedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  },

  toPersistence(task: Task) {
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      completedAt: task.completedAt,
      archivedAt: task.archivedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  },
};
```

---

# After Step 5: Repository

```ts
export interface TaskRepository {
  findById(id: TaskId): Promise<Task | null>;
  save(task: Task): Promise<void>;
}
```

```ts
export class PrismaTaskRepository implements TaskRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: TaskId): Promise<Task | null> {
    const raw = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!raw) return null;

    return TaskMapper.toDomain(raw);
  }

  async save(task: Task): Promise<void> {
    const data = TaskMapper.toPersistence(task);

    await this.prisma.task.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }
}
```

---

# まとめ

```txt
小規模
  service が Prisma を直接使う

中規模
  Value Object で値の制約をまとめる
  Entity で業務ルールをまとめる
  Mapper で Prisma と Domain を分ける
  Repository で DB操作を隠す
```

一番大事なのは、業務操作をこう表現できること。

```ts
task.changeTitle(title, now);
task.complete(now);
task.reopen(now);
task.archive(now);
```

`task.status = "DONE"` のように直接状態を変えない。
