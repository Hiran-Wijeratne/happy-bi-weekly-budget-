import { z } from 'zod';

export const GeneratePeriodsSchema = z.object({
  year:           z.number().int().min(2020).max(2050),
  pay_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
});

export const UpdatePeriodSchema = z.object({
  primary_income: z.number().nonnegative().max(999999.99).optional(),
  partner_income: z.number().nonnegative().max(999999.99).optional(),
  notes:          z.string().max(500).optional(),
});

export type GeneratePeriods = z.infer<typeof GeneratePeriodsSchema>;
export type UpdatePeriod    = z.infer<typeof UpdatePeriodSchema>;
