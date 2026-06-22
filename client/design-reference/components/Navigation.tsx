import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Home, TrendingUp, Target, CreditCard, Settings, BarChart3, Wallet } from "lucide-react";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: BarChart3, label: "Analytics" },
    { icon: Wallet, label: "Transactions" },
    { icon: Target, label: "Goals" },
    { icon: CreditCard, label: "Debts" },
    { icon: TrendingUp, label: "Investments" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <>
      {/* Desktop Navigation - Hamburger with slide-in drawer */}
      <div className="hidden md:block fixed top-6 left-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100"
        >
          {isOpen ? <X className="w-6 h-6 text-green-700" /> : <Menu className="w-6 h-6 text-green-700" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="hidden md:block fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="hidden md:block fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-40 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center gap-3 mb-12 mt-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-green-900">Budgetly</h2>
                    <p className="text-sm text-green-600">Premium Finance</p>
                  </div>
                </div>

                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        item.active
                          ? "bg-green-50 text-green-700 font-semibold"
                          : "text-green-800/60 hover:bg-green-50/60 hover:text-green-700"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </nav>

                <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200">
                  <p className="text-sm text-pink-800 mb-2">Need help?</p>
                  <button className="text-sm font-medium text-pink-600 hover:text-pink-700">
                    Contact Support →
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Navigation - Bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-green-100 z-50 safe-bottom">
        <div className="flex items-center justify-around px-4 py-3">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.label}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                item.active
                  ? "text-green-600"
                  : "text-green-400 hover:text-green-600"
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
