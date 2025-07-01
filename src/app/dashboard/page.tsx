"use client";
import Navbar from "@/app/components/Navbar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock data - ในอนาคตจะดึงจาก API
  const mockStats = {
    totalRooms: 45,
    occupiedRooms: 38,
    availableRooms: 7,
    totalRevenue: 125000,
    monthlyRevenue: 42500,
    pendingBills: 12,
    overduePayments: 3,
    maintenanceRequests: 5,
  };

  const mockRecentActivities = [
    {
      id: 1,
      type: "payment",
      message: "ห้อง 201 ชำระค่าเช่าเดือนมกราคม",
      time: "2 ชั่วโมงที่แล้ว",
      icon: "💰",
    },
    {
      id: 2,
      type: "checkout",
      message: "ผู้เช่าห้อง 305 ย้ายออก",
      time: "5 ชั่วโมงที่แล้ว",
      icon: "📦",
    },
    {
      id: 3,
      type: "maintenance",
      message: "แจ้งซ่อมแอร์ห้อง 102",
      time: "1 วันที่แล้ว",
      icon: "🔧",
    },
    {
      id: 4,
      type: "checkin",
      message: "ผู้เช่าใหม่เข้าพักห้อง 205",
      time: "2 วันที่แล้ว",
      icon: "🏠",
    },
    {
      id: 5,
      type: "bill",
      message: "ออกบิลค่าเช่าประจำเดือน",
      time: "3 วันที่แล้ว",
      icon: "📋",
    },
  ];

  const mockUpcomingTasks = [
    {
      id: 1,
      task: "ตรวจสอบมิเตอร์น้ำ-ไฟ",
      dueDate: "วันนี้",
      priority: "high",
      icon: "⚡",
    },
    {
      id: 2,
      task: "ออกบิลค่าเช่าเดือนหน้า",
      dueDate: "2 วัน",
      priority: "medium",
      icon: "📄",
    },
    {
      id: 3,
      task: "ตรวจสอบระบบรักษาความปลอดภัย",
      dueDate: "1 สัปดาห์",
      priority: "low",
      icon: "🔒",
    },
    {
      id: 4,
      task: "ประชุมผู้เช่า",
      dueDate: "2 สัปดาห์",
      priority: "medium",
      icon: "👥",
    },
  ];

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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
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
              <div className="mt-4 md:mt-0">
                <Link
                  href="/dormitory"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <span className="text-lg">🏢</span>
                  จัดการหอพัก
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Rooms */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    ห้องพักทั้งหมด
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {mockStats.totalRooms}
                  </p>
                  <p className="text-sm text-gray-500">ห้อง</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl text-white">🏠</span>
                </div>
              </div>
            </div>

            {/* Occupied Rooms */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    ห้องที่มีผู้เช่า
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {mockStats.occupiedRooms}
                  </p>
                  <p className="text-sm text-green-500">
                    {(
                      (mockStats.occupiedRooms / mockStats.totalRooms) *
                      100
                    ).toFixed(1)}
                    % เต็ม
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl text-white">✅</span>
                </div>
              </div>
            </div>

            {/* Available Rooms */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    ห้องว่าง
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {mockStats.availableRooms}
                  </p>
                  <p className="text-sm text-orange-500">พร้อมให้เช่า</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl text-white">🏷️</span>
                </div>
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    รายได้เดือนนี้
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatCurrency(mockStats.monthlyRevenue)}
                  </p>
                  <p className="text-sm text-purple-500">
                    +12% จากเดือนที่แล้ว
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl text-white">💰</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  การดำเนินการด่วน
                </h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                    <span className="text-xl">📋</span>
                    <span className="font-medium text-blue-900">
                      สร้างบิลใหม่
                    </span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
                    <span className="text-xl">👤</span>
                    <span className="font-medium text-green-900">
                      เพิ่มผู้เช่าใหม่
                    </span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors">
                    <span className="text-xl">🔧</span>
                    <span className="font-medium text-orange-900">
                      แจ้งซ่อมบำรุง
                    </span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
                    <span className="text-xl">📊</span>
                    <span className="font-medium text-purple-900">
                      ดูรายงาน
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Alerts & Notifications */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🚨</span>
                  การแจ้งเตือนสำคัญ
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">⚠️</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-red-900">
                        ค่าเช่าค้างชำระ
                      </p>
                      <p className="text-sm text-red-700">
                        {mockStats.overduePayments} ห้อง ค้างชำระเกิน 7 วัน
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                      ดูรายละเอียด
                    </button>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">📋</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-900">
                        บิลรอดำเนินการ
                      </p>
                      <p className="text-sm text-yellow-700">
                        {mockStats.pendingBills} บิล รอการอนุมัติ
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors">
                      จัดการ
                    </button>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">🔧</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900">
                        คำขอซ่อมบำรุง
                      </p>
                      <p className="text-sm text-blue-700">
                        {mockStats.maintenanceRequests} รายการ รอดำเนินการ
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      ตรวจสอบ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities & Upcoming Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📈</span>
                กิจกรรมล่าสุด
              </h3>
              <div className="space-y-4">
                {mockRecentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">{activity.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full text-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  ดูกิจกรรมทั้งหมด →
                </button>
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📅</span>
                งานที่ต้องทำ
              </h3>
              <div className="space-y-4">
                {mockUpcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">{task.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{task.task}</p>
                      <p className="text-sm text-gray-500">
                        ครบกำหนด: {task.dueDate}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : task.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {task.priority === "high"
                        ? "ด่วน"
                        : task.priority === "medium"
                        ? "ปานกลาง"
                        : "ไม่ด่วน"}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full text-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  ดูงานทั้งหมด →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
