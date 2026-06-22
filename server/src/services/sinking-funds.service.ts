import sql from '../config/db';

export async function listFunds(uid: string): Promise<unknown[]> {
  return sql`
    SELECT sf.*
    FROM sinking_funds sf
    JOIN users u ON u.id = sf.user_id
    WHERE u.firebase_uid = ${uid}
    ORDER BY sf.created_at
  `;
}

export async function createFund(
  uid: string,
  data: { name: string; target_amount: number; per_period_amount: number; due_date?: string; icon?: string; color?: string }
): Promise<unknown> {
  const rows = await sql`
    INSERT INTO sinking_funds (user_id, name, target_amount, per_period_amount, due_date, icon, color)
    SELECT u.id, ${data.name}, ${data.target_amount}, ${data.per_period_amount},
           ${data.due_date ?? null}::date, ${data.icon ?? '🏦'}, ${data.color ?? null}
    FROM users u WHERE u.firebase_uid = ${uid}
    RETURNING *
  `;
  return rows[0];
}

export async function deleteFund(uid: string, id: string): Promise<boolean> {
  const rows = await sql`
    DELETE FROM sinking_funds sf
    USING users u
    WHERE u.id = sf.user_id AND u.firebase_uid = ${uid} AND sf.id = ${id}
    RETURNING sf.id
  `;
  return rows.length > 0;
}

export async function createContribution(
  uid: string,
  fundId: string,
  data: { period_id: string; amount: number; contributed_date: string }
): Promise<unknown> {
  const userRows = await sql`SELECT id FROM users WHERE firebase_uid = ${uid}`;
  if (!userRows[0]) throw new Error('User not found');
  const userId = userRows[0].id as string;

  const [contribution] = await Promise.all([
    sql`
      INSERT INTO sinking_fund_contributions (user_id, sinking_fund_id, period_id, amount, contributed_date)
      VALUES (${userId}, ${fundId}, ${data.period_id}, ${data.amount}, ${data.contributed_date}::date)
      RETURNING *
    `,
    sql`
      UPDATE sinking_funds
      SET current_balance = current_balance + ${data.amount},
          is_funded = (current_balance + ${data.amount} >= target_amount)
      WHERE id = ${fundId} AND user_id = ${userId}
    `,
  ]);
  return contribution[0];
}
