import { motion } from "motion/react";
import { Target, TrendingUp } from "lucide-react";
import { financialData } from "../data/mockData";

export function SavingsGoals() {
  const { savingsGoals } = financialData;

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-green-50 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-900">Savings Goals</h2>
        </div>
        <button className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-medium transition-colors duration-200">
          + Add Goal
        </button>
      </div>

      <div className="space-y-6">
        {savingsGoals.map((goal, index) => {
          const percentage = (goal.current / goal.target) * 100;
          const remaining = goal.target - goal.current;

          return (
            <motion.div
              key={goal.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">{goal.name}</h3>
                  <p className="text-sm text-green-900/50">
                    ${goal.current.toLocaleString()} of ${goal.target.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: goal.color }}>
                    {percentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-green-900/40">
                    ${remaining.toLocaleString()} to go
                  </p>
                </div>
              </div>

              <div className="relative w-full h-4 bg-green-50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.5, delay: 0.2 + index * 0.1, ease: "easeOut" }}
                  className="absolute left-0 top-0 h-full rounded-full relative overflow-hidden group-hover:shadow-lg transition-shadow duration-300"
                  style={{ backgroundColor: goal.color }}
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

              {percentage >= 75 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                  className="flex items-center gap-2 mt-2 text-sm text-green-600"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Almost there! Keep it up!</span>
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
        className="mt-6 p-5 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-100"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-green-900/60 mb-1">Total Saved</p>
            <p className="text-xl font-bold text-green-700">
              ${savingsGoals.reduce((sum, goal) => sum + goal.current, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-green-900/60 mb-1">Total Goal</p>
            <p className="text-xl font-bold text-green-900">
              ${savingsGoals.reduce((sum, goal) => sum + goal.target, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
