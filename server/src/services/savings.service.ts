import sql from '../config/db';

export async function listGoals(uid: string): Promise<unknown[]> {
  return sql`
    SELECT sg.*
    FROM savings_goals sg
    JOIN users u ON u.id = sg.user_id
    WHERE u.firebase_uid = ${uid}
    ORDER BY sg.created_at
  `;
}

export async function createGoal(
  uid: string,
  data: { name: string; target_amount: number; current_amount?: number; target_date?: string; icon?: string; color?: string }
): Promise<unknown> {
  const rows = await sql`
    INSERT INTO savings_goals (user_id, name, target_amount, current_amount, target_date, icon, color)
    SELECT u.id, ${data.name}, ${data.target_amount}, ${data.current_amount ?? 0},
           ${data.target_date ?? null}::date, ${data.icon ?? null}, ${data.color ?? null}
    FROM users u WHERE u.firebase_uid = ${uid}
    RETURNING *
  `;
  return rows[0];
}

export async function updateGoal(
  uid: string,
  id: string,
  data: Partial<{ name: string; target_amount: number; target_date: string; icon: string; color: string; is_completed: boolean }>
): Promise<unknown> {
  const rows = await sql`
    UPDATE savings_goals sg
    SET
      name          = COALESCE(${data.name          ?? null}, sg.name),
      target_amount = COALESCE(${data.target_amount ?? null}, sg.target_amount),
      target_date   = COALESCE(${data.target_date   ?? null}::date, sg.target_date),
      icon          = COALESCE(${data.icon          ?? null}, sg.icon),
      color         = COALESCE(${data.color         ?? null}, sg.color),
      is_completed  = COALESCE(${data.is_completed  ?? null}, sg.is_completed)
    FROM users u
    WHERE u.id = sg.user_id AND u.firebase_uid = ${uid} AND sg.id = ${id}
    RETURNING sg.*
  `;
  return rows[0] ?? null;
}

export async function deleteGoal(uid: string, id: string): Promise<boolean> {
  const rows = await sql`
    DELETE FROM savings_goals sg
    USING users u
    WHERE u.id = sg.user_id AND u.firebase_uid = ${uid} AND sg.id = ${id}
    RETURNING sg.id
  `;
  return rows.length > 0;
}

export async function createContribution(
  uid: string,
  goalId: string,
  data: { period_id: string; amount: number; contributed_date: string }
): Promise<unknown> {
  const userRows = await sql`SELECT id FROM users WHERE firebase_uid = ${uid}`;
  if (!userRows[0]) throw new Error('User not found');
  const userId = userRows[0].id as string;

  const [contribution] = await Promise.all([
    sql`
      INSERT INTO savings_contributions (user_id, period_id, goal_id, amount, contributed_date)
      VALUES (${userId}, ${data.period_id}, ${goalId}, ${data.amount}, ${data.contributed_date}::date)
      RETURNING *
    `,
    sql`
      UPDATE savings_goals
      SET current_amount = current_amount + ${data.amount}
      WHERE id = ${goalId} AND user_id = ${userId}
    `,
  ]);
  return contribution[0];
}
