-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid    TEXT        NOT NULL UNIQUE,
  email           TEXT        NOT NULL,
  display_name    TEXT,
  pay_start_date  DATE,
  onboarding_done BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── EXPENSE CATEGORIES ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expense_categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  icon       TEXT,
  color      TEXT,
  is_default BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

-- ─── PAYCHECK PERIODS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS paycheck_periods (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_number           INTEGER     NOT NULL,
  year                    INTEGER     NOT NULL,
  start_date              DATE        NOT NULL,
  end_date                DATE        NOT NULL,
  primary_income          NUMERIC(12,2),
  partner_income          NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_three_paycheck_month BOOLEAN     NOT NULL DEFAULT FALSE,
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, year, period_number)
);

-- ─── BUDGET ALLOCATIONS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budget_allocations (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_id   UUID          NOT NULL REFERENCES paycheck_periods(id) ON DELETE CASCADE,
  category_id UUID          NOT NULL REFERENCES expense_categories(id) ON DELETE CASCADE,
  planned     NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (period_id, category_id)
);

-- ─── EXPENSES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_id    UUID          NOT NULL REFERENCES paycheck_periods(id) ON DELETE CASCADE,
  category_id  UUID          NOT NULL REFERENCES expense_categories(id) ON DELETE CASCADE,
  amount       NUMERIC(12,2) NOT NULL,
  description  TEXT,
  expense_date DATE          NOT NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── DEBT ACCOUNTS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS debt_accounts (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name             TEXT          NOT NULL,
  account_type     TEXT          NOT NULL DEFAULT 'credit_card',
  original_balance NUMERIC(12,2),
  current_balance  NUMERIC(12,2) NOT NULL,
  interest_rate    NUMERIC(6,4),
  minimum_payment  NUMERIC(12,2),
  is_paid_off      BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── DEBT PAYMENTS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS debt_payments (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_id    UUID          NOT NULL REFERENCES paycheck_periods(id) ON DELETE CASCADE,
  debt_id      UUID          NOT NULL REFERENCES debt_accounts(id) ON DELETE CASCADE,
  amount       NUMERIC(12,2) NOT NULL,
  payment_date DATE          NOT NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── SAVINGS GOALS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS savings_goals (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name           TEXT          NOT NULL,
  target_amount  NUMERIC(12,2) NOT NULL,
  current_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  target_date    DATE,
  icon           TEXT,
  color          TEXT,
  is_completed   BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── SAVINGS CONTRIBUTIONS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS savings_contributions (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_id        UUID          NOT NULL REFERENCES paycheck_periods(id) ON DELETE CASCADE,
  goal_id          UUID          NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  amount           NUMERIC(12,2) NOT NULL,
  contributed_date DATE          NOT NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_paycheck_periods_user_year   ON paycheck_periods(user_id, year);
CREATE INDEX IF NOT EXISTS idx_expenses_period              ON expenses(period_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date           ON expenses(user_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_budget_allocations_period    ON budget_allocations(period_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_period         ON debt_payments(period_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_debt           ON debt_payments(debt_id);
CREATE INDEX IF NOT EXISTS idx_savings_contributions_period ON savings_contributions(period_id);
CREATE INDEX IF NOT EXISTS idx_savings_contributions_goal   ON savings_contributions(goal_id);

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_periods_updated_at
    BEFORE UPDATE ON paycheck_periods FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_allocations_updated_at
    BEFORE UPDATE ON budget_allocations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_expenses_updated_at
    BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_debt_accounts_updated_at
    BEFORE UPDATE ON debt_accounts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_savings_goals_updated_at
    BEFORE UPDATE ON savings_goals FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
