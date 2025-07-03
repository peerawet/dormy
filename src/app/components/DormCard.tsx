import RoomCardList from "./RoomCardList";

interface DormCardProps {
  dorm: any;
  onEditDorm: (dorm: any) => void;
  onAddRoom: (dormId: number) => void;
  onEditRoom: (room: any, dormId: number) => void;
}

export default function DormCard({
  dorm,
  onEditDorm,
  onAddRoom,
  onEditRoom,
}: DormCardProps) {
  return (
    <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500 mt-8">
      {/* Dorm Header */}
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm px-8 py-6 border-b border-white/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg">
              🏢
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {dorm.name}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <span>📍</span>
                <span>{dorm.address}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onEditDorm(dorm)}
            className="inline-flex items-center gap-2 bg-white/80 hover:bg-white text-blue-600 border-2 border-blue-200 hover:border-blue-300 px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
          >
            ✏️ แก้ไขหอพัก
          </button>
        </div>
      </div>

      {/* Rooms Section */}
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-800">ห้องพัก</h3>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              {(dorm.rooms || []).length} ห้อง
            </span>
          </div>
          <button
            onClick={() => onAddRoom(dorm.id)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            ➕ เพิ่มห้องพัก
          </button>
        </div>
        {(dorm.rooms || []).length === 0 ? (
          <div className="text-center py-12 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
            <div className="text-4xl mb-3">🏠</div>
            <p className="text-gray-500">ยังไม่มีห้องพัก</p>
            <button
              onClick={() => onAddRoom(dorm.id)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              เพิ่มห้องพักแรก
            </button>
          </div>
        ) : (
          <RoomCardList
            rooms={dorm.rooms}
            dormitoryId={dorm.id}
            onEditRoom={onEditRoom}
          />
        )}
      </div>
    </div>
  );
}
