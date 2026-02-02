"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { getTenantMe } from "@/store/tenantAuthSlice";
import Link from "next/link";

export default function TenantBillsPage() {
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
      if (!tenant || !tenant.bills) {
        dispatch(getTenantMe(storedToken));
      }
    } else if (!loading) {
      router.push("/tenant-login");
    }
  }, [mounted, dispatch, tenant, router, loading]);

  // Debug: Log tenant and bills data (MUST be before any conditional returns!)
  useEffect(() => {
    if (tenant && tenant.bills) {
      const bills = tenant.bills || [];
      const paidBills = bills.filter((bill: any) => bill.isPaid);
      const unpaidBills = bills.filter((bill: any) => !bill.isPaid);
      
      console.log("🔍 Tenant data (Bills page):", tenant);
      console.log("🔍 Bills array:", tenant.bills);
      console.log("🔍 Bills count:", bills.length);
      console.log("🔍 Paid bills:", paidBills.length);
      console.log("🔍 Unpaid bills:", unpaidBills.length);
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

  const bills = tenant.bills || [];
  const paidBills = bills.filter((bill: any) => bill.isPaid);
  const unpaidBills = bills.filter((bill: any) => !bill.isPaid);
  const totalUnpaid = unpaidBills.reduce(
    (sum: number, bill: any) => sum + bill.total,
    0
  );

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
                  บิลค่าเช่า
                </h1>
                <p className="text-sm text-gray-600">
                  ดูประวัติและจัดการบิลค่าเช่า
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-gray-600 text-sm">บิลทั้งหมด</p>
              <p className="text-3xl font-bold text-gray-800">{bills.length}</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="text-3xl mb-2">⏳</div>
              <p className="text-gray-600 text-sm">บิลค้างชำระ</p>
              <p className="text-3xl font-bold text-orange-600">
                {unpaidBills.length}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="text-3xl mb-2">💸</div>
              <p className="text-gray-600 text-sm">ยอดค้างชำระ</p>
              <p className="text-3xl font-bold text-red-600">
                ฿{totalUnpaid.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Unpaid Bills Section */}
          {unpaidBills.length > 0 && (
            <div className="mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>บิลค้างชำระ</span>
                    <span className="ml-auto text-orange-600">
                      ({unpaidBills.length})
                    </span>
                  </h3>
                </div>
                <div className="p-4 lg:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unpaidBills.map((bill: any) => (
                      <div
                        key={bill.id}
                        className="bg-white border-2 border-orange-200 rounded-xl p-4 lg:p-6 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {bill.room?.name || "ห้อง"}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {new Date(bill.billDate).toLocaleDateString(
                                "th-TH",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-orange-600">
                              ฿{bill.total.toLocaleString()}
                            </p>
                            <span className="inline-block mt-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                              ยังไม่ชำระ
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">ค่าเช่า:</span>
                            <span className="font-medium">
                              ฿{bill.rent?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">ค่าน้ำ:</span>
                            <span className="font-medium">
                              ฿{bill.water?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">ค่าไฟ:</span>
                            <span className="font-medium">
                              ฿{bill.electric?.toLocaleString()}
                            </span>
                          </div>
                          {bill.common > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">ค่าส่วนกลาง:</span>
                              <span className="font-medium">
                                ฿{bill.common?.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {bill.slipUrl ? (
                          <a
                            href={bill.slipUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-2 px-4 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors text-center"
                          >
                            📎 ดูสลิปที่อัปโหลด
                          </a>
                        ) : (
                          <div className="py-2 px-4 bg-gray-50 text-gray-500 rounded-lg text-sm text-center">
                            ยังไม่ได้อัปโหลดสลิป
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paid Bills Section */}
          {paidBills.length > 0 && (
            <div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span>✅</span>
                    <span>บิลที่ชำระแล้ว</span>
                    <span className="ml-auto text-green-600">
                      ({paidBills.length})
                    </span>
                  </h3>
                </div>
                <div className="p-4 lg:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paidBills.map((bill: any) => (
                      <div
                        key={bill.id}
                        className="bg-white border-2 border-green-200 rounded-xl p-4 lg:p-6 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {bill.room?.name || "ห้อง"}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {new Date(bill.billDate).toLocaleDateString(
                                "th-TH",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              ฿{bill.total.toLocaleString()}
                            </p>
                            <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              ชำระแล้ว
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">ค่าเช่า:</span>
                            <span className="font-medium">
                              ฿{bill.rent?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">ค่าน้ำ:</span>
                            <span className="font-medium">
                              ฿{bill.water?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">ค่าไฟ:</span>
                            <span className="font-medium">
                              ฿{bill.electric?.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {bill.slipUrl && (
                          <a
                            href={bill.slipUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full py-2 px-4 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors text-center"
                          >
                            📎 ดูสลิป
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Bills */}
          {bills.length === 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-white/50">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ยังไม่มีบิล
              </h3>
              <p className="text-gray-600">
                เมื่อมีบิลค่าเช่าจะแสดงที่นี่
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

