import { ZodError } from "zod";
import { env } from "../config/env.js";

export function errorHandler(error, req, res, next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "File size must not exceed 10MB",
    });
  }

  const statusCode = error.statusCode ?? 500;
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: error.message ?? "Internal server error",
    ...(error.details ? { details: error.details } : {}),
    ...(env.nodeEnv === "development" && statusCode === 500 ? { stack: error.stack } : {}),
  });
}
