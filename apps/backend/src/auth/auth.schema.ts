import { z } from 'zod';

export const userSchema = z.object({
  id: z.uuid(),
  full_name: z.string(),
  email: z.email(),
  points: z.number().int().min(0),
  barcode: z.string(),
  created_at: z.string(),
});

export const createUserSchema = z.object({
  full_name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const updateUserSchema = createUserSchema.partial().omit({
  password: true,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type User = z.infer<typeof userSchema>;
