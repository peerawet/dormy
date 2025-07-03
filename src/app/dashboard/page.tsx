"use client";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  fetchAllDashboardData,
  refreshDashboard,
  setSelectedMonth,
  setSelectedYear,
} from "@/store/dashboardSlice";
import Navbar from "@/app/components/Navbar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import DashboardOverview from "../components/DashboardOverview";
import RevenueChart from "../components/RevenueChart";
import TopRoomsCard from "../components/TopRoomsCard";
import ExpiringContractsCard from "../components/ExpiringContractsCard";
import RecentExpensesCard from "../components/RecentExpensesCard";
import ExpensePieChart from "../components/ExpensePieChart";
import ExpenseTrendChart from "../components/ExpenseTrendChart";
import RevenuePieChart from "../components/RevenuePieChart";
import {
  RefreshCw,
  Calendar,
  TrendingUp,
  Building,
  Users,
  AlertCircle,
  FileText,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const {
    stats,
    monthlyData,
    topRooms,
    expiringContracts,
    recentExpenses,
    expenseData,
    totalExpenses,
    monthlyGrowth,
    expenseMonthlyGrowth,
    selectedMonth,
    selectedYear,
    loading,
    error,
    waterExpense,
    electricExpense,
    monthlyExpenses,
    revenueData,
    revenue6Data,
    expense6Data,
  } = useSelector((state: RootState) => state.dashboard);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token) return; // Don't fetch if no token
    dispatch(
      fetchAllDashboardData({ token, month: selectedMonth, year: selectedYear })
    );
  }, [dispatch, token, selectedMonth, selectedYear]);

  const handleRefresh = () => {
    if (!token) return;
    dispatch(
      refreshDashboard({ token, month: selectedMonth, year: selectedYear })
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("th-TH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const currentYearVal = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYearVal - 3 + i);

  if (loading || !stats) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <div className="ml-4 text-lg text-gray-600">
                {loading ? "กำลังโหลดข้อมูล..." : "เตรียมข้อมูล..."}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                แดชบอร์ด
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(currentTime)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(currentTime)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <select
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring"
                value={selectedMonth}
                onChange={(e) =>
                  dispatch(setSelectedMonth(Number(e.target.value)))
                }
              >
                {monthNames.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring"
                value={selectedYear}
                onChange={(e) =>
                  dispatch(setSelectedYear(Number(e.target.value)))
                }
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y + 543}
                  </option>
                ))}
              </select>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>รีเฟรช</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Welcome Message */}
          <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  ยินดีต้อนรับ, {user?.name || "ผู้ใช้"}!
                </h2>
                <p className="text-gray-600">
                  นี่คือภาพรวมของระบบจัดการหอพักของคุณ
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Overview */}
          <DashboardOverview
            stats={stats}
            totalExpenses={totalExpenses}
            monthlyGrowth={monthlyGrowth}
            expenseGrowth={expenseMonthlyGrowth}
            waterExpense={waterExpense}
            electricExpense={electricExpense}
            formatCurrency={formatCurrency}
          />

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
            {/* Revenue Trend - take half width on xl */}
            <div className="xl:col-span-6">
              <RevenueChart
                data={monthlyData}
                formatCurrency={formatCurrency}
                title="รายได้รายเดือน"
                subtitle="แสดงรายได้ในช่วง 6 เดือนที่ผ่านมา"
              />
            </div>

            {/* Expense Trend - take half width on xl */}
            <div className="xl:col-span-6">
              <ExpenseTrendChart
                data={monthlyExpenses}
                formatCurrency={formatCurrency}
                title="ค่าใช้จ่ายรายเดือน"
                subtitle="แสดงค่าใช้จ่ายในช่วง 6 เดือนที่ผ่านมา"
              />
            </div>
          </div>

          {/* Proportion Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {/* Revenue Proportion Current Month */}
            <div>
              <RevenuePieChart
                data={revenueData}
                formatCurrency={formatCurrency}
                title="สัดส่วนรายได้"
                subtitle="สัดส่วนรายได้ตามประเภท"
              />
            </div>

            {/* Expense Proportion Current Month */}
            <div>
              <ExpensePieChart
                data={expenseData}
                formatCurrency={formatCurrency}
                title="สัดส่วนค่าใช้จ่าย"
                subtitle="แสดงสัดส่วนค่าใช้จ่ายตามประเภท"
              />
            </div>

            {/* Revenue Proportion 6 Months */}
            <div>
              <RevenuePieChart
                data={revenue6Data}
                formatCurrency={formatCurrency}
                title="สัดส่วนรายได้ 6 เดือน"
                subtitle="สัดส่วนรายได้ตามประเภทในช่วง 6 เดือนที่ผ่านมา"
              />
            </div>

            {/* Expense Proportion 6 Months */}
            <div>
              <ExpensePieChart
                data={expense6Data}
                formatCurrency={formatCurrency}
                title="สัดส่วนค่าใช้จ่าย 6 เดือน"
                subtitle="สัดส่วนค่าใช้จ่ายตามประเภทในช่วง 6 เดือนที่ผ่านมา"
              />
            </div>
          </div>

          {/* Information Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Top Rooms */}
            <TopRoomsCard
              rooms={topRooms}
              formatCurrency={formatCurrency}
              title="ห้องที่ทำรายได้สูงสุด"
              subtitle="5 ห้องที่มีรายได้สูงสุด"
            />

            {/* Expiring Contracts */}
            <ExpiringContractsCard
              contracts={expiringContracts}
              title="สัญญาใกล้หมดอายุ"
              subtitle="สัญญาที่จะหมดอายุใน 30 วันข้างหน้า"
            />

            {/* Recent Expenses */}
            <RecentExpensesCard
              expenses={recentExpenses}
              formatCurrency={formatCurrency}
              title="ค่าใช้จ่ายล่าสุด"
              subtitle="ค่าใช้จ่ายล่าสุด 5 รายการ"
            />
          </div>

          {/* Quick Stats Footer */}
          <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalRooms}
                  </p>
                  <p className="text-sm text-gray-600">ห้องทั้งหมด</p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.totalTenants}
                  </p>
                  <p className="text-sm text-gray-600">ผู้เช่าทั้งหมด</p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.totalBills}
                  </p>
                  <p className="text-sm text-gray-600">บิลทั้งหมด</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
