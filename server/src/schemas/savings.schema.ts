import { z } from 'zod';

export const CreateSavingsGoalSchema = z.object({
  name:          z.string().min(1).max(100),
  target_amount: z.number().positive().max(9999999.99),
  current_amount: z.number().nonnegative().max(9999999.99).optional(),
  target_date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  icon:          z.string().max(10).optional(),
  color:         z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const UpdateSavingsGoalSchema = CreateSavingsGoalSchema.partial().extend({
  is_completed: z.boolean().optional(),
});

export const CreateContributionSchema = z.object({
  period_id:        z.string().uuid(),
  amount:           z.number().positive().max(999999.99),
  contributed_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
});

export type CreateSavingsGoal  = z.infer<typeof CreateSavingsGoalSchema>;
export type UpdateSavingsGoal  = z.infer<typeof UpdateSavingsGoalSchema>;
export type CreateContribution = z.infer<typeof CreateContributionSchema>;
