import { Router } from "express";
import { login, me, register } from "../controllers/authController.js";
import { authenticate, requireRole } from "../middlewares/auth.js";

export const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.post("/register", authenticate, requireRole("principal"), register);
authRoutes.get("/me", authenticate, me);
