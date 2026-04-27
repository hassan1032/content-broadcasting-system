import { app } from "./app.js";
import { pingDatabase } from "./config/db.js";
import { env } from "./config/env.js";

async function startServer() {
  try {
    await pingDatabase();
    console.log("DB Connected");

    app.listen(env.port, () => {
      console.log(`local Running on ${env.port}`);
      console.log(`Swagger docs available at http://localhost:${env.port}/docs`);
    });
  } catch (error) {
    console.error("DB error:");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
