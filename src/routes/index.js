import { Router } from "express";
import { authRoutes } from "./authRoutes.js";
import { contentRoutes } from "./contentRoutes.js";
import { userRoutes } from "./userRoutes.js";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/content", contentRoutes);
routes.use("/users", userRoutes);
