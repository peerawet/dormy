"use client";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 py-16 bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-5xl font-extrabold mb-4 text-center text-blue-900 drop-shadow">
          ระบบจัดการหอพักออนไลน์
        </h1>
        <p className="text-xl text-gray-700 mb-8 text-center max-w-2xl">
          Dormy SaaS แพลตฟอร์มสำหรับเจ้าของหอพักและผู้เช่า
          ช่วยให้การจัดการหอพักเป็นเรื่องง่าย สะดวก และปลอดภัย
        </p>
        <a
          href="/login"
          className="bg-blue-600 text-white px-10 py-4 rounded text-xl font-semibold hover:bg-blue-700 shadow"
        >
          เริ่มต้นใช้งาน
        </a>
      </section>
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 text-blue-800">
            ฟีเจอร์เด่นของ Dormy SaaS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-6 rounded shadow flex flex-col items-center hover:scale-105 transition-transform">
              <span className="text-4xl mb-2">🏢</span>
              <h3 className="font-semibold text-lg mb-2">
                จัดการห้องพักและผู้เช่า
              </h3>
              <p className="text-gray-600 text-center">
                เพิ่ม/ลบห้องพัก ดูสถานะห้องพัก
                และจัดการข้อมูลผู้เช่าได้อย่างง่ายดาย
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded shadow flex flex-col items-center hover:scale-105 transition-transform">
              <span className="text-4xl mb-2">💸</span>
              <h3 className="font-semibold text-lg mb-2">
                ระบบแจ้งเตือนและชำระเงิน
              </h3>
              <p className="text-gray-600 text-center">
                แจ้งเตือนค่าเช่าอัตโนมัติ รองรับการชำระเงินออนไลน์และออกใบเสร็จ
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded shadow flex flex-col items-center hover:scale-105 transition-transform">
              <span className="text-4xl mb-2">📊</span>
              <h3 className="font-semibold text-lg mb-2">รายงานและสถิติ</h3>
              <p className="text-gray-600 text-center">
                ดูรายงานรายรับ-รายจ่าย และสถิติการเช่าแบบเรียลไทม์
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded shadow flex flex-col items-center hover:scale-105 transition-transform">
              <span className="text-4xl mb-2">🔒</span>
              <h3 className="font-semibold text-lg mb-2">
                ปลอดภัยและใช้งานง่าย
              </h3>
              <p className="text-gray-600 text-center">
                ข้อมูลปลอดภัยด้วยมาตรฐานสากล ใช้งานง่ายทั้งเจ้าของและผู้เช่า
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          เริ่มต้นใช้งาน Dormy SaaS วันนี้!
        </h2>
        <p className="mb-8 text-lg">
          สมัครสมาชิกฟรี ทดลองใช้งานทุกฟีเจอร์ ไม่ต้องใช้บัตรเครดิต
        </p>
        <a
          href="/register"
          className="bg-white text-blue-700 px-8 py-3 rounded text-lg font-semibold hover:bg-blue-100 shadow"
        >
          สมัครสมาชิกฟรี
        </a>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-200 py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <img src="/next.svg" alt="Logo" className="h-6 w-6" />
            <span className="font-bold">Dormy</span>
          </div>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} Dormy SaaS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
