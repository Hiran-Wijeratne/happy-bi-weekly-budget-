import sql from '../config/db';
import { seedDefaultCategories } from '../db/seed';

export async function upsertUser(
  uid: string,
  email: string,
  displayName?: string
): Promise<unknown> {
  const rows = await sql`
    INSERT INTO users (firebase_uid, email, display_name)
    VALUES (${uid}, ${email}, ${displayName ?? null})
    ON CONFLICT (firebase_uid) DO UPDATE
      SET email        = EXCLUDED.email,
          display_name = COALESCE(EXCLUDED.display_name, users.display_name)
    RETURNING *
  `;
  const user = rows[0];

  // Seed default categories on first insert (no categories yet)
  const catCount = await sql`
    SELECT COUNT(*) AS cnt FROM expense_categories WHERE user_id = ${user.id}
  `;
  if (Number(catCount[0].cnt) === 0) {
    await seedDefaultCategories(user.id as string);
  }

  return user;
}

export async function getUser(uid: string): Promise<unknown> {
  const rows = await sql`SELECT * FROM users WHERE firebase_uid = ${uid}`;
  return rows[0] ?? null;
}

export async function updateUser(
  uid: string,
  data: { display_name?: string; pay_start_date?: string; onboarding_done?: boolean }
): Promise<unknown> {
  const rows = await sql`
    UPDATE users
    SET
      display_name    = COALESCE(${data.display_name    ?? null}, display_name),
      pay_start_date  = COALESCE(${data.pay_start_date  ?? null}::date, pay_start_date),
      onboarding_done = COALESCE(${data.onboarding_done ?? null}, onboarding_done)
    WHERE firebase_uid = ${uid}
    RETURNING *
  `;
  return rows[0] ?? null;
}
