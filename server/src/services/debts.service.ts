import sql from '../config/db';

export async function listDebts(uid: string): Promise<unknown[]> {
  return sql`
    SELECT da.*
    FROM debt_accounts da
    JOIN users u ON u.id = da.user_id
    WHERE u.firebase_uid = ${uid}
    ORDER BY da.created_at
  `;
}

export async function createDebt(
  uid: string,
  data: {
    name: string; account_type: string; original_balance?: number;
    current_balance: number; interest_rate?: number; minimum_payment?: number;
  }
): Promise<unknown> {
  const rows = await sql`
    INSERT INTO debt_accounts (user_id, name, account_type, original_balance, current_balance, interest_rate, minimum_payment)
    SELECT u.id, ${data.name}, ${data.account_type}, ${data.original_balance ?? null},
           ${data.current_balance}, ${data.interest_rate ?? null}, ${data.minimum_payment ?? null}
    FROM users u WHERE u.firebase_uid = ${uid}
    RETURNING *
  `;
  return rows[0];
}

export async function updateDebt(
  uid: string,
  id: string,
  data: Partial<{ name: string; account_type: string; current_balance: number; interest_rate: number; minimum_payment: number; is_paid_off: boolean }>
): Promise<unknown> {
  const rows = await sql`
    UPDATE debt_accounts da
    SET
      name            = COALESCE(${data.name            ?? null}, da.name),
      account_type    = COALESCE(${data.account_type    ?? null}, da.account_type),
      current_balance = COALESCE(${data.current_balance ?? null}, da.current_balance),
      interest_rate   = COALESCE(${data.interest_rate   ?? null}, da.interest_rate),
      minimum_payment = COALESCE(${data.minimum_payment ?? null}, da.minimum_payment),
      is_paid_off     = COALESCE(${data.is_paid_off     ?? null}, da.is_paid_off)
    FROM users u
    WHERE u.id = da.user_id AND u.firebase_uid = ${uid} AND da.id = ${id}
    RETURNING da.*
  `;
  return rows[0] ?? null;
}

export async function deleteDebt(uid: string, id: string): Promise<boolean> {
  const rows = await sql`
    DELETE FROM debt_accounts da
    USING users u
    WHERE u.id = da.user_id AND u.firebase_uid = ${uid} AND da.id = ${id}
    RETURNING da.id
  `;
  return rows.length > 0;
}

export async function listPayments(uid: string, debtId: string): Promise<unknown[]> {
  return sql`
    SELECT dp.*
    FROM debt_payments dp
    JOIN users u ON u.id = dp.user_id
    WHERE u.firebase_uid = ${uid} AND dp.debt_id = ${debtId}
    ORDER BY dp.payment_date DESC
  `;
}

export async function createPayment(
  uid: string,
  debtId: string,
  data: { period_id: string; amount: number; payment_date: string }
): Promise<unknown> {
  const userRows = await sql`SELECT id FROM users WHERE firebase_uid = ${uid}`;
  if (!userRows[0]) throw new Error('User not found');
  const userId = userRows[0].id as string;

  const [payment] = await Promise.all([
    sql`
      INSERT INTO debt_payments (user_id, period_id, debt_id, amount, payment_date)
      VALUES (${userId}, ${data.period_id}, ${debtId}, ${data.amount}, ${data.payment_date}::date)
      RETURNING *
    `,
    sql`
      UPDATE debt_accounts
      SET current_balance = GREATEST(0, current_balance - ${data.amount})
      WHERE id = ${debtId} AND user_id = ${userId}
    `,
  ]);
  return payment[0];
}
