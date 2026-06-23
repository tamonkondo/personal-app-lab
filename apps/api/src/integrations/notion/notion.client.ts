import { Client } from "@notionhq/client";

const notionClient = new Client({
  auth: process.env.NOTION_ACCESS_TOKEN,
  timeoutMs: 10000,
  notionVersion: "2026-03-11",
});

export default notionClient;
