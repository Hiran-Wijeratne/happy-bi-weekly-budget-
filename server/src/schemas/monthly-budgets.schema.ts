import { z } from 'zod';

export const MonthlyAllocationItemSchema = z.object({
  category_id: z.string().uuid(),
  planned:     z.number().nonnegative().max(999999.99),
});

export const BulkUpsertMonthlySchema = z.object({
  allocations: z.array(MonthlyAllocationItemSchema).min(1).max(50),
});

export type MonthlyAllocationItem  = z.infer<typeof MonthlyAllocationItemSchema>;
export type BulkUpsertMonthly      = z.infer<typeof BulkUpsertMonthlySchema>;
