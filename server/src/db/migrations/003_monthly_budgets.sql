-- ─── MONTHLY BUDGETS ─────────────────────────────────────────────────────────
-- Stores per-category monthly spending targets, independent of biweekly allocations.
-- Actual spending is derived from the existing expenses table filtered by month.
CREATE TABLE IF NOT EXISTS monthly_budgets (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year        INTEGER       NOT NULL,
  month       INTEGER       NOT NULL CHECK(month BETWEEN 1 AND 12),
  category_id UUID          NOT NULL REFERENCES expense_categories(id) ON DELETE CASCADE,
  planned     NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, year, month, category_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_budgets_user_ym ON monthly_budgets(user_id, year, month);

DO $$ BEGIN
  CREATE TRIGGER trg_monthly_budgets_updated_at
    BEFORE UPDATE ON monthly_budgets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
