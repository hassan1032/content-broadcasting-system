import fs from "node:fs";
import multer from "multer";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";

fs.mkdirSync(env.uploadDir, { recursive: true });

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/gif"]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new AppError(400, "Only JPG, PNG, and GIF files are allowed"));
    }
    return cb(null, true);
  },
});
