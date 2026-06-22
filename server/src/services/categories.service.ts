import sql from '../config/db';

export async function listCategories(uid: string): Promise<unknown[]> {
  return sql`
    SELECT ec.*
    FROM expense_categories ec
    JOIN users u ON u.id = ec.user_id
    WHERE u.firebase_uid = ${uid}
    ORDER BY ec.sort_order, ec.name
  `;
}

export async function createCategory(
  uid: string,
  data: { name: string; icon?: string; color?: string; sort_order?: number }
): Promise<unknown> {
  const rows = await sql`
    INSERT INTO expense_categories (user_id, name, icon, color, sort_order)
    SELECT u.id, ${data.name}, ${data.icon ?? null}, ${data.color ?? null}, ${data.sort_order ?? 99}
    FROM users u
    WHERE u.firebase_uid = ${uid}
    RETURNING *
  `;
  return rows[0];
}

export async function updateCategory(
  uid: string,
  id: string,
  data: { name?: string; icon?: string; color?: string; sort_order?: number; rollover_enabled?: boolean }
): Promise<unknown> {
  const rows = await sql`
    UPDATE expense_categories ec
    SET
      name             = COALESCE(${data.name             ?? null}, ec.name),
      icon             = COALESCE(${data.icon             ?? null}, ec.icon),
      color            = COALESCE(${data.color            ?? null}, ec.color),
      sort_order       = COALESCE(${data.sort_order       ?? null}, ec.sort_order),
      rollover_enabled = COALESCE(${data.rollover_enabled ?? null}, ec.rollover_enabled)
    FROM users u
    WHERE u.id = ec.user_id
      AND u.firebase_uid = ${uid}
      AND ec.id = ${id}
    RETURNING ec.*
  `;
  return rows[0] ?? null;
}

export async function deleteCategory(uid: string, id: string): Promise<boolean> {
  const rows = await sql`
    DELETE FROM expense_categories ec
    USING users u
    WHERE u.id = ec.user_id
      AND u.firebase_uid = ${uid}
      AND ec.id = ${id}
      AND ec.is_default = false
    RETURNING ec.id
  `;
  return rows.length > 0;
}
