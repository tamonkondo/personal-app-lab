import { Router } from "express";

import * as taskHandlers from "@/modules/notion-todo-pomodoro-app/features/task/task.handler";
import * as projectHandlers from "@/modules/notion-todo-pomodoro-app/features/project/project.handler";

export const notionTodoPomodoroAppRouter = Router();

// タスク
notionTodoPomodoroAppRouter.get("/tasks", taskHandlers.getTasks);
notionTodoPomodoroAppRouter.post("/tasks", taskHandlers.createTask);
notionTodoPomodoroAppRouter.get("/tasks/:id", taskHandlers.getTaskDetail);
notionTodoPomodoroAppRouter.patch("/tasks/:id", taskHandlers.updateTask);

// プロジェクト
notionTodoPomodoroAppRouter.get("/projects", projectHandlers.getProjects);
