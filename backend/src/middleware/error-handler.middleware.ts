import { type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { env } from "../config/env.ts";
import { AppError } from "../utils/index.ts";

export type ErrorWithStatus = Error & {
  statusCode?: number;
  code?: number | string;
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

  if (error instanceof multer.MulterError) {
    statusCode = 400;

    if (error.code === "LIMIT_FILE_SIZE") {
      message = "File is too large. Maximum allowed size is 5MB.";
    } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected file field in upload request.";
    } else {
      message = error.message;
    }
  }

  response.status(statusCode).json({
    success: false,
    message,
    ...(env.isProduction ? {} : { stack: error.stack }),
  });
};
