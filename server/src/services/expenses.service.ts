import sql from '../config/db';

export async function listExpenses(uid: string, periodId: string): Promise<unknown[]> {
  return sql`
    SELECT e.*, ec.name AS category_name, ec.icon, ec.color
    FROM expenses e
    JOIN expense_categories ec ON ec.id = e.category_id
    JOIN users u ON u.id = e.user_id
    WHERE u.firebase_uid = ${uid} AND e.period_id = ${periodId}
    ORDER BY e.expense_date DESC, e.created_at DESC
  `;
}

export async function listExpensesByYear(uid: string, year: number): Promise<unknown[]> {
  return sql`
    SELECT e.*, ec.name AS category_name, ec.icon, ec.color,
           pp.period_number, pp.start_date AS period_start
    FROM expenses e
    JOIN expense_categories ec ON ec.id = e.category_id
    JOIN paycheck_periods pp ON pp.id = e.period_id
    JOIN users u ON u.id = e.user_id
    WHERE u.firebase_uid = ${uid} AND pp.year = ${year}
    ORDER BY e.expense_date DESC, e.created_at DESC
  `;
}

export async function createExpense(
  uid: string,
  data: { period_id: string; category_id: string; amount: number; description?: string; expense_date: string }
): Promise<unknown> {
  const rows = await sql`
    INSERT INTO expenses (user_id, period_id, category_id, amount, description, expense_date)
    SELECT u.id, ${data.period_id}, ${data.category_id}, ${data.amount}, ${data.description ?? null}, ${data.expense_date}::date
    FROM users u
    WHERE u.firebase_uid = ${uid}
    RETURNING *
  `;
  return rows[0];
}

export async function updateExpense(
  uid: string,
  id: string,
  data: { category_id?: string; amount?: number; description?: string; expense_date?: string }
): Promise<unknown> {
  const rows = await sql`
    UPDATE expenses e
    SET
      category_id  = COALESCE(${data.category_id  ?? null}::uuid, e.category_id),
      amount       = COALESCE(${data.amount       ?? null}, e.amount),
      description  = COALESCE(${data.description  ?? null}, e.description),
      expense_date = COALESCE(${data.expense_date ?? null}::date, e.expense_date)
    FROM users u
    WHERE u.id = e.user_id
      AND u.firebase_uid = ${uid}
      AND e.id = ${id}
    RETURNING e.*
  `;
  return rows[0] ?? null;
}

export async function deleteExpense(uid: string, id: string): Promise<boolean> {
  const rows = await sql`
    DELETE FROM expenses e
    USING users u
    WHERE u.id = e.user_id
      AND u.firebase_uid = ${uid}
      AND e.id = ${id}
    RETURNING e.id
  `;
  return rows.length > 0;
}
