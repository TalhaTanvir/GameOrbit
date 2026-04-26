import { Router } from "express";
import {
  createProduct,
  getAdminProductById,
  getAdminProducts,
  getPublicProductById,
  getPublicProducts,
  deleteProductById,
  updateProductById,
} from "../controllers/product.controller.ts";
import {
  requireAdminAuth,
  validateObjectId,
  validateRequest,
} from "../middleware/index.ts";
import { createProductSchema, updateProductSchema } from "../validations/index.ts";

export const publicProductRouter = Router();
publicProductRouter.get("/", getPublicProducts);
publicProductRouter.get(
  "/:id",
  validateObjectId({ resourceName: "product" }),
  getPublicProductById
);

export const dashboardProductRouter = Router();
dashboardProductRouter.use(requireAdminAuth);
dashboardProductRouter.get("/", getAdminProducts);
dashboardProductRouter.post("/", validateRequest(createProductSchema), createProduct);
dashboardProductRouter.get(
  "/:id",
  validateObjectId({ resourceName: "product" }),
  getAdminProductById
);
dashboardProductRouter.patch(
  "/:id",
  validateObjectId({ resourceName: "product" }),
  validateRequest(updateProductSchema),
  updateProductById
);
dashboardProductRouter.delete(
  "/:id",
  validateObjectId({ resourceName: "product" }),
  deleteProductById
);

export default publicProductRouter;
