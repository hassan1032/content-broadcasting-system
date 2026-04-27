import { env } from "../config/env.js";
import {
  approveContent,
  createContentWithSchedule,
  findContentById,
  findLiveCandidates,
  listContent,
  rejectContent,
} from "../models/contentModel.js";
import { AppError, notFound } from "../utils/errors.js";
import { selectActiveContent } from "./schedulingService.js";

export async function uploadContent({ body, file, user }) {
  if (!file) {
    throw new AppError(400, "File is required");
  }

  if (!body.start_time || !body.end_time) {
    throw new AppError(400, "start_time and end_time are required");
  }
  const startTime = new Date(body.start_time);
  const endTime = new Date(body.end_time);
  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    throw new AppError(400, "Invalid date format");
  }
  if (endTime <= startTime) {
    throw new AppError(400, "end_time must be after start_time");
  }

  const fileUrl = `${env.publicBaseUrl}/uploads/${file.filename}`;

  const id = await createContentWithSchedule({
    title: body.title,
    description: body.description ?? null,
    subject: body.subject.toLowerCase(),
    filePath: file.path,
    fileUrl,
    fileType: file.mimetype,
    fileSize: file.size,
    uploadedBy: user.id,
    startTime,
    endTime,

    durationMinutes: body.rotation_duration_minutes ?? 5,
  });

  return findContentById(id);
}

export async function getContentForUser(user, filters) {
  if (user.role === "teacher") {
    return listContent({ ...filters, teacherId: user.id });
  }
  return listContent(filters);
}

export async function approveContentByPrincipal({ id, principalId }) {
  const content = await findContentById(id);
  if (!content) {
    throw notFound("Content not found");
  }
  return approveContent({ id, approvedBy: principalId });
}

export async function rejectContentByPrincipal({ id, principalId, reason }) {
  const content = await findContentById(id);
  if (!content) {
    throw notFound("Content not found");
  }
  return rejectContent({ id, rejectedBy: principalId, reason });
}

export async function getLiveContent({ teacherId, subject, now = new Date() }) {
  const candidates = await findLiveCandidates({ teacherId, subject: subject?.toLowerCase(), now });
  const active = selectActiveContent(candidates, now);

  if (!active || (Array.isArray(active) && !active.length)) {
    return null;
  }

  return active;
}
