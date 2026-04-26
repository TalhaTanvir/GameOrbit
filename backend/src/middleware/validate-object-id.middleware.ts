import { type NextFunction, type Request, type Response } from "express";
import { Types } from "mongoose";

type ValidateObjectIdOptions = {
  paramName?: string;
  resourceName?: string;
};

export const validateObjectId = (
  options: ValidateObjectIdOptions = {}
) => {
  const paramName = options.paramName || "id";
  const resourceName = options.resourceName || paramName;

  return (request: Request, response: Response, next: NextFunction): void => {
    const paramValue = request.params[paramName];

    if (typeof paramValue !== "string" || !Types.ObjectId.isValid(paramValue)) {
      response.status(400).json({
        success: false,
        message: `Invalid ${resourceName} id`,
      });
      return;
    }

    next();
  };
};

