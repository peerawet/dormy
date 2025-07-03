import { Expense } from "@/store/expenseSlice";

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const expenseTypes = [
  { value: "water", label: "ค่าน้ำ", color: "blue", icon: "💧" },
  { value: "electric", label: "ค่าไฟ", color: "yellow", icon: "⚡" },
  { value: "maintenance", label: "ซ่อมบำรุง", color: "orange", icon: "🔧" },
  { value: "cleaning", label: "ทำความสะอาด", color: "green", icon: "🧹" },
  { value: "repair", label: "ซ่อมแซม", color: "red", icon: "🔨" },
  { value: "security", label: "รักษาความปลอดภัย", color: "purple", icon: "🛡️" },
  { value: "insurance", label: "ประกันภัย", color: "indigo", icon: "🛡️" },
  { value: "internet", label: "อินเทอร์เน็ต", color: "cyan", icon: "🌐" },
  {
    value: "furniture",
    label: "ของใช้เฟอร์นิเจอร์",
    color: "teal",
    icon: "🛋️",
  },
  { value: "tools", label: "เครื่องมือ", color: "lime", icon: "🛠️" },
  { value: "other", label: "อื่นๆ", color: "gray", icon: "📝" },
];

export default function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
}: ExpenseTableProps) {
  const getTypeConfig = (type: string) => {
    return (
      expenseTypes.find((t) => t.value === type) ||
      expenseTypes[expenseTypes.length - 1]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-left border border-orange-100 rounded-xl overflow-hidden text-sm">
        <thead>
          <tr className="bg-orange-100 text-orange-900">
            <th className="p-3 font-semibold whitespace-nowrap">ประเภท</th>
            <th className="p-3 font-semibold whitespace-nowrap">รายละเอียด</th>
            <th className="p-3 font-semibold whitespace-nowrap">หอพัก/ห้อง</th>
            <th className="p-3 font-semibold whitespace-nowrap">จำนวนเงิน</th>
            <th className="p-3 font-semibold whitespace-nowrap">วันที่</th>
            <th className="p-3 font-semibold whitespace-nowrap">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, i) => {
            const typeConfig = getTypeConfig(expense.type);
            return (
              <tr
                key={expense.id}
                className={
                  "border-t border-orange-100 hover:bg-orange-50 transition-colors " +
                  (i % 2 === 0 ? "bg-white" : "bg-orange-25")
                }
              >
                <td className="p-3 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 bg-${typeConfig.color}-100 rounded-lg flex items-center justify-center`}
                    >
                      <span className={`text-${typeConfig.color}-600 text-sm`}>
                        {typeConfig.icon}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {typeConfig.label}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="max-w-xs">
                    <p
                      className="font-medium text-gray-900 truncate"
                      title={expense.description}
                    >
                      {expense.description}
                    </p>
                  </div>
                </td>
                <td className="p-3 whitespace-nowrap">
                  <div>
                    <p className="font-medium text-gray-900">
                      {expense.dormitory.name}
                    </p>
                    {expense.room && (
                      <p className="text-xs text-gray-500">
                        ห้อง {expense.room.name}
                      </p>
                    )}
                  </div>
                </td>
                <td className="p-3 whitespace-nowrap">
                  <span className={`font-bold text-${typeConfig.color}-600`}>
                    {formatCurrency(expense.amount)}
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap text-gray-900">
                  {formatDate(expense.expenseDate)}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                      onClick={() => onEdit(expense)}
                    >
                      ✏️ แก้ไข
                    </button>
                    <button
                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                      onClick={() => onDelete(expense)}
                    >
                      🗑️ ลบ
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
