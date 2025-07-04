"use client";
import ReduxProvider from "@/store/provider";
import { SessionProvider } from "next-auth/react";
import AuthSync from "@/app/components/AuthSync";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <SessionProvider>
        <AuthSync />
        {children}
      </SessionProvider>
    </ReduxProvider>
  );
}
