import { type Request, type Response } from "express";
import { Types } from "mongoose";
import { type AuthenticatedRequest } from "../middleware/require-admin-auth.middleware.ts";
import { HeroImageModel } from "../models/hero-image.model.ts";
import {
  cloudinaryFolders,
  deleteImagesFromCloudinary,
  uploadImageToCloudinary,
} from "../services/media/cloudinary.service.ts";
import { AppError, asyncHandler } from "../utils/index.ts";

type CreateHeroImageBody = {
  title: string;
  altText: string;
  isActive?: boolean;
  displayOrder?: number;
};

const cleanupCloudinaryAssets = async (publicIds: string[]): Promise<void> => {
  try {
    await deleteImagesFromCloudinary(publicIds);
  } catch (error) {
    console.error("Cloudinary cleanup failed:", error);
  }
};

const getHeroImagePublicIds = (heroImage: { imagePublicId?: string | null }): string[] => {
  if (typeof heroImage.imagePublicId !== "string" || heroImage.imagePublicId.length === 0) {
    return [];
  }

  return [heroImage.imagePublicId];
};

export const createHeroImage = asyncHandler(async (request: Request, response: Response) => {
  const authRequest = request as AuthenticatedRequest;
  const file = request.file;

  if (!file) {
    throw new AppError("Hero image file is required", 400);
  }

  const payload = request.body as CreateHeroImageBody;
  const uploadedImage = await uploadImageToCloudinary({
    file,
    folder: cloudinaryFolders.heroImages,
    publicIdPrefix: payload.title,
  });

  const heroImage = await HeroImageModel.create({
    ...(payload as object),
    imageUrl: uploadedImage.url,
    imagePublicId: uploadedImage.publicId,
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
  const existingHeroImage = await HeroImageModel.findById(request.params.id).lean();

  if (!existingHeroImage) {
    throw new AppError("Hero image not found", 404);
  }

  const payload = request.body as Partial<CreateHeroImageBody>;
  const hasBodyUpdates = Object.keys(payload).length > 0;
  const file = request.file;

  if (!hasBodyUpdates && !file) {
    throw new AppError("At least one field or image file is required", 400);
  }

  let uploadedImage: Awaited<ReturnType<typeof uploadImageToCloudinary>> | null = null;

  if (file) {
    uploadedImage = await uploadImageToCloudinary({
      file,
      folder: cloudinaryFolders.heroImages,
      publicIdPrefix: payload.title ?? existingHeroImage.title,
    });
  }

  const updatePayload: Record<string, unknown> = {
    ...(payload as object),
  };

  if (uploadedImage) {
    updatePayload.imageUrl = uploadedImage.url;
    updatePayload.imagePublicId = uploadedImage.publicId;
  }

  const heroImage = await (async () => {
    try {
      return await HeroImageModel.findByIdAndUpdate(request.params.id, updatePayload, {
        new: true,
        runValidators: true,
      }).lean();
    } catch (error) {
      if (uploadedImage) {
        await cleanupCloudinaryAssets([uploadedImage.publicId]);
      }

      throw error;
    }
  })();

  if (!heroImage) {
    if (uploadedImage) {
      await cleanupCloudinaryAssets([uploadedImage.publicId]);
    }

    throw new AppError("Hero image not found", 404);
  }

  if (uploadedImage && existingHeroImage.imagePublicId !== uploadedImage.publicId) {
    await cleanupCloudinaryAssets(getHeroImagePublicIds(existingHeroImage));
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

  await cleanupCloudinaryAssets(getHeroImagePublicIds(heroImage));

  response.status(200).json({
    success: true,
    message: "Hero image deleted successfully",
  });
});
