# 03. 小規模から中規模への分割フロー

## 小規模構成

最初はこれでよい。

```txt
src/modules/tasks/
  task.schema.ts
  task.service.ts
  task.controller.ts
  task.routes.ts
```

service に Prisma と業務処理が同居している状態。

---

# Step 1. Value Object を追加する

## 目的

単純な値の制約を一箇所にまとめる。

```txt
TaskId
TaskTitle
TaskStatus
```

## 変更後

```txt
src/modules/tasks/
  domain/
    TaskId.ts
    TaskTitle.ts
    TaskStatus.ts
  task.schema.ts
  task.service.ts
  task.controller.ts
```

## 例

```ts
// domain/TaskTitle.ts
import { z } from "zod";

export const TaskTitleSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .brand<"TaskTitle">();

export type TaskTitle = z.infer<typeof TaskTitleSchema>;

export const TaskTitle = {
  create(value: string): TaskTitle {
    return TaskTitleSchema.parse(value);
  },
};
```

service 側:

```ts
const title = TaskTitle.create(input.title);
```

---

# Step 2. Entity を追加する

## 目的

状態変更と業務ルールを `Task` に閉じ込める。

## 変更後

```txt
src/modules/tasks/
  domain/
    Task.ts
    TaskId.ts
    TaskTitle.ts
    TaskStatus.ts
  task.service.ts
```

## 例

```ts
// domain/Task.ts
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

  static create(params: { id: TaskId; title: TaskTitle; now: Date }) {
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

# Step 3. Mapper を追加する

## 目的

Prisma の保存形式と Domain Entity を分ける。

## 変更後

```txt
src/modules/tasks/
  domain/
    Task.ts
    TaskId.ts
    TaskTitle.ts
    TaskStatus.ts
  infra/
    task.mapper.ts
  task.service.ts
```

## 例

```ts
// infra/task.mapper.ts
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

# Step 4. Repository を追加する

## 目的

DB操作を service から外す。

## 変更後

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
  task.service.ts
```

## Repository interface

```ts
// domain/TaskRepository.ts
import { Task } from "./Task";
import { TaskId } from "./TaskId";

export interface TaskRepository {
  findById(id: TaskId): Promise<Task | null>;
  save(task: Task): Promise<void>;
}
```

## Prisma implementation

```ts
// infra/prismaTaskRepository.ts
import { PrismaClient } from "@prisma/client";
import { TaskRepository } from "../domain/TaskRepository";
import { Task } from "../domain/Task";
import { TaskId } from "../domain/TaskId";
import { TaskMapper } from "./task.mapper";

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

# Step 5. Presenter を追加する

## 目的

Domain Entity を API Response に変換する処理をまとめる。

## 変更後

```txt
src/modules/tasks/
  task.presenter.ts
```

## 例

```ts
// task.presenter.ts
import { Task } from "./domain/Task";
import { TaskResponse } from "@shared/contracts/task.contract";

export const toTaskResponse = (task: Task): TaskResponse => {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    completedAt: task.completedAt?.toISOString() ?? null,
    archivedAt: task.archivedAt?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
};
```

---

# Step 6. service を UseCase に近づける

## 目的

service は「処理の流れ」だけにする。

```ts
// task.service.ts
import { randomUUID } from "crypto";
import {
  CreateTaskInput,
  ChangeTaskTitleInput,
} from "@shared/contracts/task.contract";
import { TaskRepository } from "./domain/TaskRepository";
import { Task } from "./domain/Task";
import { TaskId } from "./domain/TaskId";
import { TaskTitle } from "./domain/TaskTitle";

export class TaskService {
  constructor(private taskRepository: TaskRepository) {}

  async createTask(input: CreateTaskInput) {
    const now = new Date();

    const task = Task.create({
      id: TaskId.create(randomUUID()),
      title: TaskTitle.create(input.title),
      now,
    });

    await this.taskRepository.save(task);

    return task;
  }

  async changeTitle(taskId: string, input: ChangeTaskTitleInput) {
    const task = await this.taskRepository.findById(TaskId.create(taskId));

    if (!task) {
      throw new Error("タスクが見つかりません");
    }

    task.changeTitle(TaskTitle.create(input.title), new Date());

    await this.taskRepository.save(task);

    return task;
  }

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

## 最終形

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
