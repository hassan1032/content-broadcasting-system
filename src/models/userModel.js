import { query } from "../config/db.js";

const publicFields = "id, name, email, role, created_at";

export async function findUserByEmail(email) {
  const rows = await query("SELECT * FROM users WHERE email = :email LIMIT 1", { email });
  return rows[0] ?? null;
}

export async function findUserById(id) {
  const rows = await query(`SELECT ${publicFields} FROM users WHERE id = :id LIMIT 1`, { id });
  return rows[0] ?? null;
}

export async function createUser({ name, email, passwordHash, role }) {
  const result = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES (:name, :email, :passwordHash, :role)`,
    { name, email, passwordHash, role },
  );

  return findUserById(result.insertId);
}

export async function listUsers(role) {
  const sql = role
    ? `SELECT ${publicFields} FROM users WHERE role = :role ORDER BY created_at DESC`
    : `SELECT ${publicFields} FROM users ORDER BY created_at DESC`;
  return query(sql, role ? { role } : {});
}
