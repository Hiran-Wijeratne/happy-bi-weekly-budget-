import { Navigation } from "./components/Navigation";
import { HeroSection } from "./components/HeroSection";
import { QuickStats } from "./components/QuickStats";
import { BonusBanner } from "./components/BonusBanner";
import { SpendingCategories } from "./components/SpendingCategories";
import { InsightsCard } from "./components/InsightsCard";
import {
  SpendingBreakdownChart,
  BudgetVsActualChart,
  SpendingOverTimeChart,
  MonthlyTrendsChart,
  DailySpendingChart,
} from "./components/Charts";
import { ForecastSection } from "./components/ForecastSection";
import { SavingsGoals } from "./components/SavingsGoals";
import { DebtTracking } from "./components/DebtTracking";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/40 via-white to-pink-50/30">
      <Navigation />

      {/* Main content with centered layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        {/* Hero Section */}
        <section className="mb-12">
          <HeroSection />
        </section>

        {/* Bonus Banner */}
        <section className="mb-12">
          <BonusBanner />
        </section>

        {/* Quick Stats */}
        <section className="mb-12">
          <QuickStats />
        </section>

        {/* Spending Categories and Insights */}
        <section className="grid lg:grid-cols-2 gap-8 mb-12">
          <SpendingCategories />
          <InsightsCard />
        </section>

        {/* Charts Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-green-900 mb-6">Financial Analytics</h2>
          
          {/* First row of charts */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <SpendingBreakdownChart />
            <BudgetVsActualChart />
          </div>

          {/* Second row - full width chart */}
          <div className="mb-8">
            <MonthlyTrendsChart />
          </div>

          {/* Third row of charts */}
          <div className="grid lg:grid-cols-2 gap-8">
            <SpendingOverTimeChart />
            <DailySpendingChart />
          </div>
        </section>

        {/* Forecast Section */}
        <section className="mb-12">
          <ForecastSection />
        </section>

        {/* Goals and Debt Section */}
        <section className="grid lg:grid-cols-2 gap-8 mb-12">
          <SavingsGoals />
          <DebtTracking />
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-pink-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-green-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600" />
              <span className="font-semibold">Budgetly</span>
            </div>
            <p>© 2026 Budgetly. Your premium finance companion.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-pink-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-pink-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-pink-600 transition-colors">Help</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
