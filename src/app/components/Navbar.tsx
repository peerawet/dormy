"use client";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { logout } from "../../store/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProfileModal from "./ProfileModal";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
    router.push("/");
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
          background: rgba(30, 58, 138, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mobile-glass {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          background: rgba(248, 250, 252, 0.95);
          border: 1px solid rgba(148, 163, 184, 0.2);
        }
      `}</style>

      <nav className="sticky top-0 z-50 glass-morphism shadow-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo Section */}
            <Link
              href="/"
              className="flex items-center gap-3 group hover:scale-105 transition-all duration-300 navbar-float"
            >
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 glow-effect">
                  <span className="text-xl md:text-2xl text-white font-bold">
                    🏠
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl md:text-2xl bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                  Dormy
                </span>
                <span className="text-xs text-blue-200 font-medium tracking-wider opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  MANAGEMENT SYSTEM
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {auth.token ? (
                <>
                  <Link
                    href="/dashboard"
                    className="menu-item-hover group relative px-4 py-2.5 rounded-xl text-blue-100 hover:text-white transition-all duration-300 flex items-center gap-3 hover:bg-white/10 font-medium"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                      📊
                    </span>
                    <span className="tracking-wide">แดชบอร์ด</span>
                    <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-300 group-hover:w-4/5 group-hover:left-1/10 transition-all duration-300 rounded-full"></div>
                  </Link>

                  <Link
                    href="/dormitory"
                    className="menu-item-hover group relative px-4 py-2.5 rounded-xl text-blue-100 hover:text-white transition-all duration-300 flex items-center gap-3 hover:bg-white/10 font-medium"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                      🏢
                    </span>
                    <span className="tracking-wide">จัดการหอพัก</span>
                    <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-300 group-hover:w-4/5 group-hover:left-1/10 transition-all duration-300 rounded-full"></div>
                  </Link>

                  <button
                    onClick={() => setProfileModalOpen(true)}
                    className="menu-item-hover group relative px-4 py-2.5 rounded-xl text-blue-100 hover:text-white transition-all duration-300 flex items-center gap-3 hover:bg-white/10 font-medium"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                      👤
                    </span>
                    <span className="tracking-wide">ข้อมูลส่วนตัว</span>
                    <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-300 group-hover:w-4/5 group-hover:left-1/10 transition-all duration-300 rounded-full"></div>
                  </button>

                  {/* Separator */}
                  <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-3"></div>

                  <button
                    onClick={handleLogout}
                    className="group relative px-4 py-2.5 rounded-xl text-red-300 hover:text-white transition-all duration-300 flex items-center gap-3 hover:bg-red-500/20 font-medium border border-red-400/20 hover:border-red-400/40"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                      🚪
                    </span>
                    <span className="tracking-wide">ออกจากระบบ</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="menu-item-hover group relative px-4 py-2.5 rounded-xl text-blue-100 hover:text-white transition-all duration-300 flex items-center gap-3 hover:bg-white/10 font-medium"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                      🔑
                    </span>
                    <span className="tracking-wide">เข้าสู่ระบบ</span>
                    <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-300 group-hover:w-4/5 group-hover:left-1/10 transition-all duration-300 rounded-full"></div>
                  </Link>

                  <Link
                    href="/register"
                    className="group relative ml-4 px-6 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:scale-105 active:scale-95 shimmer-effect"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                      ✨
                    </span>
                    <span className="tracking-wide">สมัครสมาชิก</span>
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  </Link>
                </>
              )}

              {/* FAQ Link */}
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-3"></div>
              <Link
                href="/faq"
                className="menu-item-hover group relative px-4 py-2.5 rounded-xl text-blue-200 hover:text-blue-100 transition-all duration-300 flex items-center gap-3 hover:bg-white/5 font-medium"
              >
                <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                  ❓
                </span>
                <span className="tracking-wide">คำถามที่พบบ่อย</span>
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-300 to-blue-200 group-hover:w-4/5 group-hover:left-1/10 transition-all duration-300 rounded-full"></div>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden relative w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 flex flex-col justify-center items-center group active:scale-95"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              <span
                className={`block w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ${
                  open ? "rotate-45 translate-y-2 bg-blue-600" : ""
                }`}
              ></span>
              <span
                className={`block w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ${
                  open ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                  open ? "-rotate-45 -translate-y-2 bg-blue-600" : ""
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
                    <Link
                      href="/dashboard"
                      className="group flex items-center gap-4 px-4 py-4 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-300 font-medium bounce-in"
                      onClick={() => setOpen(false)}
                      style={{ animationDelay: "0.1s" }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                        <span className="text-lg">📊</span>
                      </div>
                      <span className="text-lg">แดชบอร์ด</span>
                      <div className="ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        →
                      </div>
                    </Link>

                    <Link
                      href="/dormitory"
                      className="group flex items-center gap-4 px-4 py-4 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-300 font-medium bounce-in"
                      onClick={() => setOpen(false)}
                      style={{ animationDelay: "0.2s" }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center group-hover:from-indigo-200 group-hover:to-indigo-300 transition-all duration-300">
                        <span className="text-lg">🏢</span>
                      </div>
                      <span className="text-lg">จัดการหอพัก</span>
                      <div className="ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        →
                      </div>
                    </Link>

                    <button
                      onClick={() => {
                        setOpen(false);
                        setProfileModalOpen(true);
                      }}
                      className="group flex items-center gap-4 px-4 py-4 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-300 font-medium bounce-in w-full text-left"
                      style={{ animationDelay: "0.3s" }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                        <span className="text-lg">👤</span>
                      </div>
                      <span className="text-lg">ข้อมูลส่วนตัว</span>
                      <div className="ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        →
                      </div>
                    </button>

                    {/* Separator */}
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-3"></div>

                    <button
                      onClick={handleLogout}
                      className="group flex items-center gap-4 px-4 py-4 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50/80 transition-all duration-300 font-medium bounce-in w-full text-left"
                      style={{ animationDelay: "0.4s" }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center group-hover:from-red-200 group-hover:to-red-300 transition-all duration-300">
                        <span className="text-lg">🚪</span>
                      </div>
                      <span className="text-lg">ออกจากระบบ</span>
                      <div className="ml-auto text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        →
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="group flex items-center gap-4 px-4 py-4 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-300 font-medium bounce-in"
                      onClick={() => setOpen(false)}
                      style={{ animationDelay: "0.1s" }}
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
                      className="group relative mt-2 px-6 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] bounce-in"
                      onClick={() => setOpen(false)}
                      style={{ animationDelay: "0.2s" }}
                    >
                      <span className="text-lg">✨</span>
                      <span className="text-lg">สมัครสมาชิก</span>
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    </Link>
                  </>
                )}

                {/* FAQ Link */}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-3"></div>
                <Link
                  href="/faq"
                  className="group flex items-center gap-4 px-4 py-4 rounded-xl text-slate-600 hover:text-slate-700 hover:bg-slate-50/80 transition-all duration-300 font-medium bounce-in"
                  onClick={() => setOpen(false)}
                  style={{ animationDelay: "0.3s" }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center group-hover:from-slate-200 group-hover:to-slate-300 transition-all duration-300">
                    <span className="text-lg">❓</span>
                  </div>
                  <span className="text-lg">คำถามที่พบบ่อย</span>
                  <div className="ml-auto text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    →
                  </div>
                </Link>
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
