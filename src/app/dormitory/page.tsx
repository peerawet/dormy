"use client";
import Navbar from "@/app/components/Navbar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import DormModal from "../components/DormModal";
import RoomModal from "../components/RoomModal";
import { fetchDorms } from "@/store/dormSlice";
import DormHeader from "@/app/components/DormHeader";
import DormStats from "@/app/components/DormStats";
import DormCardList from "@/app/components/DormCardList";

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

        <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto py-8 px-6 space-y-10">
          {/* Header */}
          <DormHeader onAddDorm={openAddDormModal} />

          {/* Stats */}
          {dorms.length > 0 && <DormStats dorms={dorms} />}

          {/* Content */}
          <div className="mt-8">
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
              <DormCardList
                dorms={dorms}
                onEditDorm={openEditDormModal}
                onAddRoom={openAddRoomModal}
                onEditRoom={openEditRoomModal}
              />
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
