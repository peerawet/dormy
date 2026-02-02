import { RecurringExpense } from "@/store/recurringExpenseSlice";

interface RecurringExpensesTableProps {
  recurringExpenses: RecurringExpense[];
  formatCurrency: (amount: number) => string;
  onApply: (recurringExpense: RecurringExpense) => void;
  onEdit: (recurringExpense: RecurringExpense) => void;
  onDelete: (recurringExpense: RecurringExpense) => void;
  applyingId?: number | null;
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

const frequencyLabels: { [key: string]: string } = {
  monthly: "รายเดือน",
  weekly: "รายสัปดาห์",
  yearly: "รายปี",
};

export default function RecurringExpensesTable({
  recurringExpenses,
  formatCurrency,
  onApply,
  onEdit,
  onDelete,
  applyingId,
}: RecurringExpensesTableProps) {
  const getTypeConfig = (type: string) => {
    return (
      expenseTypes.find((t) => t.value === type) || expenseTypes[expenseTypes.length - 1]
    );
  };

  if (recurringExpenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        ไม่มีค่าใช้จ่ายประจำ
      </div>
    );
  }

  return (
    <>
      {/* Mobile Cards */}
      <div className="lg:hidden grid gap-4">
        {recurringExpenses.map((recurringExpense) => {
          const typeConfig = getTypeConfig(recurringExpense.type);
          const isApplying = applyingId === recurringExpense.id;

          return (
            <div
              key={recurringExpense.id}
              className="bg-gradient-to-br from-white to-purple-50/50 rounded-xl border border-purple-100 shadow-sm overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-purple-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl">{typeConfig.icon}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{typeConfig.label}</p>
                      <p className="text-xs text-gray-500">
                        {recurringExpense.dormitory.name}
                        {recurringExpense.room && ` • ห้อง ${recurringExpense.room.name}`}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      recurringExpense.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {recurringExpense.isActive ? "เปิดใช้งาน" : "ปิด"}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Description */}
                {recurringExpense.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {recurringExpense.description}
                  </p>
                )}

                {/* Amount & Frequency */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(recurringExpense.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {frequencyLabels[recurringExpense.frequency] || recurringExpense.frequency}
                    </p>
                    {recurringExpense.frequency === "monthly" && recurringExpense.dayOfMonth && (
                      <p className="text-xs text-gray-500">วันที่ {recurringExpense.dayOfMonth}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-3 bg-purple-50/50 border-t border-purple-100 flex gap-2">
                <button
                  onClick={() => onApply(recurringExpense)}
                  disabled={isApplying || !recurringExpense.isActive}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    recurringExpense.isActive
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  } disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  {isApplying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>กำลังสร้าง...</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Apply</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => onEdit(recurringExpense)}
                  className="px-4 py-2.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors font-medium"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(recurringExpense)}
                  className="px-4 py-2.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors font-medium"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-purple-50 border-b-2 border-purple-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                ประเภท
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                รายละเอียด
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                หอพัก/ห้อง
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                จำนวนเงิน
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                ความถี่
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900 uppercase tracking-wider">
                สถานะ
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-purple-900 uppercase tracking-wider">
                การจัดการ
              </th>
            </tr>
          </thead>
          <tbody>
            {recurringExpenses.map((recurringExpense, i) => {
              const typeConfig = getTypeConfig(recurringExpense.type);
              const isApplying = applyingId === recurringExpense.id;

              return (
                <tr
                  key={recurringExpense.id}
                  className={
                    "border-t border-purple-100 hover:bg-purple-50 transition-colors " +
                    (i % 2 === 0 ? "bg-white" : "bg-purple-25")
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
                        title={recurringExpense.description}
                      >
                        {recurringExpense.description || "-"}
                      </p>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div>
                      <p className="font-medium text-gray-900">
                        {recurringExpense.dormitory.name}
                      </p>
                      {recurringExpense.room && (
                        <p className="text-xs text-gray-500">
                          ห้อง {recurringExpense.room.name}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-semibold text-purple-600">
                      {formatCurrency(recurringExpense.amount)}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div>
                      <span className="font-medium text-gray-900">
                        {frequencyLabels[recurringExpense.frequency] || recurringExpense.frequency}
                      </span>
                      {recurringExpense.frequency === "monthly" &&
                        recurringExpense.dayOfMonth && (
                          <p className="text-xs text-gray-500">
                            วันที่ {recurringExpense.dayOfMonth}
                          </p>
                        )}
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        recurringExpense.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {recurringExpense.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onApply(recurringExpense)}
                        disabled={isApplying || !recurringExpense.isActive}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          recurringExpense.isActive
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                      >
                        {isApplying ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>กำลังสร้าง...</span>
                          </>
                        ) : (
                          <>
                            <span>✓</span>
                            <span>Apply</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => onEdit(recurringExpense)}
                        className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors font-medium flex items-center gap-1"
                      >
                        <span>✏️</span>
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => onDelete(recurringExpense)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors font-medium flex items-center gap-1"
                      >
                        <span>🗑️</span>
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

