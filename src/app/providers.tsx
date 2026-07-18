"use client";
import ReduxProvider from "@/store/provider";
import { SessionProvider } from "next-auth/react";
import AuthSync from "@/app/components/AuthSync";
import SessionExpiredGuard from "@/app/components/SessionExpiredGuard";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <SessionProvider>
        <AuthSync />
        <SessionExpiredGuard />
        {children}
      </SessionProvider>
    </ReduxProvider>
  );
}
