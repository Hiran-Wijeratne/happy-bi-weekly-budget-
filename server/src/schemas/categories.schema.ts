import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name:       z.string().min(1).max(100),
  icon:       z.string().max(10).optional(),
  color:      z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').optional(),
  sort_order: z.number().int().nonnegative().optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  rollover_enabled: z.boolean().optional(),
});

export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
