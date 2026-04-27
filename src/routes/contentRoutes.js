import { Router } from "express";
import {
  approve,
  createContent,
  list,
  live,
  pending,
  reject,
} from "../controllers/contentController.js";
import { authenticate, requireRole } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

export const contentRoutes = Router();

contentRoutes.get("/live", live);
contentRoutes.get("/live/:teacherId", live);

contentRoutes.use(authenticate);
contentRoutes.get("/", list);
contentRoutes.post("/", requireRole("teacher"), upload.single("file"), createContent);
contentRoutes.get("/pending", requireRole("principal"), pending);
contentRoutes.patch("/:id/approve", requireRole("principal"), approve);
contentRoutes.patch("/:id/reject", requireRole("principal"), reject);
