"use client";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { logout } from "@/store/authSlice";
import { logoutTenant } from "@/store/tenantAuthSlice";
import { AppDispatch } from "@/store";

// 401 จาก endpoint เหล่านี้คือ login ไม่ผ่าน ไม่ใช่ session หมดอายุ
const EXCLUDED_PATHS = [
  "/api/login",
  "/api/register",
  "/api/auth",
  "/api/tenant-auth/login-link",
];

export default function SessionExpiredGuard() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const redirectingRef = useRef(false);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      const response = await originalFetch(input, init);

      if (response.status !== 401 || redirectingRef.current) {
        return response;
      }

      const rawUrl =
        typeof input === "string"
          ? input
          : input instanceof URL
          ? input.href
          : input.url;
      const pathname = new URL(rawUrl, window.location.origin).pathname;

      const isApi = pathname.startsWith("/api/");
      const isExcluded = EXCLUDED_PATHS.some((p) => pathname.startsWith(p));

      if (isApi && !isExcluded) {
        redirectingRef.current = true;
        if (pathname.startsWith("/api/tenant-auth")) {
          // Session ผู้เช่าหมดอายุ
          dispatch(logoutTenant());
          router.replace("/tenant-login?expired=1");
        } else {
          // Session เจ้าของหอหมดอายุ — ต้องล้าง NextAuth session ด้วย
          // ไม่งั้น AuthSync จะ set token เดิมที่หมดอายุกลับเข้า Redux
          dispatch(logout());
          await signOut({ redirect: false });
          router.replace("/login?expired=1");
        }
        setTimeout(() => {
          redirectingRef.current = false;
        }, 2000);
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [dispatch, router]);

  return null;
}
