"use client";
import Navbar from "@/app/components/Navbar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import Link from "next/link";
import DormModal from "./DormModal";
import RoomModal from "./RoomModal";
import { fetchDorms } from "@/store/dormSlice";

export default function DormitoryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { dorms, loading, error } = useSelector(
    (state: RootState) => state.dorm
  );
  const auth = useSelector((state: RootState) => state.auth);

  // Modal states
  const [modalDormOpen, setModalDormOpen] = useState(false);
  const [modalDorm, setModalDorm] = useState<any | null>(null);
  const [modalRoomOpen, setModalRoomOpen] = useState(false);
  const [modalRoom, setModalRoom] = useState<any | null>(null);
  const [modalRoomDormId, setModalRoomDormId] = useState<number | null>(null);

  useEffect(() => {
    if (auth.token) {
      dispatch(fetchDorms(auth.token));
    }
  }, [auth.token, dispatch]);

  // Modal functions
  function openAddDormModal() {
    setModalDorm(null);
    setModalDormOpen(true);
  }
  function openEditDormModal(dorm: any) {
    setModalDorm(dorm);
    setModalDormOpen(true);
  }
  function closeDormModal() {
    setModalDormOpen(false);
    setModalDorm(null);
  }

  function openAddRoomModal(dormitoryId: number) {
    setModalRoom(null);
    setModalRoomDormId(dormitoryId);
    setModalRoomOpen(true);
  }
  function openEditRoomModal(room: any, dormitoryId: number) {
    setModalRoom(room);
    setModalRoomDormId(dormitoryId);
    setModalRoomOpen(true);
  }
  function closeRoomModal() {
    setModalRoomOpen(false);
    setModalRoom(null);
    setModalRoomDormId(null);
  }

  const handleModalSuccess = () => {
    if (auth.token) {
      dispatch(fetchDorms(auth.token));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-white/50">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            กำลังโหลดข้อมูลหอพัก
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
            onClick={() => {
              if (auth.token) {
                dispatch(fetchDorms(auth.token));
              }
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <span>🔄</span>
            <span>ลองใหม่</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-100/80 backdrop-blur-sm text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-blue-200/50">
                  <span>🏢</span>
                  <span>จัดการหอพัก</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 mb-2">
                  หอพักของคุณ
                </h1>
                <p className="text-gray-600">
                  จัดการหอพักและห้องพักทั้งหมดในที่เดียว
                </p>
              </div>
              <button
                onClick={openAddDormModal}
                className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-3"
              >
                <span className="text-xl">🏠</span>
                <span>เพิ่มหอพัก</span>
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </button>
            </div>

            {/* Stats */}
            {dorms.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🏢</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {dorms.length}
                      </div>
                      <div className="text-gray-600 text-sm">หอพักทั้งหมด</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🏠</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-indigo-600">
                        {dorms.reduce(
                          (total, dorm) => total + (dorm.rooms?.length || 0),
                          0
                        )}
                      </div>
                      <div className="text-gray-600 text-sm">
                        ห้องพักทั้งหมด
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {dorms.reduce(
                          (total, dorm) =>
                            total +
                            (dorm.rooms?.reduce(
                              (roomTotal: number, room: any) =>
                                roomTotal + (room.tenantRooms?.length || 0),
                              0
                            ) || 0),
                          0
                        )}
                      </div>
                      <div className="text-gray-600 text-sm">
                        ผู้เช่าทั้งหมด
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(
                          (dorms.reduce(
                            (total, dorm) =>
                              total +
                              (dorm.rooms?.filter(
                                (room: any) =>
                                  (room.tenantRooms?.length || 0) > 0
                              ).length || 0),
                            0
                          ) /
                            Math.max(
                              dorms.reduce(
                                (total, dorm) =>
                                  total + (dorm.rooms?.length || 0),
                                0
                              ),
                              1
                            )) *
                            100
                        )}
                        %
                      </div>
                      <div className="text-gray-600 text-sm">
                        อัตราการเข้าพัก
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-8">
            {dorms.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/50 shadow-lg">
                <div className="text-8xl mb-6 animate-bounce">🏠</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-3">
                  ยังไม่มีหอพัก
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  เริ่มต้นการจัดการหอพักของคุณด้วยการเพิ่มหอพักแรก
                </p>
                <button
                  onClick={openAddDormModal}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <span className="text-xl">🏠</span>
                  <span>เพิ่มหอพักแรก</span>
                </button>
              </div>
            ) : (
              dorms.map((dorm: any) => (
                <div
                  key={dorm.id}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-500"
                >
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
                          <div className="flex items-center gap-2 text-gray-600">
                            <span>📍</span>
                            <span>{dorm.address}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => openEditDormModal(dorm)}
                        className="inline-flex items-center gap-2 bg-white/80 hover:bg-white text-blue-600 border-2 border-blue-200 hover:border-blue-300 px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
                      >
                        <span>✏️</span>
                        <span>แก้ไขหอพัก</span>
                      </button>
                    </div>
                  </div>

                  {/* Rooms Section */}
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-800">
                          ห้องพัก
                        </h3>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {(dorm.rooms || []).length} ห้อง
                        </span>
                      </div>
                      <button
                        onClick={() => openAddRoomModal(dorm.id)}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <span>➕</span>
                        <span>เพิ่มห้องพัก</span>
                      </button>
                    </div>

                    {(dorm.rooms || []).length === 0 ? (
                      <div className="text-center py-12 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                        <div className="text-4xl mb-3">🏠</div>
                        <p className="text-gray-500">ยังไม่มีห้องพัก</p>
                        <button
                          onClick={() => openAddRoomModal(dorm.id)}
                          className="mt-4 text-blue-600 hover:text-blue-700 font-medium hover:underline"
                        >
                          เพิ่มห้องพักแรก
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {(dorm.rooms || []).map((room: any) => {
                          // Calculate room status
                          const tenants = room.tenantRooms || [];
                          const contracts = room.rentalContracts || [];
                          const activeContracts = contracts.filter(
                            (contract: any) => {
                              const today = new Date();
                              const start = new Date(contract.startDate);
                              const end = new Date(contract.endDate);
                              return today >= start && today <= end;
                            }
                          );

                          const isOccupied = tenants.length > 0;
                          const hasActiveContract = activeContracts.length > 0;

                          // Get expiring contracts (within 30 days)
                          const expiringContracts = contracts.filter(
                            (contract: any) => {
                              const today = new Date();
                              const end = new Date(contract.endDate);
                              const daysLeft = Math.ceil(
                                (end.getTime() - today.getTime()) /
                                  (1000 * 60 * 60 * 24)
                              );
                              return daysLeft > 0 && daysLeft <= 30;
                            }
                          );

                          return (
                            <div
                              key={room.id}
                              className="group/room bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white">
                                  🏠
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-800">
                                    {room.name}
                                  </h4>
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

                              {/* Tenant Information */}
                              {isOccupied && (
                                <div className="mb-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium text-blue-800">
                                      👥 ผู้เช่า ({tenants.length})
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    {tenants
                                      .slice(0, 2)
                                      .map((tenantRoom: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="text-sm text-gray-700"
                                        >
                                          •{" "}
                                          {tenantRoom.tenant?.name ||
                                            "ไม่ระบุชื่อ"}
                                        </div>
                                      ))}
                                    {tenants.length > 2 && (
                                      <div className="text-sm text-gray-500">
                                        และอีก {tenants.length - 2} คน
                                      </div>
                                    )}
                                  </div>

                                  {/* Active Contract Info */}
                                  {activeContracts.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-blue-200">
                                      <div className="text-xs text-blue-600">
                                        สัญญาหมดอายุ:{" "}
                                        {new Date(
                                          activeContracts[0].endDate
                                        ).toLocaleDateString("th-TH")}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    ค่าเช่า/เดือน
                                  </span>
                                  <span className="font-bold text-green-600">
                                    ฿{room.price?.toLocaleString()}
                                  </span>
                                </div>

                                {room.waterRate && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      ค่าน้ำ/หน่วย
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      ฿{Number(room.waterRate).toFixed(2)}
                                    </span>
                                  </div>
                                )}

                                {room.electricRate && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      ค่าไฟ/หน่วย
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      ฿{Number(room.electricRate).toFixed(2)}
                                    </span>
                                  </div>
                                )}

                                {room.waterFlat && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      ค่าน้ำเหมา
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      ฿{room.waterFlat}
                                    </span>
                                  </div>
                                )}

                                {room.electricFlat && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      ค่าไฟเหมา
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      ฿{room.electricFlat}
                                    </span>
                                  </div>
                                )}

                                {room.commonFee && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      ค่าส่วนกลาง
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      ฿{room.commonFee}
                                    </span>
                                  </div>
                                )}

                                {room.otherFee && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      ค่าอื่นๆ
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      ฿{room.otherFee}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <Link
                                  href={`/dormitory/${room.id}`}
                                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-center py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 text-sm"
                                >
                                  📋 ดูรายละเอียด
                                </Link>
                                <button
                                  onClick={() =>
                                    openEditRoomModal(room, dorm.id)
                                  }
                                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-2 rounded-lg transition-all duration-300 hover:shadow-md"
                                >
                                  ✏️
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        {/* Modals */}
        <DormModal
          open={modalDormOpen}
          onClose={closeDormModal}
          dorm={modalDorm}
          token={auth.token}
        />
        <RoomModal
          open={modalRoomOpen}
          onClose={closeRoomModal}
          room={modalRoom}
          dormitoryId={modalRoomDormId}
          token={auth.token}
        />
      </div>
    </ProtectedRoute>
  );
}
