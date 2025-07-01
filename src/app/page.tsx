"use client";
import Navbar from "./components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
            <span>แพลตฟอร์มจัดการหอพักสมัยใหม่</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 leading-tight">
            ระบบจัดการหอพัก
            <br />
            <span className="text-3xl md:text-5xl lg:text-6xl">ยุคดิจิทัล</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            <span className="font-semibold text-blue-700">Dormy</span>{" "}
            แพลตฟอร์มครบวงจรสำหรับเจ้าของหอพักและผู้เช่า
            <br />
            ช่วยให้การจัดการหอพักเป็นเรื่องง่าย สะดวก และมีประสิทธิภาพ
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
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">หอพักที่ไว้วางใจ</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                10K+
              </div>
              <div className="text-gray-600">ผู้เช่าที่พึงพอใจ</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                99.9%
              </div>
              <div className="text-gray-600">ระบบที่เสถียร</div>
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
                  จัดการห้องพักและผู้เช่า
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  เพิ่ม/ลบห้องพัก ดูสถานะห้องพัก
                  และจัดการข้อมูลผู้เช่าได้อย่างง่ายดาย
                  พร้อมระบบค้นหาและกรองข้อมูลที่ทรงพลัง
                </p>
              </div>
            </div>

            <div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-indigo-200/50 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  💸
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">
                  ระบบแจ้งเตือนและชำระเงิน
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  แจ้งเตือนค่าเช่าอัตโนมัติ รองรับการชำระเงินออนไลน์
                  และออกใบเสร็จดิจิทัลแบบครบวงจร
                </p>
              </div>
            </div>

            <div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-purple-200/50 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  📊
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">
                  รายงานและสถิติ
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  ดูรายงานรายรับ-รายจ่าย และสถิติการเช่าแบบเรียลไทม์
                  พร้อมกราฟและชาร์ตที่เข้าใจง่าย
                </p>
              </div>
            </div>

            <div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 hover:border-green-200/50 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  🔒
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">
                  ปลอดภัยและใช้งานง่าย
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  ข้อมูลปลอดภัยด้วยมาตรฐานสากล ใช้งานง่ายทั้งเจ้าของและผู้เช่า
                  พร้อมการสำรองข้อมูลอัตโนมัติ
                </p>
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
            <span>เริ่มต้นฟรี ไม่มีค่าใช้จ่าย</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            พร้อมเปลี่ยนวิธีจัดการ
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">
              หอพักของคุณแล้วหรือยัง?
            </span>
          </h2>

          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            สมัครสมาชิกฟรี ทดลองใช้งานทุกฟีเจอร์ ไม่ต้องใช้บัตรเครดิต
            <br />
            <span className="text-yellow-200 font-semibold">
              เริ่มต้นได้ใน 2 นาที!
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
                <span className="text-sm">ไม่ต้องบัตรเครดิต</span>
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
              <span className="text-sm">ข้อมูลปลอดภัย 100%</span>
            </div>
            <div className="flex items-center gap-2 text-blue-200">
              <span>⭐</span>
              <span className="text-sm">รีวิว 4.9/5 ดาว</span>
            </div>
            <div className="flex items-center gap-2 text-blue-200">
              <span>📞</span>
              <span className="text-sm">ซัพพอร์ต 24/7</span>
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
                แพลตฟอร์มจัดการหอพักสมัยใหม่
                ที่ช่วยให้การดูแลธุรกิจหอพักของคุณเป็นเรื่องง่าย สะดวก
                และมีประสิทธิภาพ
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
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-semibold mb-4">ช่วยเหลือ</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/faq"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    คำถามที่พบบ่อย
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:support@dormy.com"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ติดต่อสนับสนุน
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+66-2-xxx-xxxx"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    โทร 02-xxx-xxxx
                  </a>
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
