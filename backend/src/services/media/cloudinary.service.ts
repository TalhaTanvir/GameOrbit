import { type UploadApiErrorResponse, type UploadApiResponse } from "cloudinary";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { cloudinary } from "../../config/cloudinary.ts";
import { env } from "../../config/env.ts";

export type UploadedImageAsset = {
  url: string;
  publicId: string;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number | null;
};

type UploadImageInput = {
  file: Express.Multer.File;
  folder: string;
  publicIdPrefix?: string;
};

const sanitizeForPublicId = (value: string): string => {
  const safeValue = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (safeValue.length === 0) {
    return "image";
  }

  return safeValue.slice(0, 60);
};

const createPublicId = (fileName: string, prefix?: string): string => {
  const parsedName = path.parse(fileName).name;
  const safeName = sanitizeForPublicId(parsedName);
  const safePrefix = prefix ? `${sanitizeForPublicId(prefix)}-` : "";
  const uniqueToken = randomUUID().split("-")[0];
  return `${safePrefix}${Date.now()}-${uniqueToken}-${safeName}`;
};

const mapUploadResponse = (result: UploadApiResponse): UploadedImageAsset => {
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: typeof result.width === "number" ? result.width : null,
    height: typeof result.height === "number" ? result.height : null,
    format: typeof result.format === "string" ? result.format : null,
    bytes: typeof result.bytes === "number" ? result.bytes : null,
  };
};

export const cloudinaryFolders = {
  heroImages: `${env.cloudinary.folderBase}/hero-images`,
  products: `${env.cloudinary.folderBase}/products`,
} as const;

export const uploadImageToCloudinary = async (
  input: UploadImageInput
): Promise<UploadedImageAsset> => {
  const { file, folder, publicIdPrefix } = input;

  return new Promise<UploadedImageAsset>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder,
        public_id: createPublicId(file.originalname, publicIdPrefix),
        overwrite: false,
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload failed"));
          return;
        }

        resolve(mapUploadResponse(result));
      }
    );

    uploadStream.end(file.buffer);
  });
};

export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  if (publicId.trim().length === 0) {
    return;
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Failed to delete Cloudinary asset: ${publicId}`);
  }
};

export const deleteImagesFromCloudinary = async (publicIds: string[]): Promise<void> => {
  const uniqueIds = [...new Set(publicIds.map((id) => id.trim()).filter(Boolean))];

  if (uniqueIds.length === 0) {
    return;
  }

  await Promise.all(uniqueIds.map((publicId) => deleteImageFromCloudinary(publicId)));
};
