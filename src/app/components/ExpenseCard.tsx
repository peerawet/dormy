import { useRef } from "react";
import { Expense } from "@/store/expenseSlice";

interface ExpenseCardProps {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
  onUploadSlip?: (expense: Expense, file: File) => void;
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
  onUploadSlip,
}: ExpenseCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadSlip) {
      onUploadSlip(expense, file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

      {/* Slip Section */}
      {onUploadSlip && (
        <div className="mb-4 pt-4 border-t border-gray-100">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          {expense.slipUrl ? (
            <div className="flex items-center gap-2">
              <a
                href={expense.slipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
              >
                📎 ดูใบเสร็จ
              </a>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
              >
                🔄
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-3 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-1 border border-dashed border-gray-300"
            >
              📤 อัปโหลดใบเสร็จ
            </button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
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
