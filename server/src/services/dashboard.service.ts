import sql from '../config/db';

export async function getDashboardData(uid: string, year: number) {
  const [periods, spendingByCategory, debtSummary, savingsSummary, dailySpending] = await Promise.all([
    // All periods with income and totals
    sql`
      SELECT
        pp.id, pp.period_number,
        pp.start_date::text AS start_date, pp.end_date::text AS end_date,
        pp.primary_income, pp.partner_income, pp.is_three_paycheck_month,
        COALESCE(SUM(e.amount), 0) AS total_spent,
        COALESCE(SUM(ba.planned), 0) AS total_budgeted
      FROM paycheck_periods pp
      JOIN users u ON u.id = pp.user_id
      LEFT JOIN expenses e ON e.period_id = pp.id
      LEFT JOIN budget_allocations ba ON ba.period_id = pp.id
      WHERE u.firebase_uid = ${uid} AND pp.year = ${year}
      GROUP BY pp.id
      ORDER BY pp.period_number
    `,
    // Spending by category for the year
    sql`
      SELECT
        ec.id, ec.name, ec.icon, ec.color,
        COALESCE(SUM(e.amount), 0)  AS total_spent,
        COALESCE(SUM(ba.planned), 0) AS total_budgeted
      FROM expense_categories ec
      JOIN users u ON u.id = ec.user_id
      LEFT JOIN expenses e ON e.category_id = ec.id
        AND e.expense_date BETWEEN ${year + '-01-01'} AND ${year + '-12-31'}
      LEFT JOIN budget_allocations ba ON ba.category_id = ec.id
        AND ba.period_id IN (
          SELECT id FROM paycheck_periods WHERE user_id = u.id AND year = ${year}
        )
      WHERE u.firebase_uid = ${uid}
      GROUP BY ec.id
      ORDER BY total_spent DESC
    `,
    // Debt summary
    sql`
      SELECT da.id, da.name, da.account_type, da.original_balance, da.current_balance, da.interest_rate, da.is_paid_off,
        COALESCE((
          SELECT SUM(dp.amount)
          FROM debt_payments dp
          WHERE dp.debt_id = da.id
        ), 0) AS total_paid
      FROM debt_accounts da
      JOIN users u ON u.id = da.user_id
      WHERE u.firebase_uid = ${uid}
      ORDER BY da.current_balance DESC
    `,
    // Savings summary
    sql`
      SELECT sg.id, sg.name, sg.target_amount, sg.current_amount, sg.target_date, sg.icon, sg.color, sg.is_completed
      FROM savings_goals sg
      JOIN users u ON u.id = sg.user_id
      WHERE u.firebase_uid = ${uid}
      ORDER BY sg.created_at
    `,
    // Daily spending for the year
    sql`
      SELECT
        e.expense_date::text AS date,
        SUM(e.amount)        AS total
      FROM expenses e
      JOIN paycheck_periods pp ON pp.id = e.period_id
      JOIN users u ON u.id = pp.user_id
      WHERE u.firebase_uid = ${uid}
        AND EXTRACT(YEAR FROM e.expense_date) = ${year}
      GROUP BY e.expense_date
      ORDER BY e.expense_date
    `,
  ]);

  const totalIncome = (periods as Array<{ primary_income: string; partner_income: string }>)
    .reduce((sum, p) => sum + Number(p.primary_income ?? 0) + Number(p.partner_income ?? 0), 0);
  const totalSpent = (periods as Array<{ total_spent: string }>)
    .reduce((sum, p) => sum + Number(p.total_spent), 0);

  return {
    year,
    summary: { total_income: totalIncome, total_spent: totalSpent, net: totalIncome - totalSpent },
    periods,
    spending_by_category: spendingByCategory,
    debts:   debtSummary,
    savings: savingsSummary,
    daily_spending: (dailySpending as Array<{ date: string; total: string }>)
      .map(r => ({ date: r.date, total: Number(r.total) })),
  };
}
