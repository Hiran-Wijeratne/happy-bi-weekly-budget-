import sql from '../config/db';

export async function submitFeedback(
  uid: string,
  data: { type: string; rating?: number; message: string }
): Promise<unknown> {
  const [row] = await sql`
    INSERT INTO feedback (user_id, type, rating, message)
    SELECT u.id, ${data.type}, ${data.rating ?? null}, ${data.message}
    FROM users u WHERE u.firebase_uid = ${uid}
    RETURNING *
  `;
  return row;
}

export async function submitContact(
  data: { name: string; email: string; type: string; message: string; rating?: number }
): Promise<unknown> {
  const [row] = await sql`
    INSERT INTO feedback (type, rating, message, name, email)
    VALUES (${data.type}, ${data.rating ?? null}, ${data.message}, ${data.name}, ${data.email})
    RETURNING id, type, message, name, email, created_at
  `;
  return row;
}
