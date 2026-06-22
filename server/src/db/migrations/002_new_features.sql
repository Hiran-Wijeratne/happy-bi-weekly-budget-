-- ─── SINKING FUNDS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sinking_funds (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              TEXT          NOT NULL,
  target_amount     NUMERIC(12,2) NOT NULL,
  per_period_amount NUMERIC(12,2) NOT NULL,
  due_date          DATE,
  current_balance   NUMERIC(12,2) NOT NULL DEFAULT 0,
  icon              TEXT          NOT NULL DEFAULT '🏦',
  color             TEXT,
  is_funded         BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sinking_fund_contributions (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sinking_fund_id  UUID          NOT NULL REFERENCES sinking_funds(id) ON DELETE CASCADE,
  period_id        UUID          NOT NULL REFERENCES paycheck_periods(id) ON DELETE CASCADE,
  amount           NUMERIC(12,2) NOT NULL CHECK(amount > 0),
  contributed_date DATE          NOT NULL DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── RECURRING BILLS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recurring_bills (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT          NOT NULL,
  amount      NUMERIC(12,2) NOT NULL,
  due_day     INTEGER       CHECK(due_day BETWEEN 1 AND 28),
  frequency   TEXT          NOT NULL DEFAULT 'monthly',
  category_id UUID          REFERENCES expense_categories(id) ON DELETE SET NULL,
  icon        TEXT          NOT NULL DEFAULT '📄',
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  notes       TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── ROLLOVER SUPPORT ─────────────────────────────────────────────────────────
ALTER TABLE expense_categories
  ADD COLUMN IF NOT EXISTS rollover_enabled BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE budget_allocations
  ADD COLUMN IF NOT EXISTS rolled_over_amount NUMERIC(12,2) NOT NULL DEFAULT 0;

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sinking_funds_user             ON sinking_funds(user_id);
CREATE INDEX IF NOT EXISTS idx_sinking_fund_contributions_fund ON sinking_fund_contributions(sinking_fund_id);
CREATE INDEX IF NOT EXISTS idx_sinking_fund_contributions_period ON sinking_fund_contributions(period_id);
CREATE INDEX IF NOT EXISTS idx_recurring_bills_user           ON recurring_bills(user_id);

-- ─── UPDATED_AT TRIGGERS ──────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TRIGGER trg_sinking_funds_updated_at
    BEFORE UPDATE ON sinking_funds FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_recurring_bills_updated_at
    BEFORE UPDATE ON recurring_bills FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
