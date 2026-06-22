import { useState } from "react";
import { motion } from "motion/react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { financialData } from "../data/mockData";

const GREEN = "#16a34a";
const PINK = "#ec4899";
const GREEN_LIGHT = "#4ade80";
const PINK_LIGHT = "#f9a8d4";

const tooltipStyle = {
  backgroundColor: "white",
  border: "1px solid #bbf7d0",
  borderRadius: "12px",
  padding: "12px",
};

export function SpendingBreakdownChart() {
  const { categories } = financialData;

  const data = categories.map((cat) => ({
    name: cat.name,
    value: cat.spent,
    color: cat.color,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl p-6 md:p-8 border border-pink-50 shadow-sm"
    >
      <h3 className="text-xl font-bold text-green-900 mb-6">Spending Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} opacity={0.85} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={tooltipStyle}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-green-900/70">{item.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function BudgetVsActualChart() {
  const { categories } = financialData;

  const data = categories.map((cat) => ({
    name: cat.name.split(" ")[0],
    budgeted: cat.budgeted,
    spent: cat.spent,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="bg-white rounded-2xl p-6 md:p-8 border border-green-50 shadow-sm"
    >
      <h3 className="text-xl font-bold text-green-900 mb-6">Budget vs Actual</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
          <XAxis dataKey="name" tick={{ fill: "#4b7c5b", fontSize: 12 }} />
          <YAxis tick={{ fill: "#4b7c5b", fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={tooltipStyle}
          />
          <Legend />
          <Bar dataKey="budgeted" fill={GREEN} radius={[8, 8, 0, 0]} opacity={0.75} />
          <Bar dataKey="spent" fill={PINK} radius={[8, 8, 0, 0]} opacity={0.75} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function SpendingOverTimeChart() {
  const { spendingOverTime } = financialData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white rounded-2xl p-6 md:p-8 border border-pink-50 shadow-sm"
    >
      <h3 className="text-xl font-bold text-green-900 mb-6">Spending Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={spendingOverTime}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fdf2f8" />
          <XAxis dataKey="month" tick={{ fill: "#4b7c5b", fontSize: 12 }} />
          <YAxis tick={{ fill: "#4b7c5b", fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={tooltipStyle}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="spending"
            stroke={PINK}
            strokeWidth={3}
            dot={{ fill: PINK, r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="budget"
            stroke={GREEN}
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ fill: GREEN, r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function MonthlyTrendsChart() {
  const { monthlyTrends } = financialData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white rounded-2xl p-6 md:p-8 border border-green-50 shadow-sm"
    >
      <h3 className="text-xl font-bold text-green-900 mb-6">Monthly Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={monthlyTrends}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={GREEN} stopOpacity={0.3} />
              <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={PINK} stopOpacity={0.3} />
              <stop offset="95%" stopColor={PINK} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={GREEN_LIGHT} stopOpacity={0.3} />
              <stop offset="95%" stopColor={GREEN_LIGHT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
          <XAxis dataKey="month" tick={{ fill: "#4b7c5b", fontSize: 12 }} />
          <YAxis tick={{ fill: "#4b7c5b", fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={tooltipStyle}
          />
          <Legend />
          <Area type="monotone" dataKey="income" stroke={GREEN} fillOpacity={1} fill="url(#incomeGradient)" />
          <Area type="monotone" dataKey="expenses" stroke={PINK} fillOpacity={1} fill="url(#expensesGradient)" />
          <Area type="monotone" dataKey="savings" stroke={GREEN_LIGHT} fillOpacity={1} fill="url(#savingsGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function DailySpendingChart() {
  const { dailySpending } = financialData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white rounded-2xl p-6 md:p-8 border border-green-50 shadow-sm"
    >
      <h3 className="text-xl font-bold text-green-900 mb-6">Daily Spending Patterns</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dailySpending}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
          <XAxis dataKey="day" tick={{ fill: "#4b7c5b", fontSize: 12 }} />
          <YAxis tick={{ fill: "#4b7c5b", fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={tooltipStyle}
          />
          <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
            {dailySpending.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.amount > 180 ? PINK : GREEN}
                opacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
