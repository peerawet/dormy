import { AlertCircle, Calendar, Clock } from "lucide-react";

interface ExpiringContractsCardProps {
  contracts: {
    id: string;
    tenantName: string;
    roomName: string;
    dormitoryName: string;
    endDate: string;
    daysLeft: number;
  }[];
  title: string;
  subtitle: string;
}

export default function xpiringContractsCard({
  contracts,
  title,
  subtitle,
}: ExpiringContractsCardProps) {
  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 7) return "bg-red-100 text-red-800 border-red-200";
    if (daysLeft <= 14)
      return "bg-orange-100 text-orange-800 border-orange-200";
    if (daysLeft <= 21)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getUrgencyIcon = (daysLeft: number) => {
    if (daysLeft <= 7) return <AlertCircle className="w-4 h-4 text-red-600" />;
    if (daysLeft <= 14) return <Clock className="w-4 h-4 text-orange-600" />;
    if (daysLeft <= 21) return <Calendar className="w-4 h-4 text-yellow-600" />;
    return <Calendar className="w-4 h-4 text-blue-600" />;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="space-y-4">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {contract.tenantName}
                </p>
                <p className="text-sm text-gray-600">
                  {contract.roomName} - {contract.dormitoryName}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                {getUrgencyIcon(contract.daysLeft)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                หมดอายุ: {formatDate(contract.endDate)}
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(
                  contract.daysLeft
                )}`}
              >
                {contract.daysLeft} วัน
              </span>
            </div>
          </div>
        ))}
      </div>

      {contracts.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">ไม่มีสัญญาใกล้หมดอายุ</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-orange-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">
              ต้องดูแล
            </span>
          </div>
          <span className="text-lg font-bold text-orange-600">
            {contracts.length} สัญญา
          </span>
        </div>
      </div>
    </div>
  );
}
