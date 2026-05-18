// notionTypes.ts
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

/**
 * どのDBでも共通で持っているページのメタ情報
 */
export type BasePageMeta = Pick<
  PageObjectResponse,
  | "id"
  | "object"
  | "created_time"
  | "last_edited_time"
  | "created_by"
  | "last_edited_by"
  | "parent"
  | "in_trash"
  | "is_archived"
  | "is_locked"
  | "cover"
  | "icon"
  | "url"
  | "public_url"
>;

