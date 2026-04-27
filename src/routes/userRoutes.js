import { Router } from "express";
import { list } from "../controllers/userController.js";
import { authenticate, requireRole } from "../middlewares/auth.js";

export const userRoutes = Router();

userRoutes.get("/", authenticate, requireRole("principal"), list);
