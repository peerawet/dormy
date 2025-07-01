"use client";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  fallbackPath = "/login",
}: ProtectedRouteProps) {
  const { token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace(fallbackPath);
    }
  }, [token, router, fallbackPath]);

  // Show loading while checking authentication
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
