import { type NextFunction, type Request, type Response } from "express";

export type AsyncRouteHandler = (
  request: Request,
  response: Response,
  next: NextFunction
) => Promise<unknown>;

export const asyncHandler = (handler: AsyncRouteHandler) => {
  return (request: Request, response: Response, next: NextFunction): void => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
};
