import sql from '../config/db';

export const DEFAULT_CATEGORIES = [
  { name: 'Housing',       icon: '🏠', color: '#6366f1', sort_order: 1 },
  { name: 'Transportation',icon: '🚗', color: '#f59e0b', sort_order: 2 },
  { name: 'Groceries',     icon: '🛒', color: '#10b981', sort_order: 3 },
  { name: 'Utilities',     icon: '💡', color: '#3b82f6', sort_order: 4 },
  { name: 'Healthcare',    icon: '🏥', color: '#ef4444', sort_order: 5 },
  { name: 'Insurance',     icon: '🛡️', color: '#8b5cf6', sort_order: 6 },
  { name: 'Dining Out',    icon: '🍽️', color: '#f97316', sort_order: 7 },
  { name: 'Entertainment', icon: '🎬', color: '#ec4899', sort_order: 8 },
  { name: 'Personal Care', icon: '💆', color: '#14b8a6', sort_order: 9 },
  { name: 'Clothing',      icon: '👕', color: '#a855f7', sort_order: 10 },
  { name: 'Subscriptions', icon: '📱', color: '#06b6d4', sort_order: 11 },
  { name: 'Miscellaneous', icon: '📦', color: '#84cc16', sort_order: 12 },
];

export async function seedDefaultCategories(userId: string) {
  for (const cat of DEFAULT_CATEGORIES) {
    await sql`
      INSERT INTO expense_categories (user_id, name, icon, color, is_default, sort_order)
      VALUES (${userId}, ${cat.name}, ${cat.icon}, ${cat.color}, true, ${cat.sort_order})
      ON CONFLICT (user_id, name) DO NOTHING
    `;
  }
}
