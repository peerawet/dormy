interface BillTableProps {
  bills: Array<{
    id: number;
    billDate: string;
    tenant: {
      name: string;
    };
    water: number;
    electric: number;
    common: number;
    other: number;
    rent: number;
    discount: number;
    total: number;
  }>;
  onEdit: (bill: any) => void;
  onDelete: (bill: any) => void;
}

export default function BillTable({ bills, onEdit, onDelete }: BillTableProps) {
  return (
    <div className="overflow-x-auto overflow-hidden rounded-xl">
      <table className="w-full min-w-max text-left border border-blue-100 text-sm">
        <thead>
          <tr className="bg-blue-100 text-blue-900">
            <th className="p-3 font-semibold whitespace-nowrap">วันที่บิล</th>
            <th className="p-3 font-semibold whitespace-nowrap">ชื่อผู้เช่า</th>
            <th className="p-3 font-semibold whitespace-nowrap">ค่าน้ำ</th>
            <th className="p-3 font-semibold whitespace-nowrap">ค่าไฟ</th>
            <th className="p-3 font-semibold whitespace-nowrap">ค่าส่วนกลาง</th>
            <th className="p-3 font-semibold whitespace-nowrap">อื่นๆ</th>
            <th className="p-3 font-semibold whitespace-nowrap">ค่าเช่า</th>
            <th className="p-3 font-semibold whitespace-nowrap">ส่วนลด</th>
            <th className="p-3 font-semibold whitespace-nowrap bg-blue-200">
              รวม
            </th>
            <th className="p-3 font-semibold whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill, index) => (
            <tr
              key={bill.id}
              className={
                "border-t border-blue-100 hover:bg-blue-50 transition-colors " +
                (index % 2 === 0 ? "bg-white" : "bg-blue-25")
              }
            >
              <td className="p-3 whitespace-nowrap">
                {bill.billDate?.slice(0, 10)}
              </td>
              <td className="p-3 whitespace-nowrap font-medium">
                {bill.tenant?.name || "ไม่ระบุ"}
              </td>
              <td className="p-3 text-right">{bill.water?.toLocaleString()}</td>
              <td className="p-3 text-right">
                {bill.electric?.toLocaleString()}
              </td>
              <td className="p-3 text-right">
                {bill.common?.toLocaleString()}
              </td>
              <td className="p-3 text-right">
                {(bill.other || 0).toLocaleString()}
              </td>
              <td className="p-3 text-right">{bill.rent?.toLocaleString()}</td>
              <td className="p-3 text-right text-green-600 font-medium">
                {(bill.discount || 0).toLocaleString()}
              </td>
              <td className="p-3 text-right font-bold text-blue-700 bg-blue-50">
                {bill.total?.toLocaleString()}
              </td>
              <td className="p-3 whitespace-nowrap">
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                    onClick={() =>
                      window.open(`/bill-receipt/${bill.id}`, "_blank")
                    }
                  >
                    📄 บิล
                  </button>
                  <button
                    className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                    onClick={() => onEdit(bill)}
                  >
                    ✏️ แก้ไข
                  </button>
                  <button
                    className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                    onClick={() => onDelete(bill)}
                  >
                    🗑️ ลบ
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
