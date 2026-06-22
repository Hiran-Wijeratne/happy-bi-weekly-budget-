import sql from '../config/db';

export interface PayPeriodRow {
  period_number:            number;
  year:                     number;
  start_date:               string;
  end_date:                 string;
  is_three_paycheck_month:  boolean;
}

function generatePayPeriods(firstPayDate: Date, year: number): PayPeriodRow[] {
  const periods: Array<{ periodNumber: number; startDate: Date; endDate: Date }> = [];
  const current = new Date(firstPayDate);

  for (let i = 0; i < 26; i++) {
    const start = new Date(current);
    const end   = new Date(current);
    end.setDate(end.getDate() + 13);
    periods.push({ periodNumber: i + 1, startDate: start, endDate: end });
    current.setDate(current.getDate() + 14);
  }

  const monthCounts: Record<number, number> = {};
  periods.forEach(p => {
    const m = p.startDate.getMonth();
    monthCounts[m] = (monthCounts[m] ?? 0) + 1;
  });

  return periods.map(p => ({
    period_number:            p.periodNumber,
    year,
    start_date:               p.startDate.toISOString().split('T')[0],
    end_date:                 p.endDate.toISOString().split('T')[0],
    is_three_paycheck_month:  (monthCounts[p.startDate.getMonth()] ?? 0) >= 3,
  }));
}

export async function getUserId(uid: string): Promise<string> {
  const rows = await sql`SELECT id FROM users WHERE firebase_uid = ${uid}`;
  if (!rows[0]) throw new Error('User not found');
  return rows[0].id as string;
}

export async function generateAndSavePeriods(
  uid: string,
  year: number,
  payStartDate: string
): Promise<unknown[]> {
  const userId = await getUserId(uid);
  const firstDate = new Date(payStartDate);
  const periods = generatePayPeriods(firstDate, year);

  const saved = [];
  for (const p of periods) {
    const result = await sql`
      INSERT INTO paycheck_periods
        (user_id, period_number, year, start_date, end_date, is_three_paycheck_month)
      VALUES
        (${userId}, ${p.period_number}, ${p.year}, ${p.start_date}, ${p.end_date}, ${p.is_three_paycheck_month})
      ON CONFLICT (user_id, year, period_number) DO UPDATE
        SET start_date = EXCLUDED.start_date,
            end_date   = EXCLUDED.end_date,
            is_three_paycheck_month = EXCLUDED.is_three_paycheck_month
      RETURNING *
    `;
    saved.push(result[0]);
  }
  return saved;
}

export async function listPeriods(uid: string, year: number): Promise<unknown[]> {
  return sql`
    SELECT pp.*
    FROM paycheck_periods pp
    JOIN users u ON u.id = pp.user_id
    WHERE u.firebase_uid = ${uid} AND pp.year = ${year}
    ORDER BY pp.period_number
  `;
}

export async function getPeriod(uid: string, id: string): Promise<unknown> {
  const rows = await sql`
    SELECT pp.*
    FROM paycheck_periods pp
    JOIN users u ON u.id = pp.user_id
    WHERE u.firebase_uid = ${uid} AND pp.id = ${id}
  `;
  return rows[0] ?? null;
}

export async function updatePeriod(
  uid: string,
  id: string,
  data: { primary_income?: number; partner_income?: number; notes?: string }
): Promise<unknown> {
  const rows = await sql`
    UPDATE paycheck_periods pp
    SET
      primary_income = COALESCE(${data.primary_income ?? null}, primary_income),
      partner_income = COALESCE(${data.partner_income ?? null}, partner_income),
      notes          = COALESCE(${data.notes ?? null}, notes)
    FROM users u
    WHERE u.id = pp.user_id
      AND u.firebase_uid = ${uid}
      AND pp.id = ${id}
    RETURNING pp.*
  `;
  return rows[0] ?? null;
}
