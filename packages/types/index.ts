export type User = {
  id: string;
  name: string;
  email: string;
};

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export type BaseMeta = {
  has_more: boolean;
  next_cursor?: string;
};
