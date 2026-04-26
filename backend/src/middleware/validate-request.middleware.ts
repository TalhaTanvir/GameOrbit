import { type NextFunction, type Request, type Response } from "express";
import { type ZodType } from "zod";

export const validateRequest = <T>(schema: ZodType<T>) => {
  return (request: Request, response: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    request.body = parsed.data;
    next();
  };
};
