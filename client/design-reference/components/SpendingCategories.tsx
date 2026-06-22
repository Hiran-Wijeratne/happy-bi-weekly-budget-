import { motion } from "motion/react";
import { Home, Utensils, Car, Gamepad2, ShoppingBag, Heart, Zap, MoreHorizontal, AlertCircle } from "lucide-react";
import { financialData } from "../data/mockData";

const iconMap: Record<string, any> = {
  Home, Utensils, Car, Gamepad2, ShoppingBag, Heart, Zap, MoreHorizontal
};

export function SpendingCategories() {
  const { categories } = financialData;

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-pink-50 shadow-sm">
      <h2 className="text-2xl font-bold text-green-900 mb-6">Spending by Category</h2>

      <div className="space-y-5">
        {categories.map((category, index) => {
          const percentage = (category.spent / category.budgeted) * 100;
          const isOverBudget = category.spent > category.budgeted;
          const Icon = iconMap[category.icon];

          return (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {Icon && <Icon className="w-5 h-5" style={{ color: category.color }} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-green-900">{category.name}</span>
                      {isOverBudget && (
                        <AlertCircle className="w-4 h-4 text-pink-500" />
                      )}
                    </div>
                    <span className="text-sm text-green-900/50">
                      ${category.spent.toLocaleString()} of ${category.budgeted.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${isOverBudget ? "text-pink-600" : "text-green-700"}`}>
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative w-full h-2.5 bg-pink-50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentage, 100)}%` }}
                  transition={{ duration: 1, delay: 0.2 + index * 0.05, ease: "easeOut" }}
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ backgroundColor: category.color, opacity: 0.85 }}
                />
              </div>

              {isOverBudget && (
                <p className="text-xs text-pink-600 mt-1.5 font-medium">
                  ${(category.spent - category.budgeted).toLocaleString()} over budget
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
