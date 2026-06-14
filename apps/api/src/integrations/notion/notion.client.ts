import { Client } from "@notionhq/client";

const notionClient = new Client({
  auth: process.env.NOTION_ACCESS_TOKEN,
  timeoutMs: 10000, 
});

export default notionClient;
