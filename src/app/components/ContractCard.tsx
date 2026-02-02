interface ContractCardProps {
  contract: any;
  onEdit: (contract: any) => void;
  onDelete: (contract: any) => void;
  onPreview: (contractId: number) => void;
  onReceipt: (contractId: number) => void;
}

export default function ContractCard({
  contract,
  onEdit,
  onDelete,
  onPreview,
  onReceipt,
}: ContractCardProps) {
  const startDate = new Date(contract.startDate);
  const endDate = new Date(contract.endDate);
  const today = new Date();
  const isActive = today >= startDate && today <= endDate;
  const isExpired = today > endDate;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 lg:p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {contract.tenant?.name?.charAt(0) || "?"}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              {contract.tenant?.name || "ไม่ระบุ"}
            </h4>
            <p className="text-sm text-gray-500">
              {contract.tenant?.phone || "-"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isActive
                ? "bg-green-100 text-green-800"
                : isExpired
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {isActive
              ? "✅ กำลังใช้งาน"
              : isExpired
              ? "❌ หมดอายุ"
              : "⏳ ยังไม่เริ่ม"}
          </span>
        </div>
      </div>

      {/* Contract Details */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">วันที่เริ่ม:</span>
          <span className="font-medium">
            {contract.startDate?.slice(0, 10)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">วันที่สิ้นสุด:</span>
          <span className="font-medium">{contract.endDate?.slice(0, 10)}</span>
        </div>
        {contract.deposit && (
          <div className="flex justify-between">
            <span className="text-gray-600">มัดจำ:</span>
            <span className="font-medium text-green-600">
              {contract.deposit.toLocaleString()} บาท
            </span>
          </div>
        )}
        {contract.insurance && (
          <div className="flex justify-between">
            <span className="text-gray-600">ประกัน:</span>
            <span className="font-medium text-blue-600">
              {contract.insurance.toLocaleString()} บาท
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
          onClick={() => onPreview(contract.id)}
        >
          📄 ดู
        </button>
        <button
          className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
          onClick={() => onReceipt(contract.id)}
        >
          🧾 ใบเสร็จ
        </button>
        <button
          className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200"
          onClick={() => onEdit(contract)}
        >
          ✏️ แก้ไข
        </button>
        <button
          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
          onClick={() => onDelete(contract)}
        >
          🗑️ ลบ
        </button>
      </div>
    </div>
  );
}
