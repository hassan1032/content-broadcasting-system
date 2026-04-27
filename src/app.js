import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../docs/openapi.json" with { type: "json" };
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { routes } from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true, }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
app.get("/setup-db", async (req, res) => {
  try {
    const { query } = await import("./config/db.js");

    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(160) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('principal','teacher') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS content_slots (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        subject VARCHAR(80) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS content (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(180) NOT NULL,
        description TEXT,
        subject VARCHAR(80),
        file_path VARCHAR(500),
        file_url VARCHAR(500),
        file_type VARCHAR(100),
        file_size BIGINT UNSIGNED,
        uploaded_by BIGINT UNSIGNED,
        status ENUM('uploaded','pending','approved','rejected') DEFAULT 'pending',
        start_time DATETIME,
        end_time DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS content_schedule (
        id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        content_id BIGINT UNSIGNED NOT NULL,
        slot_id BIGINT UNSIGNED NOT NULL,
        rotation_order INT UNSIGNED,
        duration_minutes INT UNSIGNED DEFAULT 5
      )
    `);

    res.send("✅ DB Ready");
  } catch (err) {
    res.send(err.message);
  }
});

app.use("/uploads", express.static(path.resolve(__dirname, "..", env.uploadDir)));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(
  "/api/content/live",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);
