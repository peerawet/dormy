interface TenantTableProps {
  tenants: {
    id: number;
    name: string;
    phone: string;
    idCard?: string;
    address: string;
    rooms: {
      room: {
        id: number;
        name: string;
        dormitory: {
          id: number;
          name: string;
        };
      };
    }[];
  }[];
  onEdit: (tenant: TenantTableProps["tenants"][0]) => void;
  onDelete: (tenant: TenantTableProps["tenants"][0]) => void;
}

export default function TenantTable({
  tenants,
  onEdit,
  onDelete,
}: TenantTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-left border border-blue-100 rounded-xl overflow-hidden text-sm">
        <thead>
          <tr className="bg-blue-100 text-blue-900">
            <th className="p-3 font-semibold whitespace-nowrap">ชื่อ</th>
            <th className="p-3 font-semibold whitespace-nowrap">เบอร์โทร</th>
            <th className="p-3 font-semibold whitespace-nowrap">
              เลขบัตรประชาชน
            </th>
            <th className="p-3 font-semibold whitespace-nowrap">ที่อยู่</th>
            <th className="p-3 font-semibold whitespace-nowrap">ห้องที่เช่า</th>
            <th className="p-3 font-semibold whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant, i) => (
            <tr
              key={tenant.id}
              className={
                "border-t border-blue-100 hover:bg-blue-50 transition-colors " +
                (i % 2 === 0 ? "bg-white" : "bg-blue-25")
              }
            >
              <td className="p-3 whitespace-nowrap font-medium">
                {tenant.name}
              </td>
              <td className="p-3 whitespace-nowrap">{tenant.phone}</td>
              <td className="p-3 whitespace-nowrap">{tenant.idCard || "-"}</td>
              <td className="p-3 max-w-xs truncate">{tenant.address}</td>
              <td className="p-3">
                <div className="flex flex-wrap gap-1">
                  {tenant.rooms.map((tr, index) => (
                    <span
                      key={index}
                      className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium"
                    >
                      {tr.room.dormitory.name} - {tr.room.name}
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-3 whitespace-nowrap">
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                    onClick={() => onEdit(tenant)}
                  >
                    ✏️ แก้ไข
                  </button>
                  <button
                    className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                    onClick={() => onDelete(tenant)}
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
