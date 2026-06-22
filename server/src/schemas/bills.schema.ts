import { z } from 'zod';

const FREQUENCIES = ['weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annual', 'annual'] as const;

export const CreateBillSchema = z.object({
  name:        z.string().min(1).max(100),
  amount:      z.number().positive().max(9999999.99),
  due_day:     z.number().int().min(1).max(28).optional(),
  frequency:   z.enum(FREQUENCIES).default('monthly'),
  category_id: z.string().uuid().optional(),
  icon:        z.string().max(10).optional(),
  notes:       z.string().max(500).optional(),
});

export const UpdateBillSchema = CreateBillSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export type CreateBill = z.infer<typeof CreateBillSchema>;
export type UpdateBill = z.infer<typeof UpdateBillSchema>;
