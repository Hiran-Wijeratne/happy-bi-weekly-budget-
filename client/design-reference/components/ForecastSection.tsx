import { motion } from "motion/react";
import { TrendingUp, DollarSign, PiggyBank, Activity, Percent } from "lucide-react";
import { financialData } from "../data/mockData";

export function ForecastSection() {
  const { forecast } = financialData;

  const stats = [
    {
      icon: DollarSign,
      label: "Projected Income",
      value: `$${forecast.projectedIncome.toLocaleString()}`,
      subtext: "Next 3 months",
      gradient: "from-green-400 to-green-600",
      ring: "ring-green-100",
    },
    {
      icon: TrendingUp,
      label: "Projected Spending",
      value: `$${forecast.projectedSpending.toLocaleString()}`,
      subtext: "Next 3 months",
      gradient: "from-pink-400 to-pink-600",
      ring: "ring-pink-100",
    },
    {
      icon: PiggyBank,
      label: "Projected Savings",
      value: `$${forecast.projectedSavings.toLocaleString()}`,
      subtext: "Next 3 months",
      gradient: "from-green-300 to-green-500",
      ring: "ring-green-100",
    },
    {
      icon: Activity,
      label: "Confidence Level",
      value: `${forecast.confidenceLevel}%`,
      subtext: "Based on trends",
      gradient: "from-pink-300 to-pink-500",
      ring: "ring-pink-100",
    },
    {
      icon: Percent,
      label: "Savings Rate",
      value: `${forecast.savingsRate}%`,
      subtext: "Of total income",
      gradient: "from-green-500 to-green-700",
      ring: "ring-green-100",
    },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <h2 className="text-3xl font-bold text-green-900 mb-2">Financial Forecast</h2>
        <p className="text-green-700/60">Projected insights for the next quarter</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative group"
          >
            <div className="bg-white rounded-2xl p-6 border border-green-50 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 ring-4 ${stat.ring} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <p className="text-sm text-green-900/60 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-green-900 mb-1">{stat.value}</p>
              <p className="text-xs text-green-900/40">{stat.subtext}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Forecast confidence indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-6 bg-gradient-to-br from-green-50 to-pink-50 rounded-2xl p-6 border border-green-100"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-semibold text-green-900 mb-1">Forecast Accuracy</h3>
            <p className="text-sm text-green-900/60">
              Our predictions are based on your last 6 months of financial data
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{forecast.confidenceLevel}%</p>
              <p className="text-xs text-green-900/50">Confidence</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="#dcfce7" strokeWidth="4" fill="none" />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="url(#confidenceGradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(forecast.confidenceLevel / 100) * 150.8} 150.8`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#16a34a" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
