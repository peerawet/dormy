interface BillCardProps {
  bill: {
    id: number;
    billDate: string;
    tenant: {
      name: string;
    };
    total: number;
    rent: number;
    water: number;
    electric: number;
    common: number;
    other: number;
    discount: number;
  };
  onEdit: (bill: any) => void;
  onDelete: (bill: any) => void;
}

export default function BillCard({ bill, onEdit, onDelete }: BillCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {bill.tenant?.name?.charAt(0) || "?"}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              {bill.tenant?.name || "ไม่ระบุ"}
            </h4>
            <p className="text-sm text-gray-500">
              {bill.billDate?.slice(0, 10)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            ฿{bill.total?.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">รวมทั้งหมด</div>
        </div>
      </div>

      {/* Bill Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">ค่าเช่า:</span>
          <span className="font-medium">฿{bill.rent?.toLocaleString()}</span>
        </div>
        {bill.water > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">ค่าน้ำ:</span>
            <span className="font-medium">฿{bill.water?.toLocaleString()}</span>
          </div>
        )}
        {bill.electric > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">ค่าไฟ:</span>
            <span className="font-medium">
              ฿{bill.electric?.toLocaleString()}
            </span>
          </div>
        )}
        {bill.common > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">ค่าส่วนกลาง:</span>
            <span className="font-medium">
              ฿{bill.common?.toLocaleString()}
            </span>
          </div>
        )}
        {bill.other > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">อื่นๆ:</span>
            <span className="font-medium">฿{bill.other?.toLocaleString()}</span>
          </div>
        )}
        {bill.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">ส่วนลด:</span>
            <span className="font-medium text-green-600">
              -฿{bill.discount?.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <button
          className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
          onClick={() => window.open(`/bill-receipt/${bill.id}`, "_blank")}
        >
          📄 ใบเสร็จ
        </button>
        <button
          className="flex-1 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm hover:bg-yellow-100 transition-colors flex items-center justify-center gap-1"
          onClick={() => onEdit(bill)}
        >
          ✏️ แก้ไข
        </button>
        <button
          className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100 transition-colors flex items-center justify-center"
          onClick={() => onDelete(bill)}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
