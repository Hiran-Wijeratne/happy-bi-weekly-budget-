import { motion } from "motion/react";
import { Lightbulb, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { financialData } from "../data/mockData";

export function InsightsCard() {
  const { insights } = financialData;

  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
      titleColor: "text-pink-900",
      buttonColor: "bg-pink-100 hover:bg-pink-200 text-pink-700",
    },
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      titleColor: "text-green-900",
      buttonColor: "bg-green-100 hover:bg-green-200 text-green-700",
    },
    info: {
      icon: Info,
      bgColor: "bg-green-50/60",
      borderColor: "border-green-100",
      iconBg: "bg-green-100",
      iconColor: "text-green-700",
      titleColor: "text-green-900",
      buttonColor: "bg-green-100 hover:bg-green-200 text-green-700",
    },
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-green-50 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-pink-100 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-900">Insights & Advice</h2>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const config = typeConfig[insight.type as keyof typeof typeConfig];
          const Icon = config.icon;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${config.bgColor} ${config.borderColor} border rounded-xl p-5 hover:shadow-md transition-all duration-300`}
            >
              <div className="flex items-start gap-4">
                <div className={`${config.iconBg} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${config.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${config.titleColor}`}>
                    {insight.title}
                  </h3>
                  <p className="text-sm text-green-900/60 mb-3">
                    {insight.message}
                  </p>
                  <button className={`text-sm font-medium px-4 py-2 rounded-lg ${config.buttonColor} transition-colors duration-200`}>
                    {insight.action} →
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
