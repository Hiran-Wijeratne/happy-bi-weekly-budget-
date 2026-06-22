import { z } from 'zod';

export const UpsertUserSchema = z.object({
  email:        z.string().email(),
  display_name: z.string().max(100).optional(),
});

export const UpdateUserSchema = z.object({
  display_name:    z.string().max(100).optional(),
  pay_start_date:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  onboarding_done: z.boolean().optional(),
});

export type UpsertUser = z.infer<typeof UpsertUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
