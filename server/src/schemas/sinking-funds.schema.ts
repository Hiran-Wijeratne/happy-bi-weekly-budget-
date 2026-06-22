import { z } from 'zod';

export const CreateSinkingFundSchema = z.object({
  name:              z.string().min(1).max(100),
  target_amount:     z.number().positive().max(9999999.99),
  per_period_amount: z.number().positive().max(999999.99),
  due_date:          z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  icon:              z.string().max(10).optional(),
  color:             z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const UpdateSinkingFundSchema = CreateSinkingFundSchema.partial().extend({
  is_funded: z.boolean().optional(),
});

export const CreateSinkingContributionSchema = z.object({
  period_id:        z.string().uuid(),
  amount:           z.number().positive().max(999999.99),
  contributed_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type CreateSinkingFund         = z.infer<typeof CreateSinkingFundSchema>;
export type UpdateSinkingFund         = z.infer<typeof UpdateSinkingFundSchema>;
export type CreateSinkingContribution = z.infer<typeof CreateSinkingContributionSchema>;
