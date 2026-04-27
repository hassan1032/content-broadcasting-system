import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8),
  role: z.enum(["principal", "teacher"]),
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

export const contentUploadSchema = z
  .object({
    title: z.string().trim().min(1),
    subject: z.string().trim().min(1).transform((value) => value.toLowerCase()),
    description: z.string().trim().optional(),
    start_time: z.coerce.date(),
    end_time: z.coerce.date(),
    rotation_duration_minutes: z.coerce.number().int().positive().max(1440).optional(),
  })
  .refine((data) => data.end_time > data.start_time, {
    path: ["end_time"],
    message: "end_time must be after start_time",
  });

export const listContentSchema = z.object({
  status: z.enum(["uploaded", "pending", "approved", "rejected"]).optional(),
  subject: z.string().trim().min(1).transform((value) => value.toLowerCase()).optional(),
  teacherId: z.coerce.number().int().positive().optional(),
});

export const rejectSchema = z.object({
  reason: z.string().trim().min(1, "Rejection reason is required"),
});

export const liveSchema = z.object({
  teacherId: z.coerce.number().int().positive(),
  subject: z.string().trim().min(1).transform((value) => value.toLowerCase()).optional(),
});
