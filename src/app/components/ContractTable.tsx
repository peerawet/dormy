interface ContractTableProps {
  contracts: any[];
  onEdit: (contract: any) => void;
  onDelete: (contract: any) => void;
  onPreview: (id: number) => void;
  onReceipt: (id: number) => void;
}

export default function ContractTable({
  contracts,
  onEdit,
  onDelete,
  onPreview,
  onReceipt,
}: ContractTableProps) {
  const today = new Date();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-left border border-blue-100 rounded-xl overflow-hidden text-sm">
        <thead>
          <tr className="bg-blue-100 text-blue-900">
            <th className="p-3 font-semibold">ชื่อผู้เช่า</th>
            <th className="p-3 font-semibold">เบอร์โทร</th>
            <th className="p-3 font-semibold">เริ่ม</th>
            <th className="p-3 font-semibold">สิ้นสุด</th>
            <th className="p-3 font-semibold">มัดจำ</th>
            <th className="p-3 font-semibold">ประกัน</th>
            <th className="p-3 font-semibold">สถานะ</th>
            <th className="p-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract: any, index) => {
            const start = new Date(contract.startDate);
            const end = new Date(contract.endDate);
            const isActive = today >= start && today <= end;
            const isExpired = today > end;
            return (
              <tr
                key={contract.id}
                className={`border-t border-blue-100 hover:bg-blue-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-blue-25"
                }`}
              >
                <td className="p-3 font-medium whitespace-nowrap">
                  {contract.tenant?.name || "ไม่ระบุ"}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {contract.tenant?.phone || "-"}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {contract.startDate?.slice(0, 10)}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {contract.endDate?.slice(0, 10)}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {contract.deposit
                    ? `${contract.deposit.toLocaleString()} บาท`
                    : "-"}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {contract.insurance
                    ? `${contract.insurance.toLocaleString()} บาท`
                    : "-"}
                </td>
                <td className="p-3 whitespace-nowrap">
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
                </td>
                <td className="p-3 whitespace-nowrap">
                  <div className="flex gap-1 flex-wrap">
                    <button
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                      onClick={() => onPreview(contract.id)}
                    >
                      📄 ดู
                    </button>
                    <button
                      className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                      onClick={() => onReceipt(contract.id)}
                    >
                      🧾 ใบเสร็จ
                    </button>
                    <button
                      className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                      onClick={() => onEdit(contract)}
                    >
                      ✏️ แก้ไข
                    </button>
                    <button
                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                      onClick={() => onDelete(contract)}
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
