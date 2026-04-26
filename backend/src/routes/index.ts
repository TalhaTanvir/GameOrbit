import { Router } from "express";
import adminAuthRouter from "./admin.route.ts";
import {
  dashboardHeroImageRouter,
  publicHeroImageRouter,
} from "./hero-image.route.ts";
import {
  dashboardProductRouter,
  publicProductRouter,
} from "./product.route.ts";

const rootRouter = Router();

rootRouter.use("/auth", adminAuthRouter);
rootRouter.use("/hero-images", publicHeroImageRouter);
rootRouter.use("/products", publicProductRouter);
rootRouter.use("/dashboard/hero-images", dashboardHeroImageRouter);
rootRouter.use("/dashboard/products", dashboardProductRouter);

export default rootRouter;
