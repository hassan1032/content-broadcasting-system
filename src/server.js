import { app } from "./app.js";
import { pingDatabase } from "./config/db.js";
import { env } from "./config/env.js";

async function startServer() {
  try {
    await pingDatabase();
    console.log("DB Connected");

    app.listen(env.port, () => {
      const baseUrl =
        process.env.PUBLIC_BASE_URL || `http://localhost:${env.port}`;

      console.log(`🚀 Server running on port ${env.port}`);
      console.log(`📚 Swagger docs available at ${baseUrl}/docs`);
    });
  } catch (error) {
    console.error("DB error:");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
