import { pool } from "../config/db.js";
import { env } from "../config/env.js";
import { registerUser } from "../services/authService.js";

async function ensureUser(input) {
  try {
    const user = await registerUser(input);
    console.log(`Created ${input.role}: ${user.email}`);
  } catch (error) {
    if (error.statusCode === 409) {
      console.log(`${input.role} already exists: ${input.email}`);
      return;
    }
    throw error;
  }
}

await ensureUser({
  name: process.env.SEED_PRINCIPAL_NAME ?? "Principal User",
  email: process.env.SEED_PRINCIPAL_EMAIL ?? "principal@example.com",
  password: process.env.SEED_PRINCIPAL_PASSWORD ?? "Password123!",
  role: "principal",
});

await ensureUser({
  name: process.env.SEED_TEACHER_NAME ?? "Teacher User",
  email: process.env.SEED_TEACHER_EMAIL ?? "teacher@example.com",
  password: process.env.SEED_TEACHER_PASSWORD ?? "Password123!",
  role: "teacher",
});

await pool.end();
