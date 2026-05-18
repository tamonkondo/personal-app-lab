import { Router } from "express";
import notionClient from "@/integrations/notion/notion.client";

export const notionRouter = Router();

notionRouter.get("/", async (_req, res) => {
  const notionUserList = await notionClient.dataSources.listTemplates({
    data_source_id: "5a365c84-6c5c-4bb5-bc5e-51c58243b5a3"!,
  });
  res.status(200).json({
    message: "Notion API endpoint is working!",
    data: notionUserList,
  });
});
