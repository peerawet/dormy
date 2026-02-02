"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { getTenantMe, logoutTenant } from "@/store/tenantAuthSlice";
import Link from "next/link";

export default function TenantPortalPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { tenant, token, loading } = useSelector(
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
      // This ensures we get bills, rooms, and contracts
      if (!tenant || !tenant.bills || !tenant.rooms) {
        console.log("🔄 Fetching full tenant data...");
        dispatch(getTenantMe(storedToken));
      }
    } else if (!loading) {
      router.push("/tenant-login");
    }
  }, [mounted, dispatch, tenant, router, loading]);

  // Debug: Log tenant data (MUST be before any conditional returns!)
  useEffect(() => {
    if (tenant) {
      console.log("🔍 Tenant data:", tenant);
      console.log("🔍 Bills:", tenant.bills);
      console.log("🔍 Rooms:", tenant.rooms);
    }
  }, [tenant]);

  const handleLogout = () => {
    dispatch(logoutTenant());
    router.push("/tenant-login");
  };

  // Show loading during mount or when fetching data
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

  const unpaidBillsCount =
    tenant.bills?.filter((bill: any) => !bill.isPaid).length || 0;
  const totalUnpaid =
    tenant.bills
      ?.filter((bill: any) => !bill.isPaid)
      .reduce((sum: number, bill: any) => sum + bill.total, 0) || 0;
  
  // Calculate total deposit and insurance from contracts
  const totalDeposit =
    tenant.contracts?.reduce((sum: number, contract: any) => sum + (contract.deposit || 0), 0) || 0;
  const totalInsurance =
    tenant.contracts?.reduce((sum: number, contract: any) => sum + (contract.insurance || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header / Navbar */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-white/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🏠</div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    ระบบผู้เช่า
                  </h1>
                  <p className="text-sm text-gray-600">{tenant.name}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span>🚪</span>
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              {tenant.pictureUrl ? (
                <img
                  src={tenant.pictureUrl}
                  alt={tenant.name}
                  className="w-16 h-16 rounded-full border-4 border-white/30"
                />
              ) : (
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                  👤
                </div>
              )}
              <div>
                <h2 className="text-3xl font-bold">
                  สวัสดี, {tenant.displayName || tenant.name}!
                </h2>
                <p className="text-blue-100">ยินดีต้อนรับสู่ระบบผู้เช่า</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Rooms */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                  🏠
                </div>
                <div>
                  <p className="text-gray-600 text-sm">ห้องที่เช่า</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {tenant.rooms?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Unpaid Bills */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                  💰
                </div>
                <div>
                  <p className="text-gray-600 text-sm">บิลค้างชำระ</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {unpaidBillsCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Unpaid */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center text-2xl">
                  💸
                </div>
                <div>
                  <p className="text-gray-600 text-sm">ยอดค้างชำระ</p>
                  <p className="text-3xl font-bold text-red-600">
                    ฿{totalUnpaid.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Deposit */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                  🏦
                </div>
                <div>
                  <p className="text-gray-600 text-sm">เงินมัดจำ</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ฿{totalDeposit.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Insurance */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                  🛡️
                </div>
                <div>
                  <p className="text-gray-600 text-sm">เงินประกัน</p>
                  <p className="text-3xl font-bold text-purple-600">
                    ฿{totalInsurance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/tenant/bills"
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                บิลค่าเช่า
              </h3>
              <p className="text-gray-600">
                ดูบิลค่าเช่าและประวัติการชำระเงิน
              </p>
              <div className="mt-4 flex items-center text-blue-600 font-medium">
                <span>ดูรายละเอียด</span>
                <span className="ml-2">→</span>
              </div>
            </Link>

            <Link
              href="/tenant/profile"
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="text-5xl mb-4">👤</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ข้อมูลส่วนตัว
              </h3>
              <p className="text-gray-600">
                ดูและแก้ไขข้อมูลส่วนตัวของคุณ
              </p>
              <div className="mt-4 flex items-center text-blue-600 font-medium">
                <span>ดูรายละเอียด</span>
                <span className="ml-2">→</span>
              </div>
            </Link>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 opacity-50 cursor-not-allowed">
              <div className="text-5xl mb-4">📞</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                แจ้งปัญหา
              </h3>
              <p className="text-gray-600">
                แจ้งปัญหาหรือส่งข้อความถึงเจ้าของหอพัก
              </p>
              <div className="mt-4 flex items-center text-gray-400 font-medium">
                <span>เร็วๆ นี้</span>
              </div>
            </div>
          </div>

          {/* Recent Bills */}
          {tenant.bills && tenant.bills.length > 0 ? (
            <div className="mt-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span>📋</span>
                    <span>บิลล่าสุด</span>
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {tenant.bills.slice(0, 5).map((bill: any) => (
                      <div
                        key={bill.id}
                        className={`flex items-center justify-between p-4 rounded-xl ${
                          bill.isPaid
                            ? "bg-green-50 border border-green-200"
                            : "bg-orange-50 border border-orange-200"
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-gray-800">
                            {bill.room?.name || "ห้อง"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(bill.billDate).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-800">
                            ฿{bill.total.toLocaleString()}
                          </p>
                          <p
                            className={`text-sm font-medium ${
                              bill.isPaid ? "text-green-600" : "text-orange-600"
                            }`}
                          >
                            {bill.isPaid ? "✓ ชำระแล้ว" : "○ ยังไม่ชำระ"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/tenant/bills"
                    className="mt-4 block text-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ดูบิลทั้งหมด →
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-white/50">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  ยังไม่มีบิล
                </h3>
                <p className="text-gray-600">
                  เมื่อมีบิลค่าเช่าจะแสดงที่นี่
                </p>
              </div>
            </div>
          )}

          {/* Contracts */}
          {tenant.contracts && tenant.contracts.length > 0 && (
            <div className="mt-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span>📄</span>
                    <span>สัญญาเช่า</span>
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tenant.contracts.map((contract: any) => (
                      <Link
                        key={contract.id}
                        href={`/tenant/contract/${contract.id}`}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-gray-800 text-lg">
                              {contract.room?.name || "ห้อง"}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {contract.room?.dormitory?.name || "หอพัก"}
                            </p>
                          </div>
                          <div className="text-2xl">🏠</div>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">วันเริ่มสัญญา:</span>
                            <span className="font-medium text-gray-800">
                              {new Date(contract.startDate).toLocaleDateString("th-TH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">วันสิ้นสุดสัญญา:</span>
                            <span className="font-medium text-gray-800">
                              {new Date(contract.endDate).toLocaleDateString("th-TH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          {contract.deposit && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">เงินมัดจำ:</span>
                              <span className="font-bold text-blue-600">
                                ฿{contract.deposit.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {contract.insurance && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">เงินประกัน:</span>
                              <span className="font-bold text-purple-600">
                                ฿{contract.insurance.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center text-blue-600 font-medium text-sm pt-3 border-t border-blue-200">
                          <span>ดูสัญญาเต็ม</span>
                          <span className="ml-2">→</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

