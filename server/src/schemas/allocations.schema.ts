import { z } from 'zod';

export const AllocationItemSchema = z.object({
  category_id: z.string().uuid(),
  planned:     z.number().nonnegative().max(999999.99),
});

export const BulkUpsertAllocationsSchema = z.object({
  allocations: z.array(AllocationItemSchema).min(1).max(50),
});

export type AllocationItem         = z.infer<typeof AllocationItemSchema>;
export type BulkUpsertAllocations  = z.infer<typeof BulkUpsertAllocationsSchema>;
