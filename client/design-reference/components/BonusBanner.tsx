import { motion } from "motion/react";
import { Sparkles, Calendar } from "lucide-react";
import { financialData } from "../data/mockData";

export function BonusBanner() {
  const { paychecksNextMonth, paycheckAmount } = financialData;

  if (paychecksNextMonth <= 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden bg-gradient-to-r from-green-500 via-green-400 to-pink-400 rounded-2xl p-6 text-white"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">3-Paycheck Month Ahead!</h3>
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-white/90 text-sm">
              July will have {paychecksNextMonth} paychecks. That's an extra ${paycheckAmount.toLocaleString()} to allocate toward your goals!
            </p>
          </div>
        </div>
        <button className="px-6 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-all duration-200 border border-white/30 whitespace-nowrap">
          Plan Allocation →
        </button>
      </div>

      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 right-20 w-2 h-2 bg-white rounded-full"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-8 right-32 w-1.5 h-1.5 bg-white rounded-full"
      />
    </motion.div>
  );
}
