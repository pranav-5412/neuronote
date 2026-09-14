import { z } from "zod";
export const uuid = z.string().uuid();
export const brainInput = z.object({
  id: uuid.optional(),
  name: z.string().trim().min(1, "Give your brain a name.").max(50),
  category: z.string().trim().min(1).max(80),
  icon: z.enum(["leaf", "atom", "flask", "globe", "calculator", "book"]),
  description: z.string().trim().max(220),
});
export const documentInput = z.object({
  id: uuid,
  name: z.string().trim().min(1).max(180),
  brainId: uuid,
});
export const profileInput = z.object({
  displayName: z.string().trim().min(1).max(80),
});
export const authInput = z.object({
  email: z.email().max(254),
  password: z.string().min(8, "Use at least 8 characters.").max(128),
});
