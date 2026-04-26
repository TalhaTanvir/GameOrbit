import { type Request, type Response } from "express";
import { Types } from "mongoose";
import { type AuthenticatedRequest } from "../middleware/require-admin-auth.middleware.ts";
import { ProductModel } from "../models/product.model.ts";
import { AppError, asyncHandler } from "../utils/index.ts";

export const createProduct = asyncHandler(async (request: Request, response: Response) => {
  const authRequest = request as AuthenticatedRequest;

  const product = await ProductModel.create({
    ...(request.body as object),
    createdBy: new Types.ObjectId(authRequest.admin.sub),
    updatedBy: new Types.ObjectId(authRequest.admin.sub),
  });

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

  const product = await ProductModel.findByIdAndUpdate(
    request.params.id,
    {
      ...(request.body as object),
      updatedBy: new Types.ObjectId(authRequest.admin.sub),
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  if (!product) {
    throw new AppError("Product not found", 404);
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

  response.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});
