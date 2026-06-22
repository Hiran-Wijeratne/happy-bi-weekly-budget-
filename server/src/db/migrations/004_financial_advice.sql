-- ─── FINANCIAL ADVICE ────────────────────────────────────────────────────────
-- Advice ranges keyed by monthly household income.
-- max_monthly IS NULL means "no upper limit" (top bracket).
CREATE TABLE IF NOT EXISTS financial_advice (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  min_monthly     NUMERIC(12,2) NOT NULL,
  max_monthly     NUMERIC(12,2),
  title           TEXT          NOT NULL,
  subtitle        TEXT          NOT NULL,
  book_title      TEXT          NOT NULL,
  book_author     TEXT          NOT NULL,
  advice_text     TEXT          NOT NULL,
  action_tip      TEXT          NOT NULL,
  encouragement   TEXT          NOT NULL,
  emoji           TEXT          NOT NULL DEFAULT '💡',
  sort_order      INTEGER       NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_advice_range
  ON financial_advice(min_monthly, COALESCE(max_monthly, 9999999));

-- Seed advice data (idempotent: DELETE then re-insert so re-running migration is safe)
DELETE FROM financial_advice;

INSERT INTO financial_advice
  (min_monthly, max_monthly, sort_order, emoji, title, subtitle, book_title, book_author, advice_text, action_tip, encouragement)
VALUES

-- ── RANGE 1: Under $2,000/month ─────────────────────────────────────────────
(0, 2000, 1, '🧱',
  'Build Your Foundation First',
  'Under $2,000 / month',
  'The Total Money Makeover',
  'Dave Ramsey',
  'Ramsey''s Baby Step 1 is non-negotiable at every income level: save $1,000 as a starter emergency fund before you do anything else. That single buffer stops the cycle where every small crisis becomes new debt. Once it''s in place, track your "4 Walls" every paycheck — Food, Utilities, Shelter, Transportation — and fund those before anything else.',
  'This paycheck: write down your 4 Walls total. Every dollar left after that is yours to assign a job. Even $25 to a savings account starts the habit.',
  'Dave Ramsey rebuilt from personal bankruptcy on an income lower than yours. He has since helped millions eliminate debt and build wealth. The number on your paycheck today is not your financial destiny — your decisions are.'
),

-- ── RANGE 2: $2,000 – $3,500/month ─────────────────────────────────────────
(2000, 3500, 2, '❄️',
  'Attack Debt with the Snowball',
  '$2,000 – $3,500 / month',
  'The Total Money Makeover',
  'Dave Ramsey',
  'At this income you have enough to start the Debt Snowball — Ramsey''s most battle-tested tool. List every debt from smallest balance to largest (ignore interest rates). Pay minimums on all of them, then throw every spare dollar at the smallest one. The psychological win of eliminating that first debt fuels momentum for the rest.',
  'This paycheck: list all your debts smallest to largest. Calculate total minimum payments. Any income above your 4 Walls + minimums goes to debt #1.',
  'People earning exactly what you earn right now have paid off $40,000, $60,000, even $80,000 in debt using this method — usually in under 3 years. You are not stuck. You are starting.'
),

-- ── RANGE 3: $3,500 – $5,500/month ─────────────────────────────────────────
(3500, 5500, 3, '⚡',
  'Automate Your Way to Wealth',
  '$3,500 – $5,500 / month',
  'I Will Teach You To Be Rich',
  'Ramit Sethi',
  'Ramit Sethi''s Conscious Spending Plan targets this income bracket perfectly: 50–60% on fixed costs, 10–15% on savings, 5–10% on investments, and 20–35% on guilt-free spending. The secret weapon is automation. Set up an automatic savings transfer the same day your paycheck deposits. What you never see in your checking account, you never spend.',
  'This paycheck: open a high-yield savings account (if you don''t have one) and set up an auto-transfer for at least 5% of your take-home. Start small — you can raise it next period.',
  'Ramit wrote this book for people earning exactly what you earn. His core message: you don''t need to be a financial expert or earn six figures. You need a system. You''re building yours right now.'
),

-- ── RANGE 4: $5,500 – $8,000/month ─────────────────────────────────────────
(5500, 8000, 4, '🤖',
  'Pay Yourself First — Automatically',
  '$5,500 – $8,000 / month',
  'The Automatic Millionaire',
  'David Bach',
  'David Bach''s research found that the single biggest difference between millionaires and everyone else is not income — it''s automation. At your income, automating 10–15% of every paycheck to retirement and savings before it hits your checking account is the highest-leverage habit you can build. The money grows whether you think about it or not.',
  'This paycheck: if your employer offers a 401(k) match, increase your contribution to at least capture the full match — that''s an instant 50–100% return. Then set up a monthly Roth IRA contribution, even if it''s $100.',
  'Bach''s math: automating $600/month at your income level, invested at historical market returns, reaches $1 million in roughly 22 years — without a single conscious investment decision. The system does the work. You just have to start it.'
),

-- ── RANGE 5: $8,000 – $12,000/month ────────────────────────────────────────
(8000, 12000, 5, '📈',
  'Buy Assets, Not Liabilities',
  '$8,000 – $12,000 / month',
  'Rich Dad Poor Dad',
  'Robert Kiyosaki',
  'Kiyosaki''s most important lesson: the rich buy assets — things that put money in your pocket. The middle class buy liabilities mistaking them for assets. At your income, the discipline is no longer earning more — you already earn well. The discipline is deploying each paycheck into things that generate more income: index funds, rental property, business equity. Every dollar not deployed into assets is an opportunity cost.',
  'This paycheck: calculate what percentage went into assets (retirement accounts, brokerage, real estate equity) vs. liabilities (new car, upgrades, subscriptions). Target 20–25% of take-home into assets this period.',
  'Kiyosaki''s framework was written for people who earn exactly what you earn and wonder why they still feel behind. At this income with disciplined asset-buying, financial independence within 7–12 years is not a fantasy — it is arithmetic.'
),

-- ── RANGE 6: $12,000+/month ─────────────────────────────────────────────────
(12000, NULL, 6, '🧠',
  'Behavior Beats Knowledge at This Level',
  '$12,000+ / month',
  'The Psychology of Money',
  'Morgan Housel',
  'Morgan Housel''s central thesis: financial success is less about intelligence and more about behavior. At high income levels, the #1 wealth killer is lifestyle inflation — the quiet, gradual expansion of spending that erases everything you earn. Housel writes: "Wealth is the nice cars not purchased, the diamonds not bought." The person who earns $25,000/month and saves $3,000 is less wealthy than the person who earns $15,000 and saves $5,000.',
  'This paycheck: audit your fixed monthly costs. For every $1,000/month you can hold flat instead of upgrading, you move financial independence approximately 12–18 months closer. Identify one fixed cost you could reduce or eliminate.',
  'You are in the income bracket most personal finance books use as their aspirational "end state." You don''t need more income. You need what Housel calls "room to endure" — the financial cushion and behavioral control to stay the course through every market cycle and life event. That starts with each paycheck.'
);
