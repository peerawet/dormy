"use client";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "@/store/authSlice";

export default function AuthSync() {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (session?.appToken && session.appToken !== lastTokenRef.current) {
      lastTokenRef.current = session.appToken;
      dispatch(setToken(session.appToken));
      if (session.user) {
        dispatch(
          setUser({
            id: Number(session.userId) || 0,
            email: session.user.email ?? "",
            name: session.user.name ?? undefined,
            phone: undefined,
          })
        );
      }
    }
  }, [session, dispatch]);

  return null;
}
