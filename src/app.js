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
  res.json({ status: "Content Broadcasting API is running 🚀" });
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
