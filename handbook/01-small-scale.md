# 01. 小規模時の型定義と構成

> 対象: 開発者

## 結論

小規模では、最初から `domain`, `application`, `infra`, `presentation` を厳密に分けなくてよい。
まずは module 単位でシンプルに作る。

```txt
apps/backend/src/modules/tasks/
  task.schema.ts
  task.service.ts
  task.controller.ts
  task.routes.ts

apps/frontend/src/features/tasks/
  taskApi.ts
  TaskList.tsx
  TaskCard.tsx

packages/shared/contracts/
  task.contract.ts
```

## 小規模時に分けるもの

最低限、以下だけ分ける。

```txt
API契約
→ shared/contracts

HTTP処理
→ controller

業務処理
→ service

DB操作
→ service内でPrismaを直接使ってOK

画面表示
→ frontend/features
```

## shared/contracts の役割

frontend と backend の共通契約を定義する。

```ts
// packages/shared/contracts/task.contract.ts
import { z } from "zod";

export const TaskStatusSchema = z.enum([
  "TODO",
  "DONE",
  "ARCHIVED",
]);

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const CreateTaskInputSchema = z.object({
  title: z.string().trim().min(1).max(100),
});

export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;

export const ChangeTaskTitleInputSchema = z.object({
  title: z.string().trim().min(1).max(100),
});

export type ChangeTaskTitleInput = z.infer<
  typeof ChangeTaskTitleInputSchema
>;

export const TaskResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: TaskStatusSchema,
  completedAt: z.string().nullable(),
  archivedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TaskResponse = z.infer<typeof TaskResponseSchema>;
```

## controller の役割

controller は HTTP の入口。
ここでは Zod で API 入力を検証して service に渡す。

```ts
// apps/backend/src/modules/tasks/task.controller.ts
import { Request, Response } from "express";
import {
  CreateTaskInputSchema,
  ChangeTaskTitleInputSchema,
} from "@shared/contracts/task.contract";
import { TaskService } from "./task.service";

export class TaskController {
  constructor(private taskService: TaskService) {}

  create = async (req: Request, res: Response) => {
    const input = CreateTaskInputSchema.parse(req.body);
    const task = await this.taskService.createTask(input);

    res.status(201).json({
      id: task.id,
      title: task.title,
      status: task.status,
      completedAt: task.completedAt?.toISOString() ?? null,
      archivedAt: task.archivedAt?.toISOString() ?? null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    });
  };

  changeTitle = async (req: Request, res: Response) => {
    const input = ChangeTaskTitleInputSchema.parse(req.body);
    const task = await this.taskService.changeTitle(req.params.taskId, input);

    res.json({
      id: task.id,
      title: task.title,
      status: task.status,
      completedAt: task.completedAt?.toISOString() ?? null,
      archivedAt: task.archivedAt?.toISOString() ?? null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    });
  };
}
```

## service の役割

小規模では service に業務処理と Prisma 操作をまとめてよい。

```ts
// apps/backend/src/modules/tasks/task.service.ts
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import {
  CreateTaskInput,
  ChangeTaskTitleInput,
} from "@shared/contracts/task.contract";

export class TaskService {
  constructor(private prisma: PrismaClient) {}

  async createTask(input: CreateTaskInput) {
    return this.prisma.task.create({
      data: {
        id: randomUUID(),
        title: input.title,
        status: "TODO",
        completedAt: null,
        archivedAt: null,
      },
    });
  }

  async changeTitle(taskId: string, input: ChangeTaskTitleInput) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error("タスクが見つかりません");
    }

    if (task.status === "ARCHIVED") {
      throw new Error("アーカイブ済みタスクのタイトルは変更できません");
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: input.title,
      },
    });
  }

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

## 小規模でやらなくてよいこと

最初から以下を作らなくてもよい。

```txt
Entity class
Value Object class
Repository interface
Mapper
Presenter
Domain Service
Aggregate
```

ただし、以下は最初から守る。

```txt
- 外部入力は Zod で検証する
- API契約は shared/contracts に置く
- Prisma型を frontend に直接出さない
- controller に業務ルールを書きすぎない
```
