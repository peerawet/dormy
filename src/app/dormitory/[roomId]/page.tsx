"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  fetchRoomDetail,
  setActiveTab,
  clearRoomData,
} from "@/store/roomSlice";
import ContractTab from "./ContractTab";
import BillTab from "./BillTab";

// Utility function to format Thai date
const formatThaiDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    return "เมื่อสักครู่";
  } else if (diffInHours < 24) {
    return `${diffInHours} ชั่วโมงที่แล้ว`;
  } else if (diffInDays === 1) {
    return "เมื่อวาน";
  } else if (diffInDays < 7) {
    return `${diffInDays} วันที่แล้ว`;
  } else {
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
};

// Function to calculate room status
const calculateRoomStatus = (room: any) => {
  if (!room) return null;

  const tenants = room.tenantRooms || [];
  const contracts = room.rentalContracts || [];
  const today = new Date();

  // Check for active contracts
  const activeContracts = contracts.filter((contract: any) => {
    const start = new Date(contract.startDate);
    const end = new Date(contract.endDate);
    return today >= start && today <= end;
  });

  // Check for expiring contracts (within 30 days)
  const expiringContracts = contracts.filter((contract: any) => {
    const end = new Date(contract.endDate);
    const daysLeft = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft > 0 && daysLeft <= 30;
  });

  const isOccupied = tenants.length > 0;
  const hasActiveContract = activeContracts.length > 0;
  const hasExpiringContract = expiringContracts.length > 0;

  if (hasExpiringContract) {
    const daysLeft = Math.ceil(
      (new Date(expiringContracts[0].endDate).getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return {
      status: "expiring",
      text: `สัญญาหมดอายุใน ${daysLeft} วัน`,
      color: "orange",
      icon: "⚠️",
    };
  }

  if (isOccupied && hasActiveContract) {
    return {
      status: "occupied",
      text: "มีผู้เช่าอยู่",
      color: "red",
      icon: "🏠",
    };
  }

  if (isOccupied && !hasActiveContract) {
    return {
      status: "occupied_no_contract",
      text: "มีผู้เช่า (ไม่มีสัญญา)",
      color: "yellow",
      icon: "⚠️",
    };
  }

  return {
    status: "available",
    text: "พร้อมให้เช่า",
    color: "green",
    icon: "✅",
  };
};

export default function RoomDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const {
    currentRoom: room,
    currentDormitory: dorm,
    loading,
    error,
    activeTab,
  } = useSelector((state: RootState) => state.room);
  const router = useRouter();

  // State for collapsible section
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  // Calculate room status
  const roomStatus = room ? calculateRoomStatus(room) : null;

  const { roomId } = useParams();
  useEffect(() => {
    if (auth.token && roomId) {
      dispatch(fetchRoomDetail({ roomId: String(roomId), token: auth.token }));
    }
  }, [roomId, auth.token, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearRoomData());
    };
  }, [dispatch]);

  // Auth check
  if (!auth.token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-white/50">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            กรุณาเข้าสู่ระบบก่อน
          </h2>
          <p className="text-gray-600 mb-6">เพื่อเข้าถึงข้อมูลห้องพัก</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <span>🔑</span>
            <span>เข้าสู่ระบบ</span>
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-white/50">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            กำลังโหลดข้อมูลห้องพัก
          </h2>
          <p className="text-gray-600">โปรดรอสักครู่...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-white/50 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            เกิดข้อผิดพลาด
          </h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <span>🔄</span>
            <span>ลองใหม่</span>
          </button>
        </div>
      </div>
    );
  }

  // Room not found
  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-white/50">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            ไม่พบข้อมูลห้องพัก
          </h2>
          <p className="text-gray-600 mb-6">
            ห้องพักที่คุณต้องการไม่มีอยู่ในระบบ
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <span>🔙</span>
            <span>กลับหน้าหลัก</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <Navbar />

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto py-8 px-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
            >
              <span>🔙</span>
              <span>ย้อนกลับ</span>
            </button>
            <div className="inline-flex items-center gap-2 bg-blue-100/80 backdrop-blur-sm text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200/50">
              <span>🏠</span>
              <span>รายละเอียดห้องพัก</span>
            </div>
          </div>
        </div>

        {/* Room Information Card */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
            {/* Room Header */}
            <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm px-8 py-6 border-b border-white/50">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg">
                    🏠
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-800">
                        {room.name}
                      </h1>
                    </div>
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-700">
                      ฿{room.price?.toLocaleString()}/เดือน
                    </div>
                  </div>
                </div>

                {/* Room Status Badge */}
                <div className="flex flex-col gap-2">
                  {roomStatus && (
                    <div
                      className={`px-4 py-2 rounded-xl font-semibold text-center ${
                        roomStatus.color === "green"
                          ? "bg-green-100 text-green-700"
                          : roomStatus.color === "red"
                          ? "bg-red-100 text-red-700"
                          : roomStatus.color === "yellow"
                          ? "bg-yellow-100 text-yellow-700"
                          : roomStatus.color === "orange"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span className="mr-2">{roomStatus.icon}</span>
                      {roomStatus.text}
                    </div>
                  )}

                  {/* Current Tenants Info */}
                  {room.tenantRooms && room.tenantRooms.length > 0 && (
                    <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3">
                      <div className="text-xs font-medium text-blue-800 mb-1 flex items-center gap-1">
                        <span>👥</span>
                        <span>ผู้เช่าปัจจุบัน ({room.tenantRooms.length})</span>
                      </div>
                      <div className="space-y-1">
                        {room.tenantRooms.slice(0, 2).map((tenantRoom, idx) => (
                          <div key={idx} className="text-xs text-blue-700">
                            • {tenantRoom.tenant.name}
                          </div>
                        ))}
                        {room.tenantRooms.length > 2 && (
                          <div className="text-xs text-blue-600">
                            และอีก {room.tenantRooms.length - 2} คน
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-600 text-center">
                    อัปเดตล่าสุด:{" "}
                    {room.updatedAt
                      ? formatThaiDate(room.updatedAt)
                      : "ไม่ระบุ"}
                  </div>
                </div>
              </div>
            </div>

            {/* Room Details Grid - Collapsible */}
            <div className="p-8">
              <div
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50/50 -mx-2 px-2 py-2 rounded-lg transition-colors duration-200"
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              >
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span>💰</span>
                  <span>รายละเอียดค่าเช่าห้อง</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {isDetailsExpanded ? "หุบ" : "ขยาย"}
                  </span>
                  <div
                    className={`transform transition-transform duration-200 ${
                      isDetailsExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Collapsible Content */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isDetailsExpanded
                    ? "max-h-[2000px] opacity-100 mt-6"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Base Rent */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-6 border border-green-200/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                        🏠
                      </div>
                      <div>
                        <div className="text-sm text-green-700 font-medium">
                          ค่าเช่าห้อง
                        </div>
                        <div className="text-xl font-bold text-green-800">
                          ฿{room.price?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-green-600">รายเดือน</div>
                  </div>

                  {/* Water */}
                  {(room.waterRate || room.waterFlat) && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                          💧
                        </div>
                        <div>
                          <div className="text-sm text-blue-700 font-medium">
                            ค่าน้ำ
                          </div>
                          <div className="text-xl font-bold text-blue-800">
                            {room.waterFlat
                              ? `฿${room.waterFlat.toLocaleString()}`
                              : `฿${Number(room.waterRate).toFixed(2)}/หน่วย`}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-blue-600">
                        {room.waterFlat ? "เหมาจ่าย" : "ตามการใช้งาน"}
                      </div>
                    </div>
                  )}

                  {/* Electric */}
                  {(room.electricRate || room.electricFlat) && (
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-6 border border-yellow-200/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white">
                          ⚡
                        </div>
                        <div>
                          <div className="text-sm text-yellow-700 font-medium">
                            ค่าไฟ
                          </div>
                          <div className="text-xl font-bold text-yellow-800">
                            {room.electricFlat
                              ? `฿${room.electricFlat.toLocaleString()}`
                              : `฿${Number(room.electricRate).toFixed(
                                  2
                                )}/หน่วย`}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-yellow-600">
                        {room.electricFlat ? "เหมาจ่าย" : "ตามการใช้งาน"}
                      </div>
                    </div>
                  )}

                  {/* Common Fee */}
                  {room.commonFee && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                          🏢
                        </div>
                        <div>
                          <div className="text-sm text-purple-700 font-medium">
                            ค่าส่วนกลาง
                          </div>
                          <div className="text-xl font-bold text-purple-800">
                            ฿{room.commonFee}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-purple-600">รายเดือน</div>
                    </div>
                  )}

                  {/* Other Fee */}
                  {room.otherFee && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center text-white">
                          📋
                        </div>
                        <div>
                          <div className="text-sm text-gray-700 font-medium">
                            ค่าอื่นๆ
                          </div>
                          <div className="text-xl font-bold text-gray-800">
                            ฿{room.otherFee}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">รายเดือน</div>
                    </div>
                  )}
                </div>

                {/* Total Estimate */}
                <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-1">
                        ประมาณการค่าใช้จ่ายขั้นต่ำ/เดือน
                      </h4>
                      <p className="text-sm text-gray-600">
                        รวมค่าเช่า + ค่าธรรมเนียมคงที่
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                        ฿
                        {(
                          (room.price || 0) +
                          (room.waterFlat || 0) +
                          (room.electricFlat || 0) +
                          (room.commonFee || 0) +
                          (room.otherFee || 0)
                        ).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        ไม่รวมค่าน้ำไฟตามใช้จริง
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dormitory Information */}
            {dorm && (
              <div className="bg-gradient-to-r from-gray-50/80 to-slate-50/80 backdrop-blur-sm px-8 py-6 border-t border-white/50">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>🏢</span>
                  <span>ข้อมูลหอพัก</span>
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center text-white">
                    🏢
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{dorm.name}</div>
                    <div className="text-gray-600 flex items-center gap-2">
                      <span>📍</span>
                      <span>{dorm.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          {/* Tab Navigation */}
          <div className="bg-gradient-to-r from-gray-50/80 to-slate-50/80 backdrop-blur-sm px-8 py-6 border-b border-white/50">
            <div className="flex gap-2">
              <button
                className={`relative px-6 py-3 font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === "bill"
                    ? "bg-white text-blue-600 shadow-lg border-2 border-blue-200"
                    : "bg-transparent text-gray-600 hover:bg-white/50 hover:text-gray-800"
                }`}
                onClick={() => dispatch(setActiveTab("bill"))}
              >
                <span className="flex items-center gap-2">
                  <span>💰</span>
                  <span>บิลค่าเช่า</span>
                </span>
                {activeTab === "bill" && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full"></div>
                )}
              </button>
              <button
                className={`relative px-6 py-3 font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === "contract"
                    ? "bg-white text-blue-600 shadow-lg border-2 border-blue-200"
                    : "bg-transparent text-gray-600 hover:bg-white/50 hover:text-gray-800"
                }`}
                onClick={() => dispatch(setActiveTab("contract"))}
              >
                <span className="flex items-center gap-2">
                  <span>📋</span>
                  <span>สัญญาเช่า</span>
                </span>
                {activeTab === "contract" && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full"></div>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "bill" ? (
              <BillTab roomId={String(roomId)} room={room} />
            ) : (
              <ContractTab roomId={String(roomId)} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
