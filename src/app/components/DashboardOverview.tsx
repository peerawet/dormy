import {
  Building,
  Users,
  DollarSign,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Home,
  FileText,
  Droplet,
  Zap,
} from "lucide-react";

interface Growth {
  change: number;
  percentage: number;
  isPositive: boolean;
}

interface CategoryExpense {
  amount: number;
  growth?: Growth | null;
}

interface DashboardOverviewProps {
  stats: {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    occupancyRate: string;
    totalTenants: number;

    monthlyRevenue: number;
    totalBills: number;
  };
  totalExpenses?: number;
  monthlyGrowth?: Growth | null;
  expenseGrowth?: Growth | null;
  waterExpense?: CategoryExpense;
  electricExpense?: CategoryExpense;
  formatCurrency: (amount: number) => string;
}

export default function DashboardOverview({
  stats,
  totalExpenses = 0,
  monthlyGrowth,
  expenseGrowth,
  waterExpense,
  electricExpense,
  formatCurrency,
}: DashboardOverviewProps) {
  const netProfit = stats.monthlyRevenue - totalExpenses;

  // Calculate net profit growth compared to previous month
  let profitGrowth: Growth | null = null;

  if (monthlyGrowth && expenseGrowth) {
    const prevRevenue = stats.monthlyRevenue - monthlyGrowth.change;
    const prevExpense = totalExpenses - expenseGrowth.change;
    const prevProfit = prevRevenue - prevExpense;
    if (prevProfit !== 0) {
      const change = netProfit - prevProfit;
      profitGrowth = {
        change,
        percentage: (change / prevProfit) * 100,
        isPositive: change >= 0,
      };
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {/* Monthly Revenue */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          {monthlyGrowth?.isPositive ? (
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
          )}
        </div>
        <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
          รายได้เดือนนี้
        </p>
        <p className="text-lg md:text-2xl font-bold text-green-600">
          {formatCurrency(stats.monthlyRevenue)}
        </p>
        {monthlyGrowth && (
          <p
            className={`text-xs ${
              monthlyGrowth.isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {monthlyGrowth.isPositive ? "+" : ""}
            {monthlyGrowth.percentage.toFixed(1)}% จากเดือนก่อน
          </p>
        )}
      </div>

      {/* Monthly Expenses */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
            <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          {expenseGrowth?.isPositive ? (
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
          ) : (
            <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
          )}
        </div>
        <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
          ค่าใช้จ่ายเดือนนี้
        </p>
        <p className="text-lg md:text-2xl font-bold text-red-600">
          {formatCurrency(totalExpenses)}
        </p>
        {expenseGrowth && (
          <p
            className={`text-xs ${
              expenseGrowth.isPositive ? "text-red-500" : "text-green-500"
            }`}
          >
            {expenseGrowth.isPositive ? "+" : "-"}
            {Math.abs(expenseGrowth.percentage).toFixed(1)}% จากเดือนก่อน
          </p>
        )}
      </div>

      {/* Water Expense */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center">
            <Droplet className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          {waterExpense?.growth?.isPositive ? (
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-cyan-600" />
          ) : (
            <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-cyan-600" />
          )}
        </div>
        <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
          ค่าน้ำเดือนนี้
        </p>
        <p className="text-lg md:text-2xl font-bold text-cyan-600">
          {formatCurrency(waterExpense?.amount || 0)}
        </p>
        {waterExpense?.growth && (
          <p
            className={`text-xs ${
              waterExpense.growth.isPositive ? "text-cyan-500" : "text-red-500"
            }`}
          >
            {waterExpense.growth.isPositive ? "+" : "-"}
            {Math.abs(waterExpense.growth.percentage).toFixed(1)}% จากเดือนก่อน
          </p>
        )}
      </div>

      {/* Electric Expense */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center">
            <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          {electricExpense?.growth?.isPositive ? (
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
          ) : (
            <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
          )}
        </div>
        <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
          ค่าไฟเดือนนี้
        </p>
        <p className="text-lg md:text-2xl font-bold text-yellow-600">
          {formatCurrency(electricExpense?.amount || 0)}
        </p>
        {electricExpense?.growth && (
          <p
            className={`text-xs ${
              electricExpense.growth.isPositive
                ? "text-yellow-500"
                : "text-red-500"
            }`}
          >
            {electricExpense.growth.isPositive ? "+" : "-"}
            {Math.abs(electricExpense.growth.percentage).toFixed(1)}%
            จากเดือนก่อน
          </p>
        )}
      </div>

      {/* Net Profit */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${
              netProfit >= 0
                ? "from-emerald-500 to-emerald-600"
                : "from-orange-500 to-orange-600"
            } rounded-2xl flex items-center justify-center`}
          >
            {netProfit >= 0 ? (
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
            ) : (
              <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-white" />
            )}
          </div>
          {netProfit >= 0 ? (
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
          ) : (
            <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
          )}
        </div>
        <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
          กำไรสุทธิ
        </p>
        <p
          className={`text-lg md:text-2xl font-bold ${
            netProfit >= 0 ? "text-emerald-600" : "text-orange-600"
          }`}
        >
          {formatCurrency(netProfit)}
        </p>
        <p className="text-xs text-gray-500">รายได้ - ค่าใช้จ่าย</p>
        {profitGrowth && (
          <p
            className={`text-xs ${
              profitGrowth.isPositive ? "text-emerald-500" : "text-orange-500"
            }`}
          >
            {profitGrowth.isPositive ? "+" : "-"}
            {Math.abs(profitGrowth.percentage).toFixed(1)}% จากเดือนก่อน
          </p>
        )}
      </div>

      {/* Occupancy Rate */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center">
            <Home className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <Building className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
        </div>
        <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
          อัตราการเช่า
        </p>
        <p className="text-lg md:text-2xl font-bold text-indigo-600">
          {stats.occupancyRate}
        </p>
        <p className="text-xs text-gray-500">
          {stats.occupiedRooms} / {stats.totalRooms} ห้อง
        </p>
      </div>

      {/* Total Tenants */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
        </div>
        <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
          ผู้เช่าทั้งหมด
        </p>
        <p className="text-lg md:text-2xl font-bold text-purple-600">
          {stats.totalTenants}
        </p>
        <p className="text-xs text-gray-500">คน</p>
      </div>

      {/* Available Rooms */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center">
            <Building className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <Home className="w-4 h-4 md:w-5 md:h-5 text-cyan-600" />
        </div>
        <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
          ห้องว่าง
        </p>
        <p className="text-lg md:text-2xl font-bold text-cyan-600">
          {stats.availableRooms}
        </p>
        <p className="text-xs text-gray-500">ห้อง</p>
      </div>
    </div>
  );
}
