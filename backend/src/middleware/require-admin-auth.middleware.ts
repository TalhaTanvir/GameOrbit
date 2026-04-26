import { type NextFunction, type Request, type Response } from "express";
import { AppError, verifyAdminAccessToken, type AdminJwtPayload } from "../utils/index.ts";

export type AuthenticatedRequest = Request & {
  admin: AdminJwtPayload;
};

const readToken = (request: Request): string | null => {
  const authHeader = request.headers.authorization;

  if (typeof authHeader === "string") {
    const [scheme, token] = authHeader.split(" ");

    if (scheme === "Bearer" && token) {
      return token;
    }
  }

  const cookieToken = request.cookies?.adminAccessToken;
  if (typeof cookieToken === "string" && cookieToken.length > 0) {
    return cookieToken;
  }

  return null;
};

export const requireAdminAuth = (
  request: Request,
  _response: Response,
  next: NextFunction
): void => {
  const token = readToken(request);

  if (!token) {
    next(new AppError("Admin authentication is required", 401));
    return;
  }

  try {
    const payload = verifyAdminAccessToken(token);
    (request as AuthenticatedRequest).admin = payload;
    next();
  } catch (error) {
    next(error);
  }
};
