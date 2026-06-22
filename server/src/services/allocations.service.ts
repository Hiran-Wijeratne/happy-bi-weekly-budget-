import sql from '../config/db';

export async function getAllocations(uid: string, periodId: string): Promise<unknown[]> {
  return sql`
    SELECT ba.*, ec.name AS category_name, ec.icon, ec.color, ec.rollover_enabled
    FROM budget_allocations ba
    JOIN expense_categories ec ON ec.id = ba.category_id
    JOIN paycheck_periods pp ON pp.id = ba.period_id
    JOIN users u ON u.id = ba.user_id
    WHERE u.firebase_uid = ${uid} AND ba.period_id = ${periodId}
    ORDER BY ec.sort_order
  `;
}

export async function applyRollover(uid: string, periodId: string): Promise<unknown[]> {
  const userRows = await sql`SELECT id FROM users WHERE firebase_uid = ${uid}`;
  if (!userRows[0]) throw new Error('User not found');
  const userId = userRows[0].id as string;

  const [currentPeriod] = await sql`
    SELECT id, start_date FROM paycheck_periods WHERE id = ${periodId} AND user_id = ${userId}
  ` as Array<{ id: string; start_date: string }>;
  if (!currentPeriod) throw new Error('Period not found');

  const prevPeriods = await sql`
    SELECT id FROM paycheck_periods
    WHERE user_id = ${userId} AND end_date < ${currentPeriod.start_date}
    ORDER BY end_date DESC LIMIT 1
  ` as Array<{ id: string }>;
  if (prevPeriods.length === 0) return [];

  const prevPeriodId = prevPeriods[0].id;

  const categories = await sql`
    SELECT id FROM expense_categories WHERE user_id = ${userId} AND rollover_enabled = true
  ` as Array<{ id: string }>;
  if (categories.length === 0) return [];

  const results: unknown[] = [];
  for (const cat of categories) {
    const [prevAlloc] = await sql`
      SELECT planned FROM budget_allocations WHERE period_id = ${prevPeriodId} AND category_id = ${cat.id}
    ` as Array<{ planned: string }>;
    const prevPlanned = prevAlloc ? Number(prevAlloc.planned) : 0;

    const [spentRow] = await sql`
      SELECT COALESCE(SUM(amount), 0) AS total FROM expenses
      WHERE period_id = ${prevPeriodId} AND category_id = ${cat.id} AND user_id = ${userId}
    ` as Array<{ total: string }>;
    const surplus = Math.max(0, prevPlanned - Number(spentRow.total));
    if (surplus === 0) continue;

    const updated = await sql`
      INSERT INTO budget_allocations (user_id, period_id, category_id, planned, rolled_over_amount)
      VALUES (${userId}, ${periodId}, ${cat.id}, ${surplus}, ${surplus})
      ON CONFLICT (period_id, category_id) DO UPDATE
        SET rolled_over_amount = ${surplus},
            planned = budget_allocations.planned
                    - budget_allocations.rolled_over_amount
                    + ${surplus}
      RETURNING *
    `;
    results.push(updated[0]);
  }
  return results;
}

export async function bulkUpsertAllocations(
  uid: string,
  periodId: string,
  allocations: Array<{ category_id: string; planned: number }>
): Promise<unknown[]> {
  const rows = await sql`SELECT id FROM users WHERE firebase_uid = ${uid}`;
  if (!rows[0]) throw new Error('User not found');
  const userId = rows[0].id as string;

  const saved = [];
  for (const alloc of allocations) {
    const result = await sql`
      INSERT INTO budget_allocations (user_id, period_id, category_id, planned)
      VALUES (${userId}, ${periodId}, ${alloc.category_id}, ${alloc.planned})
      ON CONFLICT (period_id, category_id) DO UPDATE
        SET planned = EXCLUDED.planned
      RETURNING *
    `;
    saved.push(result[0]);
  }
  return saved;
}
