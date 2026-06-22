import { z } from 'zod';

export const CreateExpenseSchema = z.object({
  period_id:    z.string().uuid(),
  category_id:  z.string().uuid(),
  amount:       z.number().positive().max(999999.99),
  description:  z.string().max(255).optional(),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
});

export const UpdateExpenseSchema = CreateExpenseSchema.omit({ period_id: true }).partial();

export type CreateExpense = z.infer<typeof CreateExpenseSchema>;
export type UpdateExpense = z.infer<typeof UpdateExpenseSchema>;
