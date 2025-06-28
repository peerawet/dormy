"use client";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { logout } from "../../store/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white shadow">
      <a
        href="/"
        className="flex items-center gap-2 hover:opacity-80 transition"
      >
        <img src="/next.svg" alt="Logo" className="h-8 w-8" />
        <span className="font-bold text-xl">Dormy</span>
      </a>
      {/* Desktop menu */}
      <div className="hidden md:flex gap-6 items-center">
        {auth.token ? (
          <>
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              แดชบอร์ด
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:underline"
            >
              ออกจากระบบ
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-blue-600 hover:underline">
              เข้าสู่ระบบ
            </Link>
            <Link href="/register" className="text-green-600 hover:underline">
              สมัครสมาชิก
            </Link>
          </>
        )}
        <Link href="/faq" className="text-gray-700 hover:underline">
          FAQ
        </Link>
      </div>
      {/* Hamburger icon */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-10 h-10"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        <span
          className={`block w-6 h-0.5 bg-gray-800 mb-1 transition-transform ${
            open ? "rotate-45 translate-y-1.5" : ""
          }`}
        ></span>
        <span
          className={`block w-6 h-0.5 bg-gray-800 mb-1 ${
            open ? "opacity-0" : ""
          }`}
        ></span>
        <span
          className={`block w-6 h-0.5 bg-gray-800 transition-transform ${
            open ? "-rotate-45 -translate-y-1.5" : ""
          }`}
        ></span>
      </button>
      {/* Mobile menu */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-center py-4 gap-4 md:hidden animate-fade-in z-50">
          {auth.token ? (
            <>
              <Link
                href="/dashboard"
                className="text-blue-600 hover:underline w-full text-center"
                onClick={() => setOpen(false)}
              >
                แดชบอร์ด
              </Link>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:underline w-full text-center"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-blue-600 hover:underline w-full text-center"
                onClick={() => setOpen(false)}
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="text-green-600 hover:underline w-full text-center"
                onClick={() => setOpen(false)}
              >
                สมัครสมาชิก
              </Link>
            </>
          )}
          <Link
            href="/faq"
            className="text-gray-700 hover:underline w-full text-center"
            onClick={() => setOpen(false)}
          >
            FAQ
          </Link>
        </div>
      )}
    </nav>
  );
}
