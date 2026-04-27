import {
  approveContentByPrincipal,
  getContentForUser,
  getLiveContent,
  rejectContentByPrincipal,
  uploadContent,
} from "../services/contentService.js";
import {
  contentUploadSchema,
  listContentSchema,
  liveSchema,
  rejectSchema,
} from "../utils/validators.js";

const validationErrorResponse = (res, error) => {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  });
};

export const createContent = async (req, res) => {
  try {
    const body = contentUploadSchema.parse(req.body);
    const content = await uploadContent({ body, file: req.file, user: req.user });
    return res.status(201).json({ success: true, message: "Content uploaded successfully and sent for approval.", data: content, });
  } catch (error) {
    if (error.issues) return validationErrorResponse(res, error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
export const list = async (req, res) => {
  try {
    const filters = listContentSchema.parse(req.query);
    const content = await getContentForUser(req.user, filters);
    return res.status(200).json({ success: true, message: "Data Retrieved successfully", data: content, });
  } catch (error) {
    if (error.issues) return validationErrorResponse(res, error);
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error", });
  }
};
export const pending = async (req, res) => {
  try {
    const content = await getContentForUser(req.user, { status: "pending" });
    return res.status(200).json({ success: true, message: "Pending content retrieved successfully.", data: content, });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error", });
  }
};
export const approve = async (req, res) => {
  try {
    const content = await approveContentByPrincipal({ id: Number(req.params.id), principalId: req.user.id, });
    return res.status(200).json({ success: true, message: "Content approved successfully.", data: content, });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error", });
  }
};
export const reject = async (req, res) => {
  try {
    const { reason } = rejectSchema.parse(req.body);
    const content = await rejectContentByPrincipal({
      id: Number(req.params.id),
      principalId: req.user.id,
      reason,
    });
    return res.status(200).json({ success: true, message: "Content rejected successfully.", data: content, });
  } catch (error) {
    if (error.issues) return validationErrorResponse(res, error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
export const live = async (req, res) => {
  try {
    const input = liveSchema.parse({
      teacherId: req.params.teacherId ?? req.query.teacherId,
      subject: req.query.subject,
    });
    const content = await getLiveContent(input);
    if (!content) {
      return res.status(200).json({ success: true, message: "No content available", data: [], });
    }
    return res.status(200).json({ success: true, message: "Live content retrieved successfully.", data: content, });
  } catch (error) {
    if (error.issues) return validationErrorResponse(res, error);
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal Server Error", });
  }
};
