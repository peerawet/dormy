import { Trophy, Building, Crown } from "lucide-react";

interface Room {
  id: string;
  name: string;
  totalRevenue: number;
  dormitoryName: string;
  change?: number;
  percentage?: number | null;
}

interface TopRoomsCardProps {
  rooms: Room[];
  formatCurrency: (amount: number) => string;
  title: string;
  subtitle: string;
}

export default function TopRoomsCard({
  rooms,
  formatCurrency,
  title,
  subtitle,
}: TopRoomsCardProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Trophy className="w-5 h-5 text-amber-600" />;
      default:
        return <Building className="w-5 h-5 text-blue-500" />;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-400 to-yellow-500";
      case 1:
        return "bg-gradient-to-r from-gray-300 to-gray-400";
      case 2:
        return "bg-gradient-to-r from-amber-500 to-amber-600";
      default:
        return "bg-gradient-to-r from-blue-500 to-blue-600";
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="space-y-4">
        {rooms.map((room, index) => (
          <div
            key={room.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 ${getRankColor(
                  index
                )} rounded-full flex items-center justify-center`}
              >
                <span className="text-white font-bold text-sm">
                  {index + 1}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{room.name}</p>
                <p className="text-sm text-gray-600">{room.dormitoryName}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                {getRankIcon(index)}
                <span className="font-bold text-gray-900">
                  {formatCurrency(room.totalRevenue)}
                </span>
                {room.percentage !== null && room.percentage !== undefined && (
                  <span
                    className={`text-xs ${
                      room.percentage >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {room.percentage >= 0 ? "+" : ""}
                    {room.percentage.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">
              รวมรายได้ท็อป 5
            </span>
          </div>
          <span className="text-lg font-bold text-yellow-600">
            {formatCurrency(
              rooms.reduce((sum, room) => sum + room.totalRevenue, 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
