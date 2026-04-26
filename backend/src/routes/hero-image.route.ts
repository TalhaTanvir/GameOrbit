import { Router } from "express";
import {
  createHeroImage,
  getAdminHeroImageById,
  getAdminHeroImages,
  getPublicHeroImages,
  deleteHeroImageById,
  updateHeroImageById,
} from "../controllers/hero-image.controller.ts";
import {
  requireAdminAuth,
  validateObjectId,
  validateRequest,
} from "../middleware/index.ts";
import {
  createHeroImageSchema,
  updateHeroImageSchema,
} from "../validations/index.ts";

export const publicHeroImageRouter = Router();
publicHeroImageRouter.get("/", getPublicHeroImages);

export const dashboardHeroImageRouter = Router();
dashboardHeroImageRouter.use(requireAdminAuth);
dashboardHeroImageRouter.get("/", getAdminHeroImages);
dashboardHeroImageRouter.post(
  "/",
  validateRequest(createHeroImageSchema),
  createHeroImage
);
dashboardHeroImageRouter.get(
  "/:id",
  validateObjectId({ resourceName: "hero image" }),
  getAdminHeroImageById
);
dashboardHeroImageRouter.patch(
  "/:id",
  validateObjectId({ resourceName: "hero image" }),
  validateRequest(updateHeroImageSchema),
  updateHeroImageById
);
dashboardHeroImageRouter.delete(
  "/:id",
  validateObjectId({ resourceName: "hero image" }),
  deleteHeroImageById
);

export default publicHeroImageRouter;
