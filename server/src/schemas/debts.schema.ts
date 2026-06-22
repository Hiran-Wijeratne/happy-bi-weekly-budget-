import { z } from 'zod';

const ACCOUNT_TYPES = ['credit_card', 'student_loan', 'auto_loan', 'mortgage', 'personal_loan', 'medical', 'other'] as const;

export const CreateDebtSchema = z.object({
  name:             z.string().min(1).max(100),
  account_type:     z.enum(ACCOUNT_TYPES).default('credit_card'),
  original_balance: z.number().nonnegative().max(9999999.99).optional(),
  current_balance:  z.number().nonnegative().max(9999999.99),
  interest_rate:    z.number().nonnegative().max(1).optional(),
  minimum_payment:  z.number().nonnegative().max(99999.99).optional(),
});

export const UpdateDebtSchema = CreateDebtSchema.partial().extend({
  is_paid_off: z.boolean().optional(),
});

export const CreatePaymentSchema = z.object({
  period_id:    z.string().uuid(),
  amount:       z.number().positive().max(999999.99),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
});

export type CreateDebt    = z.infer<typeof CreateDebtSchema>;
export type UpdateDebt    = z.infer<typeof UpdateDebtSchema>;
export type CreatePayment = z.infer<typeof CreatePaymentSchema>;
