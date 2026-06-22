export interface User {
  id:              string;
  firebase_uid:    string;
  email:           string;
  display_name:    string | null;
  pay_start_date:  string | null;
  onboarding_done: boolean;
  created_at:      string;
}

export interface PaycheckPeriod {
  id:                      string;
  user_id:                 string;
  period_number:           number;
  year:                    number;
  start_date:              string;
  end_date:                string;
  primary_income:          string | null;
  partner_income:          string;
  is_three_paycheck_month: boolean;
  notes:                   string | null;
}

export interface ExpenseCategory {
  id:               string;
  name:             string;
  icon:             string | null;
  color:            string | null;
  is_default:       boolean;
  sort_order:       number;
  rollover_enabled: boolean;
}

export interface BudgetAllocation {
  id:                 string;
  period_id:          string;
  category_id:        string;
  planned:            string;
  rolled_over_amount: string;
  category_name:      string;
  icon:               string | null;
  color:              string | null;
  rollover_enabled:   boolean;
}

export interface Expense {
  id:            string;
  period_id:     string;
  category_id:   string;
  amount:        string;
  description:   string | null;
  expense_date:  string;
  category_name: string;
  icon:          string | null;
  color:         string | null;
}

export interface DebtAccount {
  id:               string;
  name:             string;
  account_type:     string;
  original_balance: string | null;
  current_balance:  string;
  interest_rate:    string | null;
  minimum_payment:  string | null;
  is_paid_off:      boolean;
}

export interface SavingsGoal {
  id:             string;
  name:           string;
  target_amount:  string;
  current_amount: string;
  target_date:    string | null;
  icon:           string | null;
  color:          string | null;
  is_completed:   boolean;
}

export interface SinkingFund {
  id:                string;
  name:              string;
  target_amount:     string;
  per_period_amount: string;
  current_balance:   string;
  due_date:          string | null;
  icon:              string;
  color:             string | null;
  is_funded:         boolean;
}

export interface RecurringBill {
  id:            string;
  name:          string;
  amount:        string;
  due_day:       number | null;
  frequency:     string;
  category_id:   string | null;
  category_name: string | null;
  icon:          string;
  is_active:     boolean;
  notes:         string | null;
}

export interface FinancialAdvice {
  id:           string;
  min_monthly:  string;
  max_monthly:  string | null;
  title:        string;
  subtitle:     string;
  book_title:   string;
  book_author:  string;
  advice_text:  string;
  action_tip:   string;
  encouragement: string;
  emoji:        string;
}

export interface MonthlyCategoryRow {
  category_id:    string;
  category_name:  string;
  icon:           string | null;
  color:          string | null;
  planned:        number;
  actual:         number;
  biweekly_total: number;
}

export interface MonthlySummary {
  year:       number;
  month:      number;
  income:     number;
  categories: MonthlyCategoryRow[];
}

export interface DashboardData {
  year:    number;
  summary: { total_income: number; total_spent: number; net: number };
  periods: Array<PaycheckPeriod & { total_spent: string; total_budgeted: string }>;
  spending_by_category: Array<ExpenseCategory & { total_spent: string; total_budgeted: string }>;
  debts:   Array<DebtAccount & { total_paid: string }>;
  savings: SavingsGoal[];
  daily_spending: Array<{ date: string; total: number }>;
}
