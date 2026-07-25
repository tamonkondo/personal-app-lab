import { Client } from "@notionhq/client";
import { config } from "@/libs/config";

const notionClient = new Client({
  auth: config.NOTION_ACCESS_TOKEN,
  timeoutMs: 10000,
  notionVersion: "2026-03-11",
});

export default notionClient;
