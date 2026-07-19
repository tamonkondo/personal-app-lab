import { asyncHandler } from "@/libs/asyncHandler";
import type {
  TaskListResponse,
  TaskDetailResponse,
} from "@repo/types/notion-todo-pomodoro-app";
import {
  createTaskSchema,
  updateTaskSchema,
  TASK_SCOPES,
  type TaskScope,
} from "@repo/schemas/notion-todo-pomodoro-app";
import * as fetches from "./task.notion";

type GetTasksRequest = {
  query: {
    scope?: string;
    status?: string;
    category?: string;
    projectId?: string;
    limit?: string;
    cursor?: string;
  };
};

export const getTasks = asyncHandler(async (req: GetTasksRequest, res) => {
  const { scope, status, category, projectId, limit, cursor } = req.query;

  const normalizedScope: TaskScope = TASK_SCOPES.includes(scope as TaskScope)
    ? (scope as TaskScope)
    : "active";

  const result = await fetches.fetchTasks({
    scope: normalizedScope,
    status: (status as never) || null,
    category: (category as never) || null,
    projectId: projectId || null,
    limit: limit ? Number(limit) : undefined,
    cursor,
  });

  const response: TaskListResponse = {
    message: "getTasks",
    ...result,
  };
  res.status(200).json(response);
});

export const getTaskDetail = asyncHandler(
  async (req: { params: { id: string } }, res) => {
    const task = await fetches.fetchTaskById(req.params.id);
    const response: TaskDetailResponse = {
      message: "getTaskDetail",
      data: task,
    };
    res.status(200).json(response);
  },
);

export const createTask = asyncHandler(async (req, res) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid task payload", issues: parsed.error.issues });
    return;
  }
  const task = await fetches.createTask(parsed.data);
  res.status(201).json({ message: "createTask", data: task });
});

export const updateTask = asyncHandler(
  async (req: { params: { id: string }; body: unknown }, res) => {
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid task payload", issues: parsed.error.issues });
      return;
    }
    const task = await fetches.updateTask(req.params.id, parsed.data);
    res.status(200).json({ message: "updateTask", data: task });
  },
);
