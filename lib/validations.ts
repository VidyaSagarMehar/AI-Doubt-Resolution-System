import { z } from "zod";
import {
  sanitizeEmail,
  sanitizeMultilineText,
  sanitizeText,
} from "@/lib/sanitize";

export const signupSchema = z.object({
  name: z.string().min(2).max(80).transform(sanitizeText),
  email: z.string().email().transform(sanitizeEmail),
  password: z.string().min(8).max(128),
  role: z.enum(["student", "mentor"]).default("student"),
});

export const loginSchema = z.object({
  email: z.string().email().transform(sanitizeEmail),
  password: z.string().min(8).max(128),
});

export const doubtSchema = z.object({
  title: z.string().min(5).max(150).transform(sanitizeText),
  description: z.string().min(10).max(5000).transform(sanitizeMultilineText),
});

export const feedbackSchema = z.object({
  doubtId: z.string().min(1),
  isHelpful: z.boolean(),
  comment: z
    .string()
    .max(500)
    .optional()
    .transform((value) => (value ? sanitizeMultilineText(value) : undefined)),
});

export const escalateSchema = z.object({
  doubtId: z.string().min(1),
});

export const aiSchema = z.object({
  doubtId: z.string().min(1),
});
