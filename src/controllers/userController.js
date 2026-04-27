import { listUsers } from "../models/userModel.js";

export const list = async (req, res) => {
  try {
    const users = await listUsers(req.query.role);
    return res.status(200).json({ success: true, message: "Data Retrieved successfully", data: users, });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error", });
  }
};
