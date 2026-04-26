import { type Request, type Response } from "express";

export const notFoundHandler = (_request: Request, response: Response): void => {
  response.status(404).json({
    success: false,
    message: "Route not found",
  });
};

