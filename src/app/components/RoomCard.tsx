import Link from "next/link";

interface RoomCardProps {
  room: any;
  onEditRoom: (room: any) => void;
}

export default function RoomCard({ room, onEditRoom }: RoomCardProps) {
  // Determine room status
  const tenants = room.tenantRooms || [];
  const contracts = room.rentalContracts || [];
  const activeContracts = contracts.filter((c: any) => {
    const today = new Date();
    return today >= new Date(c.startDate) && today <= new Date(c.endDate);
  });
  const expiringContracts = contracts.filter((c: any) => {
    const today = new Date();
    const daysLeft = Math.ceil(
      (new Date(c.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft > 0 && daysLeft <= 30;
  });

  const isOccupied = tenants.length > 0;

  return (
    <div className="group/room bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white">
          🏠
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-800">{room.name}</h4>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                isOccupied
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isOccupied ? "🟢 มีผู้เช่า" : "⚪ ว่าง"}
            </span>
            {expiringContracts.length > 0 && (
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                ⚠️ ใกล้หมดสัญญา
              </span>
            )}
          </div>
        </div>
      </div>

      {isOccupied && (
        <div className="mb-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-blue-800">
            👥 ผู้เช่า ({tenants.length})
          </div>
          <div className="space-y-1 text-sm text-gray-700">
            {tenants.slice(0, 2).map((tr: any, idx: number) => (
              <div key={idx}>• {tr.tenant?.name || "ไม่ระบุชื่อ"}</div>
            ))}
            {tenants.length > 2 && (
              <div className="text-gray-500">
                และอีก {tenants.length - 2} คน
              </div>
            )}
          </div>
          {contracts.length > 0 && (
            <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-blue-600">
              สัญญาหมดอายุ:{" "}
              {new Date(contracts[0].endDate).toLocaleDateString("th-TH")}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 mb-6 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">ค่าเช่า/เดือน</span>
          <span className="font-bold text-green-600">
            ฿{room.price?.toLocaleString()}
          </span>
        </div>
        {room.waterRate && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">ค่าน้ำ/หน่วย</span>
            <span>{room.waterRate} ฿</span>
          </div>
        )}
        {room.electricRate && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">ค่าไฟ/หน่วย</span>
            <span>{room.electricRate} ฿</span>
          </div>
        )}
        {room.deposit && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">ค่ามัดจำ</span>
            <span className="text-yellow-600">
              ฿{room.deposit.toLocaleString()}
            </span>
          </div>
        )}
        {room.insurance && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">ค่าประกัน</span>
            <span className="text-red-600">
              ฿{room.insurance.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Link
          href={`/dormitory/${room.id}`}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-center py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105"
        >
          📋 จัดการห้อง
        </Link>
        <button
          onClick={() => onEditRoom(room)}
          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-2 rounded-lg transition-all duration-300 hover:shadow-md text-sm"
        >
          ✏️
        </button>
      </div>
    </div>
  );
}
