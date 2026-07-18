"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  loginTenantWithLinkCode,
  clearTenantError,
} from "@/store/tenantAuthSlice";
import Link from "next/link";

export default function TenantLoginPage() {
  const [linkCode, setLinkCode] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { tenant, loading, error } = useSelector(
    (state: RootState) => state.tenantAuth
  );
  const searchParams = useSearchParams();

  useEffect(() => {
    // Auto-fill linkCode from URL parameter
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setLinkCode(codeFromUrl);
    }

    // ถูก redirect มาเพราะ session หมดอายุ — เคลียร์ error เก่าที่ค้างจาก token หมดอายุ
    if (searchParams.get("expired") === "1") {
      setSessionExpired(true);
      dispatch(clearTenantError());
    }

    // If already logged in, redirect to tenant portal
    if (tenant) {
      router.push("/tenant");
    }
  }, [tenant, router, searchParams, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkCode.trim()) return;
    setSessionExpired(false);

    try {
      await dispatch(
        loginTenantWithLinkCode({
          linkCode: linkCode.trim(),
        })
      ).unwrap();
      router.push("/tenant");
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h1 className="text-3xl font-bold text-white mb-2">
              ผู้เช่า - เข้าสู่ระบบ
            </h1>
            <p className="text-blue-100">
              กรอกรหัสเชื่อมต่อที่ได้รับจากเจ้าของหอพัก
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {sessionExpired && !error && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⏰</span>
                  <span>เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl">❌</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                รหัสเชื่อมต่อ (Link Code)
              </label>
              <input
                type="text"
                value={linkCode}
                onChange={(e) => setLinkCode(e.target.value)}
                placeholder="กรอกรหัสเชื่อมต่อ"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                disabled={loading}
                autoFocus
              />
              <p className="mt-2 text-sm text-gray-500">
                💡 คุณจะได้รับรหัสนี้จากเจ้าของหอพักผ่าน LINE หรือทาง Email
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !linkCode.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังตรวจสอบ...</span>
                </>
              ) : (
                <>
                  <span>🔓</span>
                  <span>เข้าสู่ระบบ</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8">
            <div className="pt-6 border-t border-gray-200">
              <div className="bg-blue-50/50 rounded-xl p-4 text-sm text-gray-600">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-lg">ℹ️</span>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">
                      วิธีการเข้าสู่ระบบ:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-600">
                      <li>ขอรหัสเชื่อมต่อจากเจ้าของหอพัก</li>
                      <li>กรอกรหัสในช่องด้านบน</li>
                      <li>กดปุ่มเข้าสู่ระบบ</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                ← กลับหน้าหลัก
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            เป็นเจ้าของหอพัก?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              เข้าสู่ระบบที่นี่
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

