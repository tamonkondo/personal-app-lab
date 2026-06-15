export type User = {
  id: string;
  name: string;
  email: string;
};

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export type PaginationMetaResponse = {
  has_more: boolean;
  next_cursor?: string;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: PaginationMetaResponse;
};
