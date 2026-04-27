import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { findUserById } from "../models/userModel.js";
import { AppError } from "../utils/errors.js";

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      throw new AppError(401, "Authentication token is required");
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await findUserById(payload.sub ?? payload.userId);
    if (!user) {
      throw new AppError(401, "Invalid authentication token");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.name === "JsonWebTokenError" ? new AppError(401, "Invalid authentication token") : error);
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new AppError(403, "You do not have permission to perform this action"));
    }
    return next();
  };
}
