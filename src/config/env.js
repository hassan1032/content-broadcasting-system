import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "khanhassan",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  uploadDir: process.env.UPLOAD_DIR ?? "storage/uploads",
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? "http://localhost:4000",
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "content_broadcasting",
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? 10),
  },
};
