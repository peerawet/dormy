"use client";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { logout } from "@/store/authSlice";
import { fetchDorms } from "@/store/dormSlice";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import ProfileModal from "./ProfileModal";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [managementDropdownOpen, setManagementDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const auth = useSelector((state: RootState) => state.auth);
  const { dorms: dormitories, loading: loadingDorms } = useSelector(
    (state: RootState) => state.dorm
  );
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
    setManagementDropdownOpen(false);
    setUserDropdownOpen(false);
    router.push("/");
  };

  const closeAllDropdowns = () => {
    setManagementDropdownOpen(false);
    setUserDropdownOpen(false);
  };

  // Fetch dormitories using Redux
  useEffect(() => {
    if (auth.token && dormitories.length === 0) {
      dispatch(fetchDorms(auth.token));
    }
  }, [auth.token, dispatch, dormitories.length]);

  // Check if current path matches room
  const isCurrentRoom = (roomId: number) => {
    return pathname === `/dormitory/${roomId}`;
  };

  return (
    <>
      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-2px);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        @keyframes glow {
          0%,
          100% {
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.6),
              0 0 30px rgba(59, 130, 246, 0.4);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .navbar-float {
          animation: float 6s ease-in-out infinite;
        }

        .shimmer-effect {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }

        .glow-effect {
          animation: glow 2s ease-in-out infinite alternate;
        }

        .slide-down {
          animation: slideDown 0.3s ease-out;
        }

        .bounce-in {
          animation: bounceIn 0.5s ease-out;
        }

        .fade-in {
          animation: fadeIn 0.2s ease-out;
        }

        .menu-item-hover {
          position: relative;
          overflow: hidden;
        }

        .menu-item-hover::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transition: left 0.5s ease;
        }

        .menu-item-hover:hover::before {
          left: 100%;
        }

        .glass-morphism {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          background: rgba(30, 58, 138, 0.9);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mobile-glass {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          background: rgba(248, 250, 252, 0.98);
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .dropdown-glass {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(148, 163, 184, 0.2);
        }
      `}</style>

      {/* Overlay สำหรับปิด dropdown */}
      {(managementDropdownOpen || userDropdownOpen) && (
        <div className="fixed inset-0 z-40" onClick={closeAllDropdowns} />
      )}

      <nav className="sticky top-0 z-50 glass-morphism shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo Section */}
            <Link
              href="/"
              className="flex items-center gap-3 group hover:scale-105 transition-all duration-300 navbar-float"
              onClick={closeAllDropdowns}
            >
              <div className="relative">
                <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <span className="text-xl md:text-2xl text-white font-bold">
                    🏠
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl md:text-2xl bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                  Dormy
                </span>
                <span className="text-xs text-blue-200 font-medium tracking-wider opacity-80">
                  MANAGEMENT
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              {auth.token ? (
                <>
                  {/* Management Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setManagementDropdownOpen(!managementDropdownOpen);
                        setUserDropdownOpen(false);
                      }}
                      className="group relative px-4 py-2.5 rounded-xl text-blue-100 hover:text-white transition-all duration-300 flex items-center gap-2 hover:bg-white/10 font-medium"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                        📊
                      </span>
                      <span className="tracking-wide">จัดการ</span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          managementDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Management Dropdown Menu */}
                    {managementDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 dropdown-glass rounded-xl shadow-2xl py-2 z-50 slide-down">
                        <Link
                          href="/dashboard"
                          className="group flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 mx-2 rounded-lg"
                          onClick={closeAllDropdowns}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-200">
                            <span className="text-sm">📊</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">แดชบอร์ด</span>
                            <span className="text-xs text-gray-500">
                              ภาพรวมทั้งหมด
                            </span>
                          </div>
                        </Link>

                        <Link
                          href="/dormitory"
                          className="group flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 mx-2 rounded-lg"
                          onClick={closeAllDropdowns}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center group-hover:from-indigo-200 group-hover:to-indigo-300 transition-all duration-200">
                            <span className="text-sm">🏢</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">หอพัก & ห้อง</span>
                            <span className="text-xs text-gray-500">
                              จัดการหอพักและห้อง
                            </span>
                          </div>
                        </Link>

                        {/* Desktop Dormitory & Rooms Quick Access */}
                        {dormitories.length > 0 && (
                          <div className="mx-2 mt-2 border-t border-gray-100 pt-2">
                            <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              เข้าถึงด่วน
                            </div>
                            <div className="max-h-64 overflow-y-auto space-y-1">
                              {dormitories.map((dormitory) => (
                                <div key={dormitory.id} className="mb-2">
                                  {/* Dormitory Header */}
                                  <div className="px-2 py-1 bg-gray-50 rounded-lg mb-1">
                                    <div className="text-xs font-semibold text-gray-700">
                                      🏢 {dormitory.name}
                                    </div>
                                  </div>

                                  {/* Rooms List */}
                                  {dormitory.rooms &&
                                    dormitory.rooms.length > 0 && (
                                      <div className="ml-2 space-y-1">
                                        {dormitory.rooms.map((room) => {
                                          const isActive = isCurrentRoom(
                                            room.id
                                          );
                                          return (
                                            <Link
                                              key={room.id}
                                              href={`/dormitory/${room.id}`}
                                              onClick={closeAllDropdowns}
                                              className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 ${
                                                isActive
                                                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                                                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50"
                                              }`}
                                            >
                                              <div
                                                className={`w-5 h-5 rounded-md flex items-center justify-center text-xs ${
                                                  isActive
                                                    ? "bg-blue-200 text-blue-800"
                                                    : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                                                }`}
                                              >
                                                🏠
                                              </div>
                                              <div className="flex flex-col flex-1">
                                                <span className="text-xs font-medium">
                                                  {room.name}
                                                </span>
                                                <span className="text-xs opacity-70">
                                                  ฿
                                                  {room.price?.toLocaleString()}
                                                </span>
                                              </div>
                                              {isActive && (
                                                <div className="text-blue-600 text-xs">
                                                  ●
                                                </div>
                                              )}
                                            </Link>
                                          );
                                        })}
                                      </div>
                                    )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <Link
                          href="/tenants"
                          className="group flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 mx-2 rounded-lg"
                          onClick={closeAllDropdowns}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-200">
                            <span className="text-sm">👥</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">ผู้เช่า</span>
                            <span className="text-xs text-gray-500">
                              จัดการข้อมูลผู้เช่า
                            </span>
                          </div>
                        </Link>

                        <Link
                          href="/expenses"
                          className="group flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 mx-2 rounded-lg"
                          onClick={closeAllDropdowns}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-200">
                            <span className="text-sm">💰</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">ค่าใช้จ่าย</span>
                            <span className="text-xs text-gray-500">
                              จัดการค่าใช้จ่ายหอพัก
                            </span>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* User Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(!userDropdownOpen);
                        setManagementDropdownOpen(false);
                      }}
                      className="group relative px-4 py-2.5 rounded-xl text-blue-100 hover:text-white transition-all duration-300 flex items-center gap-2 hover:bg-white/10 font-medium"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                        👤
                      </span>
                      <span className="tracking-wide">บัญชี</span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          userDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* User Dropdown Menu */}
                    {userDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-52 dropdown-glass rounded-xl shadow-2xl py-2 z-50 slide-down">
                        <button
                          onClick={() => {
                            setProfileModalOpen(true);
                            closeAllDropdowns();
                          }}
                          className="group flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 mx-2 rounded-lg w-full text-left"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-200">
                            <span className="text-sm">⚙️</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">ข้อมูลส่วนตัว</span>
                            <span className="text-xs text-gray-500">
                              แก้ไขโปรไฟล์
                            </span>
                          </div>
                        </button>

                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2 mx-4"></div>

                        <button
                          onClick={handleLogout}
                          className="group flex items-center gap-3 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50/50 transition-all duration-200 mx-2 rounded-lg w-full text-left"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center group-hover:from-red-200 group-hover:to-red-300 transition-all duration-200">
                            <span className="text-sm">🚪</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">ออกจากระบบ</span>
                            <span className="text-xs text-red-400">
                              ลงชื่อออก
                            </span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="group relative px-4 py-2.5 rounded-xl text-blue-100 hover:text-white transition-all duration-300 flex items-center gap-2 hover:bg-white/10 font-medium"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                      🔑
                    </span>
                    <span className="tracking-wide">เข้าสู่ระบบ</span>
                  </Link>

                  <Link
                    href="/register"
                    className="group relative ml-3 px-5 py-2.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                      ✨
                    </span>
                    <span className="tracking-wide">สมัครสมาชิก</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden relative w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 flex flex-col justify-center items-center group active:scale-95"
              onClick={() => {
                setOpen(!open);
                closeAllDropdowns();
              }}
              aria-label="Toggle menu"
            >
              <span
                className={`block w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ${
                  open ? "rotate-45 translate-y-2 bg-blue-200" : ""
                }`}
              ></span>
              <span
                className={`block w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ${
                  open ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  open ? "-rotate-45 -translate-y-2 bg-blue-200" : ""
                }`}
              ></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="lg:hidden absolute top-full left-0 right-0 mobile-glass shadow-2xl border-t border-white/10 slide-down">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex flex-col gap-2">
                {auth.token ? (
                  <>
                    {/* Management Section */}
                    <div className="mb-2">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
                        จัดการระบบ
                      </h3>

                      <Link
                        href="/dashboard"
                        className="group flex items-center gap-4 px-4 py-3 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-300 font-medium"
                        onClick={() => setOpen(false)}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                          <span className="text-lg">📊</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-medium">
                            แดชบอร์ด
                          </span>
                          <span className="text-sm text-gray-500">
                            ภาพรวมทั้งหมด
                          </span>
                        </div>
                        <div className="ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          →
                        </div>
                      </Link>

                      <Link
                        href="/dormitory"
                        className="group flex items-center gap-4 px-4 py-3 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-300 font-medium"
                        onClick={() => setOpen(false)}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center group-hover:from-indigo-200 group-hover:to-indigo-300 transition-all duration-300">
                          <span className="text-lg">🏢</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-medium">
                            หอพัก & ห้อง
                          </span>
                          <span className="text-sm text-gray-500">
                            จัดการหอพักและห้อง
                          </span>
                        </div>
                        <div className="ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          →
                        </div>
                      </Link>

                      {/* Mobile Dormitory Rooms Quick Access - Show All Rooms */}
                      {dormitories.length > 0 && (
                        <div className="ml-6 space-y-1 max-h-96 overflow-y-auto">
                          {dormitories.map((dormitory) => (
                            <div key={dormitory.id} className="mb-3">
                              <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                🏢 {dormitory.name}
                              </div>
                              {dormitory.rooms &&
                                dormitory.rooms.length > 0 && (
                                  <div className="space-y-1">
                                    {dormitory.rooms.map((room) => {
                                      const isActive = isCurrentRoom(room.id);
                                      return (
                                        <Link
                                          key={room.id}
                                          href={`/dormitory/${room.id}`}
                                          onClick={() => setOpen(false)}
                                          className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                                            isActive
                                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                                              : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/80"
                                          }`}
                                        >
                                          <div
                                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                                              isActive
                                                ? "bg-blue-200 text-blue-800"
                                                : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                                            }`}
                                          >
                                            🏠
                                          </div>
                                          <div className="flex flex-col flex-1">
                                            <span className="text-sm font-medium">
                                              {room.name}
                                            </span>
                                            <span className="text-xs opacity-70">
                                              ฿{room.price?.toLocaleString()}
                                              /เดือน
                                            </span>
                                          </div>
                                          {isActive && (
                                            <div className="text-blue-600 text-xs">
                                              ●
                                            </div>
                                          )}
                                          <div className="ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            →
                                          </div>
                                        </Link>
                                      );
                                    })}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      )}

                      <Link
                        href="/tenants"
                        className="group flex items-center gap-4 px-4 py-3 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-300 font-medium"
                        onClick={() => setOpen(false)}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                          <span className="text-lg">👥</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-medium">ผู้เช่า</span>
                          <span className="text-sm text-gray-500">
                            จัดการข้อมูลผู้เช่า
                          </span>
                        </div>
                        <div className="ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          →
                        </div>
                      </Link>

                      <Link
                        href="/expenses"
                        className="group flex items-center gap-4 px-4 py-3 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-300 font-medium"
                        onClick={() => setOpen(false)}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                          <span className="text-lg">💰</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-medium">
                            ค่าใช้จ่าย
                          </span>
                          <span className="text-sm text-gray-500">
                            จัดการค่าใช้จ่ายหอพัก
                          </span>
                        </div>
                        <div className="ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          →
                        </div>
                      </Link>
                    </div>

                    {/* Account Section */}
                    <div className="border-t border-gray-200 pt-4 mt-2">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
                        บัญชีผู้ใช้
                      </h3>

                      <button
                        onClick={() => {
                          setOpen(false);
                          setProfileModalOpen(true);
                        }}
                        className="group flex items-center gap-4 px-4 py-3 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-300 font-medium w-full text-left"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                          <span className="text-lg">⚙️</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-medium">
                            ข้อมูลส่วนตัว
                          </span>
                          <span className="text-sm text-gray-500">
                            แก้ไขโปรไฟล์
                          </span>
                        </div>
                        <div className="ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          →
                        </div>
                      </button>

                      <button
                        onClick={handleLogout}
                        className="group flex items-center gap-4 px-4 py-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50/80 transition-all duration-300 font-medium w-full text-left"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center group-hover:from-red-200 group-hover:to-red-300 transition-all duration-300">
                          <span className="text-lg">🚪</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-medium">
                            ออกจากระบบ
                          </span>
                          <span className="text-sm text-red-400">
                            ลงชื่อออก
                          </span>
                        </div>
                        <div className="ml-auto text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          →
                        </div>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="group flex items-center gap-4 px-4 py-4 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-300 font-medium"
                      onClick={() => setOpen(false)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                        <span className="text-lg">🔑</span>
                      </div>
                      <span className="text-lg">เข้าสู่ระบบ</span>
                      <div className="ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        →
                      </div>
                    </Link>

                    <Link
                      href="/register"
                      className="group relative mt-2 px-6 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                      onClick={() => setOpen(false)}
                    >
                      <span className="text-lg">✨</span>
                      <span className="text-lg">สมัครสมาชิก</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
}
