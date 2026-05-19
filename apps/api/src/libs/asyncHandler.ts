import type { Request, Response, NextFunction } from "express";

type AsyncRequestHandler<P, Q> = (
  req: Request<P, any, any, Q>,
  res: Response,
  next: NextFunction,
) => Promise<any>;
export const asyncHandler =
  <P, Q>(fn: AsyncRequestHandler<P, Q>) =>
  (req: Request<P, any, any, Q>, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
