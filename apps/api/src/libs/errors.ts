/**
 * アプリケーションエラー。
 * errorHandler が status を見て適切な HTTP ステータスへマッピングする。
 * (従来は throw した Error がすべて 500 に丸められていた)
 */
export class AppError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400, "BAD_REQUEST");
    this.name = "BadRequestError";
  }
}
