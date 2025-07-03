import { BarChart3, TrendingDown } from "lucide-react";

interface ExpenseChartProps {
  data: {
    month: string;
    expense: number;
  }[];
  formatCurrency: (amount: number) => string;
  title: string;
  subtitle: string;
}

export default function ExpenseTrendChart({
  data,
  formatCurrency,
  title,
  subtitle,
}: ExpenseChartProps) {
  const maxExpense = Math.max(...data.map((item) => item.expense));

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 text-sm font-medium text-gray-700">
                {item.month}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
                  style={{ width: `${(item.expense / maxExpense) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-sm font-semibold text-gray-900 ml-4">
              {formatCurrency(item.expense)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-red-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">
              เฉลี่ยค่าใช้จ่ายต่อเดือน
            </span>
          </div>
          <span className="text-lg font-bold text-red-600">
            {formatCurrency(
              data.reduce((sum, item) => sum + item.expense, 0) /
                (data.length || 1)
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
