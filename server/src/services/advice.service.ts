import sql from '../config/db';

export async function getAdviceForIncome(monthlyIncome: number): Promise<unknown | null> {
  const rows = await sql`
    SELECT *
    FROM financial_advice
    WHERE min_monthly <= ${monthlyIncome}
      AND (max_monthly IS NULL OR max_monthly > ${monthlyIncome})
    ORDER BY min_monthly DESC
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getAllAdvice(): Promise<unknown[]> {
  return sql`SELECT * FROM financial_advice ORDER BY sort_order`;
}
