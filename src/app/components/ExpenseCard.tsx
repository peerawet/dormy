import { Expense } from "@/store/expenseSlice";

interface ExpenseCardProps {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
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

export default function ExpenseCard({
  expense,
  onEdit,
  onDelete,
}: ExpenseCardProps) {
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

  const typeConfig = getTypeConfig(expense.type);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 bg-${typeConfig.color}-100 rounded-full flex items-center justify-center`}
          >
            <span className={`text-${typeConfig.color}-600 text-lg`}>
              {typeConfig.icon}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{typeConfig.label}</h4>
            <p className="text-sm text-gray-500">{expense.dormitory.name}</p>
          </div>
        </div>
      </div>

      {/* Expense Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">รายละเอียด:</span>
          <span
            className="font-medium text-right max-w-[60%] truncate"
            title={expense.description}
          >
            {expense.description}
          </span>
        </div>
        {expense.room && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">ห้อง:</span>
            <span className="font-medium">{expense.room.name}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">วันที่:</span>
          <span className="font-medium">{formatDate(expense.expenseDate)}</span>
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-1">จำนวนเงิน</div>
        <div className={`text-lg font-bold text-${typeConfig.color}-600`}>
          {formatCurrency(expense.amount)}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors flex items-center justify-center gap-1"
          onClick={onEdit}
        >
          ✏️ แก้ไข
        </button>
        <button
          className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
          onClick={onDelete}
        >
          🗑️ ลบ
        </button>
      </div>
    </div>
  );
}
