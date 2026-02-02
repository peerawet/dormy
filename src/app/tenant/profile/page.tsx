"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { getTenantMe } from "@/store/tenantAuthSlice";
import Link from "next/link";

export default function TenantProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { tenant, loading } = useSelector(
    (state: RootState) => state.tenantAuth
  );
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const storedToken = localStorage.getItem("tenant_token");
    if (storedToken) {
      // Always fetch full tenant data if we have a token
      if (!tenant || !tenant.rooms) {
        dispatch(getTenantMe(storedToken));
      }
    } else if (!loading) {
      router.push("/tenant-login");
    }
  }, [mounted, dispatch, tenant, router, loading]);

  // Debug: Log tenant data (MUST be before any conditional returns!)
  useEffect(() => {
    if (tenant) {
      console.log("🔍 Tenant data (Profile page):", tenant);
    }
  }, [tenant]);

  if (!mounted || loading || !tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-white/50">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            กำลังโหลดข้อมูล...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-white/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/tenant"
                className="text-2xl hover:scale-110 transition-transform"
              >
                ←
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  ข้อมูลส่วนตัว
                </h1>
                <p className="text-sm text-gray-600">
                  ดูและจัดการข้อมูลส่วนตัวของคุณ
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Profile Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-center">
              {tenant.pictureUrl ? (
                <img
                  src={tenant.pictureUrl}
                  alt={tenant.name}
                  className="w-24 h-24 rounded-full border-4 border-white/30 mx-auto mb-4"
                />
              ) : (
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
                  👤
                </div>
              )}
              <h2 className="text-2xl font-bold text-white mb-1">
                {tenant.displayName || tenant.name}
              </h2>
              <p className="text-blue-100">ผู้เช่า</p>
            </div>

            <div className="p-6 lg:p-8 space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📋</span>
                  <span>ข้อมูลส่วนตัว</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                      👤
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">ชื่อ-นามสกุล</p>
                      <p className="font-semibold text-gray-800">
                        {tenant.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">
                      📞
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">เบอร์โทรศัพท์</p>
                      <p className="font-semibold text-gray-800">
                        {tenant.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
                      📍
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">ที่อยู่</p>
                      <p className="font-semibold text-gray-800">
                        {tenant.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* LINE Info */}
              {tenant.lineUserId && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>💬</span>
                    <span>ข้อมูล LINE</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
                        ✓
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-green-600">
                          สถานะการเชื่อมต่อ
                        </p>
                        <p className="font-semibold text-green-700">
                          เชื่อมต่อกับ LINE แล้ว
                        </p>
                      </div>
                    </div>

                    {tenant.displayName && (
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                          👤
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            ชื่อแสดงใน LINE
                          </p>
                          <p className="font-semibold text-gray-800">
                            {tenant.displayName}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rooms Info */}
              {tenant.rooms && tenant.rooms.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🏠</span>
                    <span>ห้องที่เช่า</span>
                  </h3>
                  <div className="space-y-4">
                    {tenant.rooms.map((tenantRoom: any) => (
                      <div
                        key={tenantRoom.id}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
                      >
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-2xl">
                          🏠
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-lg">
                            {tenantRoom.room?.name || "ห้อง"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {tenantRoom.room?.dormitory?.name || "หอพัก"}
                          </p>
                          <p className="text-sm text-blue-600 font-medium mt-1">
                            ค่าเช่า: ฿
                            {tenantRoom.room?.price?.toLocaleString() || 0}
                            /เดือน
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notice */}
              <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">ℹ️</div>
                  <div className="flex-1">
                    <p className="font-medium text-blue-800 mb-1">
                      ต้องการแก้ไขข้อมูล?
                    </p>
                    <p className="text-sm text-blue-700">
                      กรุณาติดต่อเจ้าของหอพักเพื่อแก้ไขข้อมูลส่วนตัวของคุณ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

