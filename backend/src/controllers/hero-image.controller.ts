import { type Request, type Response } from "express";
import { Types } from "mongoose";
import { type AuthenticatedRequest } from "../middleware/require-admin-auth.middleware.ts";
import { HeroImageModel } from "../models/hero-image.model.ts";
import { AppError, asyncHandler } from "../utils/index.ts";

export const createHeroImage = asyncHandler(async (request: Request, response: Response) => {
  const authRequest = request as AuthenticatedRequest;

  const heroImage = await HeroImageModel.create({
    ...(request.body as object),
    createdBy: new Types.ObjectId(authRequest.admin.sub),
  });

  response.status(201).json({
    success: true,
    message: "Hero image created successfully",
    data: {
      heroImage,
    },
  });
});

export const getPublicHeroImages = asyncHandler(async (_request: Request, response: Response) => {
  const heroImages = await HeroImageModel.find({ isActive: true })
    .sort({ displayOrder: 1, createdAt: -1 })
    .lean();

  response.status(200).json({
    success: true,
    data: {
      items: heroImages,
      total: heroImages.length,
    },
  });
});

export const getAdminHeroImages = asyncHandler(async (_request: Request, response: Response) => {
  const heroImages = await HeroImageModel.find()
    .sort({ displayOrder: 1, createdAt: -1 })
    .lean();

  response.status(200).json({
    success: true,
    data: {
      items: heroImages,
      total: heroImages.length,
    },
  });
});

export const getAdminHeroImageById = asyncHandler(
  async (request: Request, response: Response) => {
    const heroImage = await HeroImageModel.findById(request.params.id).lean();

    if (!heroImage) {
      throw new AppError("Hero image not found", 404);
    }

    response.status(200).json({
      success: true,
      data: {
        heroImage,
      },
    });
  }
);

export const updateHeroImageById = asyncHandler(async (request: Request, response: Response) => {
  const heroImage = await HeroImageModel.findByIdAndUpdate(
    request.params.id,
    request.body,
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  if (!heroImage) {
    throw new AppError("Hero image not found", 404);
  }

  response.status(200).json({
    success: true,
    message: "Hero image updated successfully",
    data: {
      heroImage,
    },
  });
});

export const deleteHeroImageById = asyncHandler(async (request: Request, response: Response) => {
  const heroImage = await HeroImageModel.findByIdAndDelete(request.params.id).lean();

  if (!heroImage) {
    throw new AppError("Hero image not found", 404);
  }

  response.status(200).json({
    success: true,
    message: "Hero image deleted successfully",
  });
});
