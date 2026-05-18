import type { Request, Response, NextFunction } from "express";

type AsyncRequestHandler<Req = Request, Res = Response> = (req: Req, res: Res, next: NextFunction) => Promise<any>;
export const asyncHandler =
  <H extends AsyncRequestHandler>(fn: H) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
