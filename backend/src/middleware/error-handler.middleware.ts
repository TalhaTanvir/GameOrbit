import { type NextFunction, type Request, type Response } from "express";
import { env } from "../config/env.ts";
import { AppError } from "../utils/index.ts";

export type ErrorWithStatus = Error & {
  statusCode?: number;
  code?: number;
  errors?: unknown;
};

export const errorHandler = (
  error: ErrorWithStatus,
  _request: Request,
  response: Response,
  _next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Mongo duplicate key error.
  if (error.code === 11000) {
    statusCode = 409;
    message = "Duplicate value found";
  }

  response.status(statusCode).json({
    success: false,
    message,
    ...(env.isProduction ? {} : { stack: error.stack }),
  });
};
