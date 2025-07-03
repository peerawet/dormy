"use client";
import Navbar from "./components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardOverview from "./components/DashboardOverview";
import RevenueChart from "./components/RevenueChart";
import TenantCard from "./components/TenantCard";
import DormCardList from "./components/DormCardList";
import RoomCardList from "./components/RoomCardList";
import ContractPreviewDisplay from "./components/ContractPreviewDisplay";
import BillReceiptDisplay from "./components/BillReceiptDisplay";

export default function Home() {
  const auth = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (auth.token) {
      router.replace("/dashboard");
    }
  }, [auth.token, router]);

  // Don't render content if user is authenticated (being redirected)
  if (auth.token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังเข้าสู่แดชบอร์ด...</p>
        </div>
      </div>
    );
  }

  // Mock data for preview
  const mockDorms = [
    {
      id: 1,
      name: "หอพัก A",
      address: "123 ถนนสุขุมวิท กรุงเทพฯ",
      rooms: [
        {
          id: 101,
          name: "A101",
          price: 4500,
          waterRate: 18,
          electricRate: 7,
          tenantRooms: [{ tenant: { name: "สมชาย" } }],
          rentalContracts: [
            {
              startDate: new Date().toISOString(),
              endDate: new Date(
                new Date().setMonth(new Date().getMonth() + 6)
              ).toISOString(),
              deposit: 9000,
              insurance: 3000,
            },
          ],
        },
        {
          id: 102,
          name: "A102",
          price: 4500,
          waterRate: 18,
          electricRate: 7,
          tenantRooms: [],
          rentalContracts: [],
        },
      ],
    },
    {
      id: 2,
      name: "หอพัก B",
      address: "456 ถนนพหลโยธิน กรุงเทพฯ",
      rooms: [
        {
          id: 201,
          name: "B201",
          price: 5500,
          waterRate: 20,
          electricRate: 8,
          tenantRooms: [
            { tenant: { name: "วิภา" } },
            { tenant: { name: "อนันต์" } },
          ],
          rentalContracts: [
            {
              startDate: new Date().toISOString(),
              endDate: new Date(
                new Date().setDate(new Date().getDate() + 20)
              ).toISOString(),
              deposit: 11000,
              insurance: 4000,
            },
          ],
        },
      ],
    },
  ];

  const mockRooms = mockDorms[0].rooms;

  const mockContract = {
    id: 1001,
    roomId: 101,
    startDate: new Date().toISOString(),
    endDate: new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    ).toISOString(),
    deposit: 9000,
    insurance: 3000,
    tenant: {
      name: "สมชาย ใจดี",
      phone: "0812345678",
      idCard: "1234567890123",
      address: "123 ถนนสุขุมวิท",
    },
    room: {
      id: 101,
      name: "A101",
      price: 4500,
      dormitory: {
        name: "หอพัก A",
        address: "123 ถนนสุขุมวิท กรุงเทพฯ",
        owner: {
          name: "คุณเจ้าของ",
          phone: "0899999999",
          idCard: "1111222233334",
          address: "123 ถนนสุขุมวิท",
        },
      },
      waterRate: 18,
      electricRate: 7,
      waterFlat: null,
      electricFlat: null,
      commonFee: null,
      otherFee: null,
    },
  };

  const mockBill = {
    id: 555,
    billDate: new Date().toISOString(),
    tenant: { id: 1, name: "สมชาย ใจดี", phone: "0812345678" },
    room: {
      id: 101,
      name: "A101",
      dormitory: {
        id: 1,
        name: "หอพัก A",
        address: "123 ถนนสุขุมวิท กรุงเทพฯ",
        owner: {
          name: "คุณเจ้าของ",
          phone: "0899999999",
          promptpay: "0899999999",
        },
      },
    },
    water: 120,
    electric: 350,
    common: 200,
    other: 0,
    rent: 4500,
    discount: 0,
    total: 120 + 350 + 200 + 4500,
    meterWaterStart: 1000,
    meterWaterEnd: 1010,
    meterElectricStart: 5000,
    meterElectricEnd: 5050,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center flex-1 py-20 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100/80 backdrop-blur-sm text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200/50">
            <span className="animate-pulse">✨</span>
            <span>แพลตฟอร์มจัดการหอพัก</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 leading-tight">
            Dormy
            <br />
            <span className="text-3xl md:text-5xl lg:text-6xl">
              ระบบจัดการหอพัก
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            <span className="font-semibold text-blue-700">Dormy</span>{" "}
            ระบบจัดการหอพักครบวงจรที่ช่วยให้คุณบริหารจัดการได้อย่างมีประสิทธิภาพ
            <br />
            จัดการห้องพัก ผู้เช่า สัญญาเช่า บิลค่าเช่า และรายงานทางการเงิน
            ในที่เดียว
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/register"
              className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              <span>🚀</span>
              <span>เริ่มต้นใช้งานฟรี</span>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            </Link>
            <Link
              href="/login"
              className="group relative bg-white/80 backdrop-blur-sm text-blue-700 border-2 border-blue-200 hover:border-blue-300 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white flex items-center gap-3"
            >
              <span>🔑</span>
              <span>เข้าสู่ระบบ</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">ระบบจัดการครบวงจร</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                24/7
              </div>
              <div className="text-gray-600">ใช้งานได้ตลอดเวลา</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">ฟรี</div>
              <div className="text-gray-600">เริ่มต้นใช้งานฟรี</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span>⚡</span>
              <span>ฟีเจอร์ที่ทำให้ธุรกิจของคุณเติบโต</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              ทำไมต้อง{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Dormy
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              เครื่องมือครบครันที่ออกแบบมาเพื่อให้การจัดการหอพักของคุณง่ายและมีประสิทธิภาพมากขึ้น
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-blue-200/50 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  🏢
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">
                  จัดการหอพักและห้องพัก
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  สร้างและจัดการหอพัก เพิ่ม/แก้ไขห้องพัก ตั้งค่าราคาเช่า ค่าน้ำ
                  ค่าไฟ และดูสถานะห้องพักแบบเรียลไทม์
                </p>
              </div>
            </div>

            <div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-indigo-200/50 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  👥
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">
                  จัดการผู้เช่าและสัญญา
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  เพิ่มข้อมูลผู้เช่า สร้างสัญญาเช่า ติดตามวันหมดอายุสัญญา
                  และจัดการค่ามัดจำ ค่าประกันอย่างเป็นระบบ
                </p>
              </div>
            </div>

            <div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-purple-200/50 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  💰
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">
                  ระบบบิลและการเงิน
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  สร้างบิลค่าเช่า ค่าน้ำ ค่าไฟ ออกใบเสร็จ
                  และติดตามสถานะการชำระเงินของผู้เช่า
                </p>
              </div>
            </div>

            <div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-green-200/50 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  📊
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">
                  รายงานและสถิติ
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  ดูรายงานรายรับ-รายจ่าย กราฟแนวโน้ม สถิติการเช่า
                  และข้อมูลทางการเงินแบบเรียลไทม์
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-20 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span>📱</span>
              <span>ดูตัวอย่างการใช้งาน</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              หน้าตาจริงของ{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Dormy
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ดูหน้าจอการใช้งานจริงของระบบ Dormy ที่ออกแบบมาให้ใช้งานง่าย
              เข้าใจง่าย
            </p>
          </div>

          {/* Preview Components */}
          <div className="space-y-12">
            {/* Dashboard Preview */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                📊 แดชบอร์ด - ภาพรวมการเงิน
              </h3>
              <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl p-8 border border-white/50">
                <DashboardOverview
                  stats={{
                    totalRooms: 24,
                    occupiedRooms: 20,
                    availableRooms: 4,
                    occupancyRate: "83.3",
                    totalTenants: 25,
                    monthlyRevenue: 120000,
                    totalBills: 15,
                  }}
                  totalExpenses={25000}
                  monthlyGrowth={{
                    change: 15000,
                    percentage: 14.3,
                    isPositive: true,
                  }}
                  expenseGrowth={{
                    change: -2000,
                    percentage: -7.4,
                    isPositive: false,
                  }}
                  waterExpense={{
                    amount: 8500,
                    growth: {
                      change: 500,
                      percentage: 6.25,
                      isPositive: true,
                    },
                  }}
                  electricExpense={{
                    amount: 12000,
                    growth: {
                      change: -800,
                      percentage: -6.25,
                      isPositive: false,
                    },
                  }}
                  formatCurrency={(amount) => `฿${amount.toLocaleString()}`}
                />
              </div>
            </div>

            {/* Tenant Cards Preview */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                👥 จัดการผู้เช่า - ข้อมูลผู้เช่า
              </h3>
              <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl p-8 border border-white/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <TenantCard
                    tenant={{
                      id: 1,
                      name: "นายสมชาย ใจดี",
                      phone: "081-234-5678",
                      idCard: "1234567890123",
                      address: "123 ถนนสุขุมวิท กรุงเทพฯ 10110",
                      rooms: [
                        {
                          room: {
                            id: 1,
                            name: "101",
                            dormitory: {
                              id: 1,
                              name: "หอพักสวนสน",
                            },
                          },
                        },
                      ],
                    }}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                  <TenantCard
                    tenant={{
                      id: 2,
                      name: "นางสาวสมหญิง รักดี",
                      phone: "089-876-5432",
                      idCard: "9876543210987",
                      address: "456 ถนนพหลโยธิน กรุงเทพฯ 10400",
                      rooms: [
                        {
                          room: {
                            id: 2,
                            name: "205",
                            dormitory: {
                              id: 1,
                              name: "หอพักสวนสน",
                            },
                          },
                        },
                      ],
                    }}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                  <TenantCard
                    tenant={{
                      id: 3,
                      name: "นายวิชัย เก่งมาก",
                      phone: "092-111-2222",
                      idCard: "5555666677778",
                      address: "789 ถนนรัชดาภิเษก กรุงเทพฯ 10310",
                      rooms: [
                        {
                          room: {
                            id: 3,
                            name: "102",
                            dormitory: {
                              id: 2,
                              name: "หอพักบ้านสวย",
                            },
                          },
                        },
                      ],
                    }}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                </div>
              </div>
            </div>

            {/* Dorms Preview */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                🏢 จัดการหอพัก - รายการหอพัก
              </h3>
              <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl p-8 border border-white/50">
                <DormCardList
                  dorms={mockDorms}
                  onEditDorm={() => {}}
                  onAddRoom={() => {}}
                  onEditRoom={() => {}}
                />
              </div>
            </div>

            {/* Contract Preview */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                📄 ตัวอย่างสัญญาเช่า
              </h3>
              <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl p-8 border border-white/50 overflow-x-auto">
                <div className="min-w-[800px]">
                  <ContractPreviewDisplay contract={mockContract} token="" />
                </div>
              </div>
            </div>

            {/* Bill Receipt Preview */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                🧾 ตัวอย่างใบเสร็จ
              </h3>
              <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-2xl p-8 border border-white/50 overflow-x-auto">
                <div className="min-w-[800px]">
                  <BillReceiptDisplay bill={mockBill} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]"></div>
        </div>
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
            <span>🎉</span>
            <span>เริ่มต้นใช้งานฟรี ไม่มีค่าใช้จ่าย</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            พร้อมเปลี่ยนวิธีจัดการ
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">
              หอพักของคุณแล้วหรือยัง?
            </span>
          </h2>

          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            เริ่มต้นใช้งาน Dormy วันนี้ จัดการหอพักของคุณได้อย่างมีประสิทธิภาพ
            <br />
            <span className="text-yellow-200 font-semibold">
              ระบบครบวงจร ใช้งานง่าย!
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/register"
              className="group relative bg-white text-blue-700 hover:text-blue-800 px-8 py-4 rounded-xl text-lg font-bold shadow-2xl hover:shadow-white/20 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              <span>🚀</span>
              <span>เริ่มต้นใช้งานฟรี</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-100/20 to-orange-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            </Link>
            <div className="flex items-center gap-4 text-blue-100">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span className="text-sm">ใช้งานง่าย</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span className="text-sm">ใช้งานได้ทันที</span>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
            <div className="flex items-center gap-2 text-blue-200">
              <span>🛡️</span>
              <span className="text-sm">ข้อมูลปลอดภัย</span>
            </div>
            <div className="flex items-center gap-2 text-blue-200">
              <span>📱</span>
              <span className="text-sm">ใช้งานได้ทุกอุปกรณ์</span>
            </div>
            <div className="flex items-center gap-2 text-blue-200">
              <span>🏢</span>
              <span className="text-sm">จัดการหลายหอพัก</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Image
                    src="/next.svg"
                    alt="Logo"
                    width={24}
                    height={24}
                    className="h-6 w-6 invert"
                  />
                </div>
                <span className="text-2xl font-bold text-white">Dormy</span>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-md">
                ระบบจัดการหอพักครบวงจร
                ที่ช่วยให้การบริหารจัดการหอพักของคุณเป็นเรื่องง่าย มีประสิทธิภาพ
                และประหยัดเวลา
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">เมนูหลัก</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/login"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    เข้าสู่ระบบ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    สมัครสมาชิก
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    แดชบอร์ด
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dormitory"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    จัดการหอพัก
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tenants"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    จัดการผู้เช่า
                  </Link>
                </li>
                <li>
                  <Link
                    href="/expenses"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    รายจ่าย
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-semibold mb-4">ช่วยเหลือ</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="mailto:support@dormy.app"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ติดต่อสนับสนุน
                  </a>
                </li>
                <li>
                  <span className="text-slate-400 hover:text-white transition-colors">
                    เอกสารคู่มือ
                  </span>
                </li>
                <li>
                  <span className="text-slate-400 hover:text-white transition-colors">
                    วิดีโอสอนใช้งาน
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6 flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-slate-400 mb-4 sm:mb-0">
              &copy; {new Date().getFullYear()} Dormy. สงวนลิขสิทธิ์ทุกประการ
            </div>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                นโยบายความเป็นส่วนตัว
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors"
              >
                เงื่อนไขการใช้งาน
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
