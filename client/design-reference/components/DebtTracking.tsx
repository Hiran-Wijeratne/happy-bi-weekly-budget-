import { motion } from "motion/react";
import { CreditCard, TrendingDown, CheckCircle } from "lucide-react";
import { financialData } from "../data/mockData";

export function DebtTracking() {
  const { debts } = financialData;

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-pink-50 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-pink-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-900">Debt Payoff Progress</h2>
        </div>
      </div>

      <div className="space-y-6">
        {debts.map((debt, index) => {
          const paidOff = debt.original - debt.balance;
          const percentage = (paidOff / debt.original) * 100;

          return (
            <motion.div
              key={debt.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">{debt.name}</h3>
                  <p className="text-sm text-green-900/50">
                    ${debt.balance.toLocaleString()} remaining
                  </p>
                  <p className="text-xs text-green-900/40 mt-1">
                    Min. payment: ${debt.minimumPayment}/month
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: debt.color }}>
                    {percentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-green-900/40">paid off</p>
                </div>
              </div>

              <div className="relative w-full h-4 bg-pink-50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.5, delay: 0.2 + index * 0.1, ease: "easeOut" }}
                  className="absolute left-0 top-0 h-full rounded-full relative overflow-hidden group-hover:shadow-lg transition-shadow duration-300"
                  style={{ backgroundColor: debt.color }}
                >
                  <motion.div
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: index * 0.3 }}
                    className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>

                {percentage > 10 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white"
                  >
                    {percentage.toFixed(0)}%
                  </motion.div>
                )}
              </div>

              <div className="flex items-center justify-between mt-2 text-xs text-green-900/50">
                <span>${paidOff.toLocaleString()} paid</span>
                <span>Original: ${debt.original.toLocaleString()}</span>
              </div>

              {percentage >= 50 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                  className="flex items-center gap-2 mt-2 text-sm text-green-600"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Great progress! Over halfway there!</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-6 p-5 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-xl border border-pink-100"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-green-900/60 mb-1">Total Debt</p>
            <p className="text-xl font-bold text-pink-700">
              ${debts.reduce((sum, debt) => sum + debt.balance, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-green-900/60 mb-1">Paid Off</p>
            <p className="text-xl font-bold text-green-700">
              ${debts.reduce((sum, debt) => sum + (debt.original - debt.balance), 0).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-pink-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-900/60">Monthly Payments</span>
            <span className="font-bold text-green-900">
              ${debts.reduce((sum, debt) => sum + debt.minimumPayment, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="mt-4 p-4 bg-gradient-to-r from-green-50 to-pink-50 rounded-xl border border-green-100 flex items-center gap-3"
      >
        <TrendingDown className="w-8 h-8 text-pink-500 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-green-900 mb-1">Debt-Free Projection</h4>
          <p className="text-sm text-green-900/60">
            At your current pace, you could be debt-free in approximately{" "}
            <span className="font-bold text-green-700">24 months</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
