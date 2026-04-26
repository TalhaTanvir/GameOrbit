import bcrypt from "bcryptjs";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.ts";
import { AppError } from "./app-error.ts";

export type AdminJwtPayload = {
  sub: string;
  email: string;
  role: "admin";
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, env.bcryptSaltRounds);
};

export const comparePassword = async (
  password: string,
  passwordHash: string
): Promise<boolean> => {
  return bcrypt.compare(password, passwordHash);
};

export const signAdminAccessToken = (payload: {
  adminId: string;
  email: string;
}): string => {
  const options: SignOptions = {
    subject: payload.adminId,
    expiresIn: env.jwt.accessExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      email: payload.email,
      role: "admin",
    },
    env.jwt.accessSecret,
    options
  );
};

export const verifyAdminAccessToken = (token: string): AdminJwtPayload => {
  let decoded: string | JwtPayload;

  try {
    decoded = jwt.verify(token, env.jwt.accessSecret);
  } catch {
    throw new AppError("Invalid or expired access token", 401);
  }

  if (typeof decoded === "string") {
    throw new AppError("Invalid access token payload", 401);
  }

  if (
    typeof decoded.sub !== "string" ||
    typeof decoded.email !== "string" ||
    decoded.role !== "admin"
  ) {
    throw new AppError("Invalid access token payload", 401);
  }

  return {
    sub: decoded.sub,
    email: decoded.email,
    role: "admin",
  };
};
