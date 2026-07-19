import { asyncHandler } from "@/libs/asyncHandler";
import type { ProjectListResponse } from "@repo/types/notion-todo-pomodoro-app";
import * as fetches from "./project.notion";

type GetProjectsRequest = {
  query: { limit?: string; cursor?: string };
};

export const getProjects = asyncHandler(
  async (req: GetProjectsRequest, res) => {
    const { limit, cursor } = req.query;
    const result = await fetches.fetchProjects({
      limit: limit ? Number(limit) : undefined,
      cursor,
    });
    const response: ProjectListResponse = {
      message: "getProjects",
      ...result,
    };
    res.status(200).json(response);
  },
);
