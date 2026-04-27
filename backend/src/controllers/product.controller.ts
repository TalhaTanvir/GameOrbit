import { type Request, type Response } from "express";
import { Types } from "mongoose";
import { type AuthenticatedRequest } from "../middleware/require-admin-auth.middleware.ts";
import { ProductModel } from "../models/product.model.ts";
import {
  cloudinaryFolders,
  deleteImagesFromCloudinary,
  uploadImageToCloudinary,
  type UploadedImageAsset,
} from "../services/media/cloudinary.service.ts";
import { AppError, asyncHandler } from "../utils/index.ts";

type CreateProductBody = {
  name: string;
  description: string;
  price: number;
  category?: string;
  stockQuantity?: number;
  isActive?: boolean;
};

type ProductWithImages = {
  imagePublicId?: string | null;
  images?: Array<{
    publicId?: string | null;
  }>;
};

const getUploadedProductFiles = (request: Request): Express.Multer.File[] => {
  if (!request.files) {
    return [];
  }

  if (Array.isArray(request.files)) {
    return request.files;
  }

  return [];
};

const toProductImagePayload = (uploadedImage: UploadedImageAsset) => {
  return {
    url: uploadedImage.url,
    publicId: uploadedImage.publicId,
    width: uploadedImage.width,
    height: uploadedImage.height,
    format: uploadedImage.format,
    bytes: uploadedImage.bytes,
  };
};

const getProductImagePublicIds = (product: ProductWithImages): string[] => {
  const galleryPublicIds = (product.images ?? [])
    .map((image) => image.publicId ?? "")
    .filter((publicId) => publicId.length > 0);

  if (galleryPublicIds.length > 0) {
    return galleryPublicIds;
  }

  if (typeof product.imagePublicId === "string" && product.imagePublicId.length > 0) {
    return [product.imagePublicId];
  }

  return [];
};

export const createProduct = asyncHandler(async (request: Request, response: Response) => {
  const authRequest = request as AuthenticatedRequest;
  const payload = request.body as CreateProductBody;
  const files = getUploadedProductFiles(request);

  if (files.length === 0) {
    throw new AppError("At least one product image is required", 400);
  }

  const uploadedImages = await Promise.all(
    files.map((file) =>
      uploadImageToCloudinary({
        file,
        folder: cloudinaryFolders.products,
        publicIdPrefix: payload.name,
      })
    )
  );

  const productImages = uploadedImages.map(toProductImagePayload);
  const primaryImage = productImages[0];

  const product = await (async () => {
    try {
      return await ProductModel.create({
        ...(payload as object),
        imageUrl: primaryImage.url,
        imagePublicId: primaryImage.publicId,
        images: productImages,
        createdBy: new Types.ObjectId(authRequest.admin.sub),
        updatedBy: new Types.ObjectId(authRequest.admin.sub),
      });
    } catch (error) {
      try {
        await deleteImagesFromCloudinary(uploadedImages.map((image) => image.publicId));
      } catch (cleanupError) {
        console.error("Cloudinary rollback failed during product create:", cleanupError);
        throw new AppError(
          "Failed to create product and rollback uploaded media. Manual cleanup may be required.",
          500
        );
      }

      throw error;
    }
  })();

  response.status(201).json({
    success: true,
    message: "Product created successfully",
    data: {
      product,
    },
  });
});

export const getPublicProducts = asyncHandler(async (_request: Request, response: Response) => {
  const products = await ProductModel.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean();

  response.status(200).json({
    success: true,
    data: {
      items: products,
      total: products.length,
    },
  });
});

export const getPublicProductById = asyncHandler(async (request: Request, response: Response) => {
  const product = await ProductModel.findOne({
    _id: request.params.id,
    isActive: true,
  }).lean();

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  response.status(200).json({
    success: true,
    data: {
      product,
    },
  });
});

export const getAdminProducts = asyncHandler(async (_request: Request, response: Response) => {
  const products = await ProductModel.find().sort({ createdAt: -1 }).lean();

  response.status(200).json({
    success: true,
    data: {
      items: products,
      total: products.length,
    },
  });
});

export const getAdminProductById = asyncHandler(async (request: Request, response: Response) => {
  const product = await ProductModel.findById(request.params.id).lean();

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  response.status(200).json({
    success: true,
    data: {
      product,
    },
  });
});

export const updateProductById = asyncHandler(async (request: Request, response: Response) => {
  const authRequest = request as AuthenticatedRequest;
  const existingProduct = await ProductModel.findById(request.params.id).lean();

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  const payload = request.body as Partial<CreateProductBody>;
  const files = getUploadedProductFiles(request);
  const hasBodyUpdates = Object.keys(payload).length > 0;
  const hasNewImages = files.length > 0;

  if (!hasBodyUpdates && !hasNewImages) {
    throw new AppError("At least one field or image file is required", 400);
  }

  let uploadedImages: UploadedImageAsset[] = [];

  if (hasNewImages) {
    uploadedImages = await Promise.all(
      files.map((file) =>
        uploadImageToCloudinary({
          file,
          folder: cloudinaryFolders.products,
          publicIdPrefix: payload.name ?? existingProduct.name,
        })
      )
    );
  }

  const updatePayload: Record<string, unknown> = {
    ...(payload as object),
    updatedBy: new Types.ObjectId(authRequest.admin.sub),
  };

  if (uploadedImages.length > 0) {
    const productImages = uploadedImages.map(toProductImagePayload);
    const primaryImage = productImages[0];

    updatePayload.imageUrl = primaryImage.url;
    updatePayload.imagePublicId = primaryImage.publicId;
    updatePayload.images = productImages;
  }

  const product = await (async () => {
    try {
      return await ProductModel.findByIdAndUpdate(request.params.id, updatePayload, {
        new: true,
        runValidators: true,
      }).lean();
    } catch (error) {
      if (uploadedImages.length > 0) {
        try {
          await deleteImagesFromCloudinary(uploadedImages.map((image) => image.publicId));
        } catch (cleanupError) {
          console.error("Cloudinary rollback failed during product update:", cleanupError);
          throw new AppError(
            "Failed to update product and rollback uploaded media. Manual cleanup may be required.",
            500
          );
        }
      }

      throw error;
    }
  })();

  if (!product) {
    if (uploadedImages.length > 0) {
      try {
        await deleteImagesFromCloudinary(uploadedImages.map((image) => image.publicId));
      } catch (cleanupError) {
        console.error("Cloudinary rollback failed after product update miss:", cleanupError);
        throw new AppError(
          "Failed to rollback uploaded media after update. Manual cleanup may be required.",
          500
        );
      }
    }

    throw new AppError("Product not found", 404);
  }

  if (uploadedImages.length > 0) {
    try {
      await deleteImagesFromCloudinary(getProductImagePublicIds(existingProduct));
    } catch (cleanupError) {
      console.error("Cloudinary cleanup failed after product update:", cleanupError);
      throw new AppError(
        "Product updated but old media cleanup failed. Manual cleanup may be required.",
        502
      );
    }
  }

  response.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: {
      product,
    },
  });
});

export const deleteProductById = asyncHandler(async (request: Request, response: Response) => {
  const product = await ProductModel.findByIdAndDelete(request.params.id).lean();

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  try {
    await deleteImagesFromCloudinary(getProductImagePublicIds(product));
  } catch (cleanupError) {
    console.error("Cloudinary cleanup failed after product delete:", cleanupError);
    throw new AppError(
      "Product deleted but media cleanup failed. Manual cleanup may be required.",
      502
    );
  }

  response.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});
