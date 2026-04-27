import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import { AppError } from "../utils/errors.js";
import { createUser, findUserByEmail } from "../models/userModel.js";

export async function registerUser(input) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new AppError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  return createUser({
    name: input.name,
    email: input.email,
    passwordHash,
    role: input.role,
  });
}

export async function loginUser({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    },
  };
}
