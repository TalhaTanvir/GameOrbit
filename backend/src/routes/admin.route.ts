import { Router } from "express";
import {
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  setupAdmin,
} from "../controllers/admin.controller.ts";
import { requireAdminAuth, validateRequest } from "../middleware/index.ts";
import { adminLoginSchema, adminSetupSchema } from "../validations/index.ts";

const adminAuthRouter = Router();

adminAuthRouter.post("/setup", validateRequest(adminSetupSchema), setupAdmin);
adminAuthRouter.post("/login", validateRequest(adminLoginSchema), loginAdmin);
adminAuthRouter.post("/logout", requireAdminAuth, logoutAdmin);
adminAuthRouter.get("/me", requireAdminAuth, getCurrentAdmin);

export default adminAuthRouter;
