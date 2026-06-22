// Mock data for the budgeting dashboard

export const financialData = {
  // Current financial state
  income: 6500,
  spending: 4230,
  netRemaining: 2270,
  savingsGoalAmount: 3000,
  
  // Paycheck information
  paycheckAmount: 3250,
  nextPaycheckDate: "2026-07-05",
  payPeriod: "Bi-weekly",
  paychecksThisMonth: 2,
  paychecksNextMonth: 3, // Bonus month!
  
  // Spending categories
  categories: [
    { name: "Housing", budgeted: 1800, spent: 1800, color: "#be185d", icon: "Home" },
    { name: "Food & Dining", budgeted: 600, spent: 523, color: "#ec4899", icon: "Utensils" },
    { name: "Transportation", budgeted: 400, spent: 387, color: "#f472b6", icon: "Car" },
    { name: "Entertainment", budgeted: 300, spent: 245, color: "#db2777", icon: "Gamepad2" },
    { name: "Shopping", budgeted: 250, spent: 312, color: "#f9a8d4", icon: "ShoppingBag" },
    { name: "Healthcare", budgeted: 200, spent: 156, color: "#fbcfe8", icon: "Heart" },
    { name: "Utilities", budgeted: 180, spent: 175, color: "#e879a8", icon: "Zap" },
    { name: "Other", budgeted: 500, spent: 632, color: "#9d174d", icon: "MoreHorizontal" },
  ],
  
  // Savings goals
  savingsGoals: [
    { name: "Emergency Fund", current: 8450, target: 10000, color: "#16a34a" },
    { name: "Vacation", current: 1250, target: 3000, color: "#22c55e" },
    { name: "New Car", current: 4200, target: 15000, color: "#4ade80" },
    { name: "Home Down Payment", current: 12000, target: 50000, color: "#86efac" },
  ],
  
  // Debt tracking
  debts: [
    { name: "Student Loan", balance: 15000, original: 25000, minimumPayment: 250, color: "#be185d" },
    { name: "Credit Card", balance: 2100, original: 5000, minimumPayment: 75, color: "#ec4899" },
    { name: "Car Loan", balance: 8500, original: 20000, minimumPayment: 350, color: "#f472b6" },
  ],
  
  // Spending over time (last 6 months)
  spendingOverTime: [
    { month: "Jan", spending: 3890, budget: 4230, income: 6500 },
    { month: "Feb", spending: 4120, budget: 4230, income: 6500 },
    { month: "Mar", spending: 3950, budget: 4230, income: 6500 },
    { month: "Apr", spending: 4310, budget: 4230, income: 6500 },
    { month: "May", spending: 4180, budget: 4230, income: 6500 },
    { month: "Jun", spending: 4230, budget: 4230, income: 6500 },
  ],
  
  // Daily spending pattern (last 30 days aggregated by day of week)
  dailySpending: [
    { day: "Mon", amount: 142 },
    { day: "Tue", amount: 135 },
    { day: "Wed", amount: 158 },
    { day: "Thu", amount: 147 },
    { day: "Fri", amount: 189 },
    { day: "Sat", amount: 201 },
    { day: "Sun", amount: 178 },
  ],
  
  // Forecast for next 3 months
  forecast: {
    projectedIncome: 19500,
    projectedSpending: 12690,
    projectedSavings: 6810,
    confidenceLevel: 87,
    savingsRate: 35,
  },
  
  // Monthly trends
  monthlyTrends: [
    { month: "Jan", income: 6500, expenses: 3890, savings: 2610 },
    { month: "Feb", income: 6500, expenses: 4120, savings: 2380 },
    { month: "Mar", income: 6500, expenses: 3950, savings: 2550 },
    { month: "Apr", income: 6500, expenses: 4310, savings: 2190 },
    { month: "May", income: 6500, expenses: 4180, savings: 2320 },
    { month: "Jun", income: 6500, expenses: 4230, savings: 2270 },
  ],
  
  // Advice insights
  insights: [
    {
      type: "warning",
      title: "Shopping over budget",
      message: "You've spent $62 more than budgeted in Shopping this month. Consider reducing discretionary purchases.",
      action: "View tips"
    },
    {
      type: "success",
      title: "Great progress on Emergency Fund!",
      message: "You're 84.5% of the way to your emergency fund goal. Keep it up!",
      action: "Adjust goal"
    },
    {
      type: "info",
      title: "3-paycheck month ahead",
      message: "July will have 3 paychecks! Consider allocating the extra $3,250 to your savings goals.",
      action: "Plan allocation"
    }
  ]
};
