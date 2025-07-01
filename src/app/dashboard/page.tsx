"use client";
import Navbar from "@/app/components/Navbar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Users,
  Building,
  DollarSign,
  FileText,
  AlertCircle,
  Home,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

interface DashboardStats {
  overview: {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    occupancyRate: string;
    totalTenants: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalBills: number;
    expiringContracts: number;
  };
  monthlyData: Array<{
    month: string;
    revenue: number;
    billCount: number;
  }>;
  revenueByType: {
    rent: number;
    water: number;
    electric: number;
    common: number;
    other: number;
  };
  topRooms: Array<{
    roomNumber: string;
    floor: string;
    revenue: number;
    billCount: number;
  }>;
  period: {
    month: number;
    year: number;
    monthName: string;
  };
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function DashboardPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [selectedMonth, selectedYear, auth.token]);

  const fetchDashboardStats = async () => {
    if (!auth.token) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/dashboard/stats?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error("Failed to fetch dashboard stats");
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "สวัสดีตอนเช้า";
    if (hour < 17) return "สวัสดีตอนบ่าย";
    return "สวัสดีตอนเย็น";
  };

  const generateMonthOptions = () => {
    const months = [];
    const currentYear = new Date().getFullYear();
    const thaiMonths = [
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

    for (let year = currentYear; year >= currentYear - 2; year--) {
      for (let month = 12; month >= 1; month--) {
        if (year === currentYear && month > new Date().getMonth() + 1) continue;
        months.push({
          value: `${month}-${year}`,
          label: `${thaiMonths[month - 1]} ${year}`,
          month,
          year,
        });
      }
    }
    return months;
  };

  const revenueChartData = stats?.revenueByType
    ? [
        { name: "ค่าเช่า", value: stats.revenueByType.rent, fill: COLORS[0] },
        { name: "ค่าน้ำ", value: stats.revenueByType.water, fill: COLORS[1] },
        { name: "ค่าไฟ", value: stats.revenueByType.electric, fill: COLORS[2] },
        {
          name: "ค่าส่วนกลาง",
          value: stats.revenueByType.common,
          fill: COLORS[3],
        },
        { name: "อื่นๆ", value: stats.revenueByType.other, fill: COLORS[4] },
      ].filter((item) => item.value > 0)
    : [];

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3 text-blue-600">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-lg">กำลังโหลดข้อมูล...</span>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {getGreeting()}, {auth.user?.name || "ผู้ใช้"}! 👋
                </h1>
                <p className="text-lg text-gray-600">
                  วันที่{" "}
                  {currentTime.toLocaleDateString("th-TH", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  เวลา{" "}
                  {currentTime.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Actions & Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Month Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowMonthPicker(!showMonthPicker)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white transition-all duration-200"
                  >
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">
                      {stats?.period.monthName || "เลือกเดือน"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {showMonthPicker && (
                    <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                      {generateMonthOptions().map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedMonth(option.month);
                            setSelectedYear(option.year);
                            setShowMonthPicker(false);
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                            selectedMonth === option.month &&
                            selectedYear === option.year
                              ? "bg-blue-100 text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={fetchDashboardStats}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm font-medium">รีเฟรช</span>
                </button>

                <Link
                  href="/dormitory"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Building className="w-4 h-4" />
                  จัดการหอพัก
                </Link>
              </div>
            </div>
          </div>

          {/* Overview Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                รายได้เดือนนี้
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.overview.monthlyRevenue || 0)}
              </p>
              <p className="text-sm text-gray-500">
                จาก {stats?.overview.totalBills || 0} บิล
              </p>
            </div>

            {/* Occupancy Rate */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                อัตราเข้าพัก
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats?.overview.occupancyRate || 0}%
              </p>
              <p className="text-sm text-gray-500">
                {stats?.overview.occupiedRooms || 0} /{" "}
                {stats?.overview.totalRooms || 0} ห้อง
              </p>
            </div>

            {/* Total Tenants */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                ผู้เช่าทั้งหมด
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {stats?.overview.totalTenants || 0}
              </p>
              <p className="text-sm text-gray-500">คน</p>
            </div>

            {/* Expiring Contracts */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                สัญญาใกล้หมดอายุ
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {stats?.overview.expiringContracts || 0}
              </p>
              <p className="text-sm text-gray-500">สัญญา (30 วันข้างหน้า)</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Trend Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  แนวโน้มรายได้ 6 เดือน
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats?.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "รายได้",
                    ]}
                    labelStyle={{ color: "#374151" }}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by Type Pie Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  รายได้ตามประเภท
                </h3>
              </div>
              {revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {revenueChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), ""]}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  ไม่มีข้อมูลรายได้ในเดือนนี้
                </div>
              )}
            </div>
          </div>

          {/* Bottom section will be added */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Revenue Rooms */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-600" />
                  ห้องรายได้สูงสุด
                </h3>
              </div>
              <div className="space-y-4">
                {stats?.topRooms && stats.topRooms.length > 0 ? (
                  stats.topRooms.map((room, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            ห้อง {room.roomNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            ชั้น {room.floor} • {room.billCount} บิล
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-600">
                          {formatCurrency(room.revenue)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    ไม่มีข้อมูลรายได้ในเดือนนี้
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Bills Chart */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  จำนวนบิลรายเดือน
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    formatter={(value: number) => [value, "บิล"]}
                    labelStyle={{ color: "#374151" }}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar
                    dataKey="billCount"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600" />
              การดำเนินการด่วน
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/dormitory"
                className="flex flex-col items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
              >
                <Building className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-blue-700">
                  จัดการห้อง
                </span>
              </Link>
              <Link
                href="/tenants"
                className="flex flex-col items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
              >
                <Users className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-green-700">
                  จัดการผู้เช่า
                </span>
              </Link>
              <button className="flex flex-col items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group">
                <FileText className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-purple-700">
                  รายงาน
                </span>
              </button>
              <button className="flex flex-col items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors group">
                <AlertCircle className="w-8 h-8 text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-orange-700">
                  แจ้งเตือน
                </span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
