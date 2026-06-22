/**
 * Seed the database with realistic demo data for a given user email.
 * Usage: npm run seed:demo -- your@email.com
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import sql from '../src/config/db';
import { seedDefaultCategories } from '../src/db/seed';

const email = process.argv[2];
if (!email) { console.error('Usage: npm run seed:demo -- your@email.com'); process.exit(1); }

async function run() {
  const [user] = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
  if (!user) throw new Error(`No user found with email "${email}". Sign up first, then run this script.`);

  const uid: string = user.id;
  console.log(`Seeding demo data for user: ${user.display_name} (${uid})`);

  // ── Categories ──────────────────────────────────────────────────────────────
  await seedDefaultCategories(uid);
  const cats = await sql`SELECT id, name FROM expense_categories WHERE user_id = ${uid}`;
  const cat: Record<string, string> = {};
  (cats as { id: string; name: string }[]).forEach(c => { cat[c.name] = c.id; });

  // ── Bills ───────────────────────────────────────────────────────────────────
  await sql`DELETE FROM recurring_bills WHERE user_id = ${uid}`;
  const bills = [
    { name: 'Rent',          amount: 1250.00, due_day: 1,  icon: '🏠', is_active: true  },
    { name: 'Electricity',   amount: 94.50,   due_day: 15, icon: '💡', is_active: true  },
    { name: 'Internet',      amount: 65.00,   due_day: 5,  icon: '📶', is_active: true  },
    { name: 'Car Insurance', amount: 128.00,  due_day: 1,  icon: '🚗', is_active: true  },
    { name: 'Netflix',       amount: 15.49,   due_day: 10, icon: '📺', is_active: true  },
    { name: 'Spotify',       amount: 9.99,    due_day: 22, icon: '🎵', is_active: true  },
    { name: 'Gym',           amount: 45.00,   due_day: 1,  icon: '💪', is_active: false },
  ];
  for (const b of bills) {
    await sql`
      INSERT INTO recurring_bills (user_id, name, amount, due_day, icon, is_active, category_id)
      VALUES (${uid}, ${b.name}, ${b.amount}, ${b.due_day}, ${b.icon}, ${b.is_active}, ${cat['Housing'] ?? null})
    `;
  }
  console.log('✓ Bills');

  // ── Savings Goals ───────────────────────────────────────────────────────────
  await sql`DELETE FROM savings_goals WHERE user_id = ${uid}`;
  const goals = [
    { name: 'Emergency Fund', target_amount: 10000, current_amount: 3500,  icon: '🛡️', color: '#ef4444', target_date: '2027-01-01' },
    { name: 'Hawaii Trip',    target_amount: 2500,  current_amount: 900,   icon: '🌺', color: '#f59e0b', target_date: '2026-12-15' },
    { name: 'New Laptop',     target_amount: 1500,  current_amount: 620,   icon: '💻', color: '#6366f1', target_date: '2026-09-01' },
  ];
  for (const g of goals) {
    await sql`
      INSERT INTO savings_goals (user_id, name, target_amount, current_amount, icon, color, target_date)
      VALUES (${uid}, ${g.name}, ${g.target_amount}, ${g.current_amount}, ${g.icon}, ${g.color}, ${g.target_date})
    `;
  }
  console.log('✓ Savings goals');

  // ── Sinking Funds ───────────────────────────────────────────────────────────
  await sql`DELETE FROM sinking_funds WHERE user_id = ${uid}`;
  const funds = [
    { name: 'Christmas Gifts', target_amount: 800,  per_period_amount: 50,  current_balance: 250,  icon: '🎄', color: '#ef4444', due_date: '2026-12-20' },
    { name: 'Car Repairs',     target_amount: 1200, per_period_amount: 75,  current_balance: 450,  icon: '🔧', color: '#f59e0b', due_date: null },
    { name: 'New Tires',       target_amount: 600,  per_period_amount: 50,  current_balance: 200,  icon: '🛞', color: '#10b981', due_date: '2026-10-01' },
  ];
  for (const f of funds) {
    await sql`
      INSERT INTO sinking_funds (user_id, name, target_amount, per_period_amount, current_balance, icon, color, due_date)
      VALUES (${uid}, ${f.name}, ${f.target_amount}, ${f.per_period_amount}, ${f.current_balance}, ${f.icon}, ${f.color}, ${f.due_date})
    `;
  }
  console.log('✓ Sinking funds');

  // ── Debt Accounts ───────────────────────────────────────────────────────────
  await sql`DELETE FROM debt_accounts WHERE user_id = ${uid}`;
  const debts = [
    { name: 'Chase Sapphire',  account_type: 'credit_card', original_balance: 4200,  current_balance: 3180,  interest_rate: 0.1999, minimum_payment: 85  },
    { name: 'Student Loan',    account_type: 'student_loan', original_balance: 28000, current_balance: 11400, interest_rate: 0.055,  minimum_payment: 210 },
    { name: 'Car Loan',        account_type: 'auto_loan',   original_balance: 18000, current_balance: 7250,  interest_rate: 0.0689, minimum_payment: 340 },
  ];
  for (const d of debts) {
    await sql`
      INSERT INTO debt_accounts (user_id, name, account_type, original_balance, current_balance, interest_rate, minimum_payment)
      VALUES (${uid}, ${d.name}, ${d.account_type}, ${d.original_balance}, ${d.current_balance}, ${d.interest_rate}, ${d.minimum_payment})
    `;
  }
  console.log('✓ Debts');

  // ── Paycheck Periods ────────────────────────────────────────────────────────
  await sql`DELETE FROM paycheck_periods WHERE user_id = ${uid}`;
  const periods = [
    { period_number: 9,  year: 2026, start_date: '2026-05-04', end_date: '2026-05-17', primary_income: 2400, partner_income: 800 },
    { period_number: 10, year: 2026, start_date: '2026-05-18', end_date: '2026-05-31', primary_income: 2400, partner_income: 800 },
    { period_number: 11, year: 2026, start_date: '2026-06-01', end_date: '2026-06-14', primary_income: 2400, partner_income: 800 },
    { period_number: 12, year: 2026, start_date: '2026-06-15', end_date: '2026-06-28', primary_income: 2400, partner_income: 0   },
  ];
  const periodIds: string[] = [];
  for (const p of periods) {
    const [row] = await sql`
      INSERT INTO paycheck_periods (user_id, period_number, year, start_date, end_date, primary_income, partner_income)
      VALUES (${uid}, ${p.period_number}, ${p.year}, ${p.start_date}, ${p.end_date}, ${p.primary_income}, ${p.partner_income})
      RETURNING id
    `;
    periodIds.push((row as { id: string }).id);
  }
  console.log('✓ Periods');

  // ── Budget Allocations ──────────────────────────────────────────────────────
  const allocationTemplates = [
    { cat: 'Housing',        planned: 625  },
    { cat: 'Transportation', planned: 200  },
    { cat: 'Groceries',      planned: 280  },
    { cat: 'Utilities',      planned: 120  },
    { cat: 'Dining Out',     planned: 150  },
    { cat: 'Entertainment',  planned: 80   },
    { cat: 'Personal Care',  planned: 60   },
    { cat: 'Subscriptions',  planned: 45   },
    { cat: 'Miscellaneous',  planned: 100  },
  ];
  for (const pid of periodIds) {
    for (const a of allocationTemplates) {
      if (!cat[a.cat]) continue;
      await sql`
        INSERT INTO budget_allocations (user_id, period_id, category_id, planned)
        VALUES (${uid}, ${pid}, ${cat[a.cat]}, ${a.planned})
        ON CONFLICT (period_id, category_id) DO UPDATE SET planned = ${a.planned}
      `;
    }
  }
  console.log('✓ Budget allocations');

  // ── Expenses ────────────────────────────────────────────────────────────────
  await sql`DELETE FROM expenses WHERE user_id = ${uid}`;
  const expenseData = [
    // Period 9 (May 4–17)
    { pid: periodIds[0], cat: 'Groceries',      amount: 87.34,  date: '2026-05-05', desc: 'Whole Foods' },
    { pid: periodIds[0], cat: 'Dining Out',     amount: 42.50,  date: '2026-05-07', desc: 'Thai Garden' },
    { pid: periodIds[0], cat: 'Transportation', amount: 55.00,  date: '2026-05-08', desc: 'Gas' },
    { pid: periodIds[0], cat: 'Groceries',      amount: 63.20,  date: '2026-05-12', desc: 'Trader Joes' },
    { pid: periodIds[0], cat: 'Entertainment',  amount: 28.00,  date: '2026-05-14', desc: 'Movie tickets' },
    { pid: periodIds[0], cat: 'Personal Care',  amount: 35.99,  date: '2026-05-10', desc: 'Haircut' },
    { pid: periodIds[0], cat: 'Miscellaneous',  amount: 22.50,  date: '2026-05-11', desc: 'Amazon' },

    // Period 10 (May 18–31)
    { pid: periodIds[1], cat: 'Groceries',      amount: 94.15,  date: '2026-05-19', desc: 'Whole Foods' },
    { pid: periodIds[1], cat: 'Dining Out',     amount: 68.00,  date: '2026-05-21', desc: 'Date night' },
    { pid: periodIds[1], cat: 'Transportation', amount: 52.00,  date: '2026-05-22', desc: 'Gas' },
    { pid: periodIds[1], cat: 'Utilities',      amount: 94.50,  date: '2026-05-23', desc: 'Electric bill' },
    { pid: periodIds[1], cat: 'Groceries',      amount: 71.80,  date: '2026-05-27', desc: 'Costco' },
    { pid: periodIds[1], cat: 'Entertainment',  amount: 45.00,  date: '2026-05-29', desc: 'Concert' },
    { pid: periodIds[1], cat: 'Clothing',       amount: 89.99,  date: '2026-05-25', desc: 'H&M' },

    // Period 11 (Jun 1–14, current)
    { pid: periodIds[2], cat: 'Housing',        amount: 1250.00, date: '2026-06-01', desc: 'Rent' },
    { pid: periodIds[2], cat: 'Groceries',      amount: 78.45,   date: '2026-06-03', desc: 'Whole Foods' },
    { pid: periodIds[2], cat: 'Transportation', amount: 58.00,   date: '2026-06-04', desc: 'Gas' },
    { pid: periodIds[2], cat: 'Dining Out',     amount: 34.50,   date: '2026-06-06', desc: 'Lunch' },
    { pid: periodIds[2], cat: 'Subscriptions',  amount: 25.48,   date: '2026-06-10', desc: 'Netflix + Spotify' },
    { pid: periodIds[2], cat: 'Groceries',      amount: 55.30,   date: '2026-06-11', desc: 'Trader Joes' },
  ];
  for (const e of expenseData) {
    if (!cat[e.cat]) continue;
    await sql`
      INSERT INTO expenses (user_id, period_id, category_id, amount, description, expense_date)
      VALUES (${uid}, ${e.pid}, ${cat[e.cat]}, ${e.amount}, ${e.desc}, ${e.date})
    `;
  }
  console.log('✓ Expenses');

  // ── Monthly Budgets ─────────────────────────────────────────────────────────
  const monthlyBudgets = [
    { cat: 'Housing',        planned: 1250 },
    { cat: 'Transportation', planned: 400  },
    { cat: 'Groceries',      planned: 560  },
    { cat: 'Utilities',      planned: 200  },
    { cat: 'Dining Out',     planned: 300  },
    { cat: 'Entertainment',  planned: 160  },
    { cat: 'Personal Care',  planned: 120  },
    { cat: 'Subscriptions',  planned: 90   },
    { cat: 'Miscellaneous',  planned: 200  },
  ];
  for (const m of monthlyBudgets) {
    if (!cat[m.cat]) continue;
    for (const [year, month] of [[2026, 5], [2026, 6]]) {
      await sql`
        INSERT INTO monthly_budgets (user_id, year, month, category_id, planned)
        VALUES (${uid}, ${year}, ${month}, ${cat[m.cat]}, ${m.planned})
        ON CONFLICT (user_id, year, month, category_id) DO UPDATE SET planned = ${m.planned}
      `;
    }
  }
  console.log('✓ Monthly budgets');

  // ── Update onboarding ────────────────────────────────────────────────────────
  await sql`
    UPDATE users SET onboarding_done = true, pay_start_date = '2026-01-06'
    WHERE id = ${uid}
  `;

  console.log('\n🎉 Demo data seeded successfully!');
  console.log(`   Periods: ${periodIds.length}`);
  console.log(`   Bills: ${bills.length}`);
  console.log(`   Expenses: ${expenseData.length}`);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
