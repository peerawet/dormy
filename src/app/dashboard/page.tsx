"use client";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!auth.token) {
      router.replace("/login");
    }
  }, [auth.token, router]);

  // Optionally, you can show a loading state while checking auth
  if (!auth.token) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-16">
        <h1 className="text-3xl font-bold mb-4">แดชบอร์ดผู้ใช้</h1>
        <p className="text-lg text-gray-700 mb-8">
          สวัสดี, {auth.user?.name || auth.user?.email}
        </p>
        {/* Add more dashboard content here */}
      </main>
    </div>
  );
}
