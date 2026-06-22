import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Droplets } from "lucide-react";
import { financialData } from "../data/mockData";

export function HeroSection() {
  const { income, spending, netRemaining, savingsGoalAmount } = financialData;
  const percentRemaining = (netRemaining / income) * 100;
  const jarFillPercent = Math.min((netRemaining / savingsGoalAmount) * 100, 100);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-pink-50 rounded-3xl -z-10" />

      <div className="px-6 md:px-12 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Financial summary */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-sm font-medium text-green-700 mb-2 uppercase tracking-wide">
                June 2026
              </p>
              <h1 className="text-5xl md:text-6xl font-bold text-green-900 mb-4">
                ${netRemaining.toLocaleString()}
              </h1>
              <p className="text-xl text-green-700/70 mb-8">
                Remaining this month
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-2 gap-4"
            >
              {/* Income */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm text-green-700">Income</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  ${income.toLocaleString()}
                </p>
              </div>

              {/* Spending */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-pink-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-pink-600" />
                  </div>
                  <span className="text-sm text-pink-700">Spending</span>
                </div>
                <p className="text-2xl font-bold text-pink-900">
                  ${spending.toLocaleString()}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-green-100"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-700">Monthly Progress</span>
                <span className="text-sm font-semibold text-green-600">
                  {percentRemaining.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-green-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentRemaining}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                />
              </div>
            </motion.div>
          </div>

          {/* Right side - Mason jar illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center justify-center"
          >
            <div className="relative w-64 h-80">
              <svg
                viewBox="0 0 200 280"
                className="w-full h-full drop-shadow-xl"
                fill="none"
              >
                {/* Jar lid */}
                <rect x="60" y="20" width="80" height="15" rx="3" fill="#16a34a" opacity="0.6" />
                <rect x="55" y="30" width="90" height="8" rx="2" fill="#15803d" opacity="0.8" />

                {/* Jar body */}
                <path
                  d="M 65 45 L 65 240 Q 65 260 85 260 L 115 260 Q 135 260 135 240 L 135 45 Z"
                  fill="url(#jarGlass)"
                  stroke="#bbf7d0"
                  strokeWidth="2"
                />

                <defs>
                  <linearGradient id="jarGlass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f0fdf4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#dcfce7" stopOpacity="0.6" />
                  </linearGradient>
                  <linearGradient id="liquidGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>

                {/* Animated liquid */}
                <motion.path
                  initial={{ d: "M 67 258 L 67 258 Q 67 258 100 258 Q 133 258 133 258 L 133 258 Z" }}
                  animate={{
                    d: `M 67 ${258 - (jarFillPercent * 2.13)} L 67 258 Q 67 258 100 258 Q 133 258 133 258 L 133 ${258 - (jarFillPercent * 2.13)} Z`
                  }}
                  transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                  fill="url(#liquidGradient)"
                  opacity="0.75"
                />

                {/* Water wave */}
                <motion.ellipse
                  initial={{ cy: 258 }}
                  animate={{ cy: 258 - (jarFillPercent * 2.13) }}
                  transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                  cx="100"
                  rx="33"
                  ry="3"
                  fill="#22c55e"
                  opacity="0.4"
                >
                  <animate attributeName="ry" values="3;5;3" dur="2s" repeatCount="indefinite" />
                </motion.ellipse>
              </svg>

              {/* Floating label */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
              >
                <Droplets className="w-8 h-8 text-green-600 mx-auto mb-2 opacity-70" />
                <p className="text-2xl font-bold text-green-700">
                  {jarFillPercent.toFixed(0)}%
                </p>
                <p className="text-xs text-green-600/70 mt-1">of goal</p>
              </motion.div>

              {/* Dollar amount label */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center bg-white px-4 py-2 rounded-xl shadow-lg border border-green-100"
              >
                <p className="text-sm text-green-700">Saved</p>
                <p className="text-lg font-bold text-green-600">
                  ${netRemaining.toLocaleString()}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
