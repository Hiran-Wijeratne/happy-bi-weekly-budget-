import sql from '../config/db';

export async function listBills(uid: string): Promise<unknown[]> {
  return sql`
    SELECT rb.*, ec.name AS category_name, ec.icon AS category_icon
    FROM recurring_bills rb
    JOIN users u ON u.id = rb.user_id
    LEFT JOIN expense_categories ec ON ec.id = rb.category_id
    WHERE u.firebase_uid = ${uid}
    ORDER BY rb.due_day NULLS LAST, rb.name
  `;
}

export async function createBill(
  uid: string,
  data: { name: string; amount: number; due_day?: number; frequency: string; category_id?: string; icon?: string; notes?: string }
): Promise<unknown> {
  const rows = await sql`
    INSERT INTO recurring_bills (user_id, name, amount, due_day, frequency, category_id, icon, notes)
    SELECT u.id, ${data.name}, ${data.amount}, ${data.due_day ?? null},
           ${data.frequency}, ${data.category_id ?? null}::uuid, ${data.icon ?? '📄'}, ${data.notes ?? null}
    FROM users u WHERE u.firebase_uid = ${uid}
    RETURNING *
  `;
  return rows[0];
}

export async function updateBill(
  uid: string,
  id: string,
  data: { name?: string; amount?: number; due_day?: number; frequency?: string; icon?: string; notes?: string; is_active?: boolean }
): Promise<unknown> {
  const rows = await sql`
    UPDATE recurring_bills rb
    SET
      name      = COALESCE(${data.name      ?? null}, rb.name),
      amount    = COALESCE(${data.amount    ?? null}, rb.amount),
      due_day   = COALESCE(${data.due_day   ?? null}, rb.due_day),
      frequency = COALESCE(${data.frequency ?? null}, rb.frequency),
      icon      = COALESCE(${data.icon      ?? null}, rb.icon),
      notes     = COALESCE(${data.notes     ?? null}, rb.notes),
      is_active = COALESCE(${data.is_active ?? null}, rb.is_active)
    FROM users u
    WHERE u.id = rb.user_id AND u.firebase_uid = ${uid} AND rb.id = ${id}
    RETURNING rb.*
  `;
  return rows[0] ?? null;
}

export async function deleteBill(uid: string, id: string): Promise<boolean> {
  const rows = await sql`
    DELETE FROM recurring_bills rb
    USING users u
    WHERE u.id = rb.user_id AND u.firebase_uid = ${uid} AND rb.id = ${id}
    RETURNING rb.id
  `;
  return rows.length > 0;
}
