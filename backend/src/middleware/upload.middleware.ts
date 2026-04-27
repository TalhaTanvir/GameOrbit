import multer, { type FileFilterCallback } from "multer";
import { AppError } from "../utils/index.ts";

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_PRODUCT_IMAGES = 8;

const imageFileFilter = (
  _request: Express.Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
): void => {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    callback(
      new AppError(
        "Invalid file type. Allowed types: JPEG, JPG, PNG, WEBP, AVIF.",
        400
      )
    );
    return;
  }

  callback(null, true);
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_FILE_SIZE_BYTES,
  },
  fileFilter: imageFileFilter,
});

export const uploadHeroImage = upload.single("image");
export const uploadProductImages = upload.array("images", MAX_PRODUCT_IMAGES);
