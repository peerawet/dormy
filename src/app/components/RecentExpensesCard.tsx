import { Receipt, Calendar, MapPin } from "lucide-react";

interface RecentExpensesCardProps {
  expenses: {
    id: string;
    type: string;
    description?: string;
    amount: number;
    expenseDate: string;
    dormitoryName: string;
    roomName?: string;
  }[];
  formatCurrency: (amount: number) => string;
  title: string;
  subtitle: string;
}

export default function RecentExpensesCard({
  expenses,
  formatCurrency,
  title,
  subtitle,
}: RecentExpensesCardProps) {
  const getExpenseTypeColor = (type: string) => {
    switch (type) {
      case "ค่าไฟฟ้า":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ค่าน้ำ":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ค่าซ่อมแซม":
        return "bg-red-100 text-red-800 border-red-200";
      case "ค่าทำความสะอาด":
        return "bg-green-100 text-green-800 border-green-200";
      case "ค่าอินเทอร์เน็ต":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
          <Receipt className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="space-y-4">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getExpenseTypeColor(
                      expense.type
                    )}`}
                  >
                    {expense.type}
                  </span>
                </div>
                <p className="font-medium text-gray-900 mb-1">
                  {expense.description}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(expense.expenseDate)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {expense.dormitoryName}
                      {expense.roomName && ` - ${expense.roomName}`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-8">
          <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">ไม่มีค่าใช้จ่ายล่าสุด</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-red-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">
              ค่าใช้จ่ายล่าสุด
            </span>
          </div>
          <span className="text-lg font-bold text-red-600">
            {formatCurrency(
              expenses.reduce((sum, expense) => sum + expense.amount, 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
