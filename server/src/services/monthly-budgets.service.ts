import sql from '../config/db';

export async function getMonthlySummary(uid: string, year: number, month: number) {
  const [incomeRow] = await sql`
    SELECT COALESCE(SUM(pp.primary_income + pp.partner_income), 0) AS total
    FROM paycheck_periods pp
    JOIN users u ON u.id = pp.user_id
    WHERE u.firebase_uid = ${uid}
      AND EXTRACT(YEAR  FROM pp.start_date) = ${year}
      AND EXTRACT(MONTH FROM pp.start_date) = ${month}
  ` as Array<{ total: string }>;

  const categories = await sql`
    SELECT
      ec.id              AS category_id,
      ec.name            AS category_name,
      ec.icon,
      ec.color,
      ec.sort_order,
      COALESCE(mb.planned, 0)       AS planned,
      COALESCE(SUM(e.amount), 0)    AS actual
    FROM expense_categories ec
    JOIN users u ON u.id = ec.user_id AND u.firebase_uid = ${uid}
    LEFT JOIN monthly_budgets mb
      ON mb.category_id = ec.id
      AND mb.user_id = u.id
      AND mb.year = ${year}
      AND mb.month = ${month}
    LEFT JOIN expenses e
      ON e.category_id = ec.id
      AND e.user_id = u.id
      AND EXTRACT(YEAR  FROM e.expense_date) = ${year}
      AND EXTRACT(MONTH FROM e.expense_date) = ${month}
    GROUP BY ec.id, ec.name, ec.icon, ec.color, ec.sort_order, mb.planned
    ORDER BY ec.sort_order, ec.name
  `;

  // Biweekly allocations for periods starting in this month (for auto-fill hint)
  const biweeklyHints = await sql`
    SELECT ba.category_id, SUM(ba.planned) AS biweekly_total
    FROM budget_allocations ba
    JOIN paycheck_periods pp ON pp.id = ba.period_id
    JOIN users u ON u.id = pp.user_id AND u.firebase_uid = ${uid}
    WHERE EXTRACT(YEAR  FROM pp.start_date) = ${year}
      AND EXTRACT(MONTH FROM pp.start_date) = ${month}
    GROUP BY ba.category_id
  ` as Array<{ category_id: string; biweekly_total: string }>;

  const biweeklyMap = Object.fromEntries(biweeklyHints.map(r => [r.category_id, Number(r.biweekly_total)]));

  return {
    year,
    month,
    income: Number(incomeRow.total),
    categories: categories.map((c: any) => ({
      ...c,
      planned:          Number(c.planned),
      actual:           Number(c.actual),
      biweekly_total:   biweeklyMap[c.category_id] ?? 0,
    })),
  };
}

export async function bulkUpsertMonthly(
  uid: string,
  year: number,
  month: number,
  allocations: Array<{ category_id: string; planned: number }>
) {
  const rows = await sql`SELECT id FROM users WHERE firebase_uid = ${uid}`;
  if (!rows[0]) throw new Error('User not found');
  const userId = rows[0].id as string;

  const saved = [];
  for (const alloc of allocations) {
    const result = await sql`
      INSERT INTO monthly_budgets (user_id, year, month, category_id, planned)
      VALUES (${userId}, ${year}, ${month}, ${alloc.category_id}, ${alloc.planned})
      ON CONFLICT (user_id, year, month, category_id) DO UPDATE
        SET planned = EXCLUDED.planned
      RETURNING *
    `;
    saved.push(result[0]);
  }
  return saved;
}

export async function copyFromPreviousMonth(uid: string, year: number, month: number) {
  const rows = await sql`SELECT id FROM users WHERE firebase_uid = ${uid}`;
  if (!rows[0]) throw new Error('User not found');
  const userId = rows[0].id as string;

  const prevYear  = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;

  const prevAllocations = await sql`
    SELECT category_id, planned
    FROM monthly_budgets
    WHERE user_id = ${userId} AND year = ${prevYear} AND month = ${prevMonth}
  ` as Array<{ category_id: string; planned: string }>;

  if (prevAllocations.length === 0) return [];

  const saved = [];
  for (const alloc of prevAllocations) {
    const result = await sql`
      INSERT INTO monthly_budgets (user_id, year, month, category_id, planned)
      VALUES (${userId}, ${year}, ${month}, ${alloc.category_id}, ${alloc.planned})
      ON CONFLICT (user_id, year, month, category_id) DO UPDATE
        SET planned = EXCLUDED.planned
      RETURNING *
    `;
    saved.push(result[0]);
  }
  return saved;
}
