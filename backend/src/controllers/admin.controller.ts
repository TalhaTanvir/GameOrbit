import { type CookieOptions, type Request, type Response } from "express";
import { env } from "../config/env.ts";
import { type AuthenticatedRequest } from "../middleware/require-admin-auth.middleware.ts";
import { AdminModel } from "../models/admin.model.ts";
import {
  AppError,
  asyncHandler,
  comparePassword,
  hashPassword,
  signAdminAccessToken,
} from "../utils/index.ts";

const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.cookie.secure,
  sameSite: env.cookie.sameSite,
  path: "/",
};

if (env.cookie.domain) {
  authCookieOptions.domain = env.cookie.domain;
}

const issueAccessToken = (response: Response, admin: {
  _id: { toString: () => string };
  email: string;
}): string => {
  const accessToken = signAdminAccessToken({
    adminId: admin._id.toString(),
    email: admin.email,
  });

  response.cookie("adminAccessToken", accessToken, authCookieOptions);
  return accessToken;
};

export const setupAdmin = asyncHandler(async (request: Request, response: Response) => {
  const { name, email, password } = request.body as {
    name: string;
    email: string;
    password: string;
  };

  const existingAdmin = await AdminModel.findOne().select("_id").lean();
  if (existingAdmin) {
    throw new AppError("Admin setup already completed", 409);
  }

  const normalizedEmail = email.toLowerCase();
  const passwordHash = await hashPassword(password);

  const admin = await (async () => {
    try {
      return await AdminModel.create({
        name,
        email: normalizedEmail,
        passwordHash,
      });
    } catch (error) {
      const maybeMongoError = error as { code?: number };
      if (maybeMongoError.code === 11000) {
        throw new AppError("Admin setup already completed", 409);
      }

      throw error;
    }
  })();

  const accessToken = issueAccessToken(response, admin);

  response.status(201).json({
    success: true,
    message: "Admin account created successfully",
    data: {
      admin,
      accessToken,
    },
  });
});

export const loginAdmin = asyncHandler(async (request: Request, response: Response) => {
  const { email, password } = request.body as {
    email: string;
    password: string;
  };

  const normalizedEmail = email.toLowerCase();
  const admin = await AdminModel.findOne({ email: normalizedEmail }).select(
    "+passwordHash"
  );

  if (!admin) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordMatch = await comparePassword(password, admin.passwordHash);

  if (!isPasswordMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const accessToken = issueAccessToken(response, admin);

  response.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      admin,
      accessToken,
    },
  });
});

export const getCurrentAdmin = asyncHandler(async (request: Request, response: Response) => {
  const authRequest = request as AuthenticatedRequest;
  const admin = await AdminModel.findById(authRequest.admin.sub);

  if (!admin) {
    throw new AppError("Admin not found", 404);
  }

  response.status(200).json({
    success: true,
    data: {
      admin,
    },
  });
});

export const logoutAdmin = asyncHandler(async (_request: Request, response: Response) => {
  response.clearCookie("adminAccessToken", authCookieOptions);

  response.status(200).json({
    success: true,
    message: "Logout successful",
  });
});
