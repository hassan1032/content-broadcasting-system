import { loginUser, registerUser } from "../services/authService.js";
import { loginSchema, registerSchema } from "../utils/validators.js";

export const register = async (req, res) => {
  try {
    const input = registerSchema.parse(req.body);
    const user = await registerUser(input);
    return res.status(201).json({ success: true, message: "User Created successfully.", data: user, });
  } catch (error) {
    if (error.issues) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message, })),
      });
    }
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error", });
  }
};

export const login = async (req, res) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(input);
    return res.status(200).json({ success: true, message: "Login successful", data: result, });
  } catch (error) {
    if (error.issues) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const me = async (req, res) => {
  try {
    return res.status(200).json({ success: true, message: "Data Retrieved successfully", data: req.user, });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error", });
  }
};
