import { motion } from "motion/react";
import { Calendar, DollarSign, TrendingUp, Target } from "lucide-react";
import { financialData } from "../data/mockData";

export function QuickStats() {
  const { paycheckAmount, nextPaycheckDate, payPeriod, paychecksThisMonth, savingsGoalAmount } = financialData;

  const stats = [
    {
      icon: DollarSign,
      label: "Next Paycheck",
      value: `$${paycheckAmount.toLocaleString()}`,
      subtext: new Date(nextPaycheckDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      variant: "green-dark",
    },
    {
      icon: Calendar,
      label: "Pay Period",
      value: payPeriod,
      subtext: `${paychecksThisMonth} paychecks this month`,
      variant: "green-light",
    },
    {
      icon: TrendingUp,
      label: "Monthly Equivalent",
      value: `$${(paycheckAmount * 2.17).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      subtext: "Average monthly income",
      variant: "pink-light",
    },
    {
      icon: Target,
      label: "Savings Goal",
      value: `$${savingsGoalAmount.toLocaleString()}`,
      subtext: "Target for this month",
      variant: "pink-dark",
    },
  ];

  const variantClasses = {
    "green-dark": {
      bg: "bg-green-50",
      icon: "bg-green-200 text-green-700",
      text: "text-green-800",
    },
    "green-light": {
      bg: "bg-green-50/60",
      icon: "bg-green-100 text-green-600",
      text: "text-green-700",
    },
    "pink-light": {
      bg: "bg-pink-50/60",
      icon: "bg-pink-100 text-pink-600",
      text: "text-pink-700",
    },
    "pink-dark": {
      bg: "bg-pink-50",
      icon: "bg-pink-200 text-pink-700",
      text: "text-pink-800",
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const colors = variantClasses[stat.variant as keyof typeof variantClasses];
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`${colors.bg} rounded-2xl p-6 border border-white hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-green-900/60 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold mb-1 ${colors.text}`}>
              {stat.value}
            </p>
            <p className="text-xs text-green-900/40">{stat.subtext}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
