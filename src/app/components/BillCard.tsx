import { useRef } from "react";

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
    isPaid: boolean;
    slipUrl?: string | null;
  };
  onEdit: (bill: any) => void;
  onDelete: (bill: any) => void;
  onTogglePaid: (bill: any) => void;
  onUploadSlip?: (bill: any, file: File) => void;
}

export default function BillCard({ bill, onEdit, onDelete, onTogglePaid, onUploadSlip }: BillCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadSlip) {
      onUploadSlip(bill, file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`bg-white border rounded-xl p-3 lg:p-6 shadow-sm hover:shadow-md transition-shadow ${bill.isPaid ? 'border-green-200' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bill.isPaid ? 'bg-green-100' : 'bg-blue-100'}`}>
            <span className={`font-semibold ${bill.isPaid ? 'text-green-600' : 'text-blue-600'}`}>
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
          <div className={`text-lg font-bold ${bill.isPaid ? 'text-green-600' : 'text-blue-600'}`}>
            ฿{bill.total?.toLocaleString()}
          </div>
          {/* Payment Status Badge */}
          <button
            onClick={() => onTogglePaid(bill)}
            className={`mt-1 px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${
              bill.isPaid
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            {bill.isPaid ? '✓ ชำระแล้ว' : '○ ยังไม่ชำระ'}
          </button>
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
          {bill.slipUrl ? (
            <div className="flex items-center gap-2">
              <a
                href={bill.slipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
              >
                📎 ดูสลิป
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
              📤 อัปโหลดสลิป
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className={`flex gap-2 pt-4 border-t border-gray-100 ${!onUploadSlip ? '' : ''}`}>
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
