"use client";
import Navbar from "../components/Navbar";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { loginStart, loginSuccess, loginFailure } from "../../store/authSlice";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    dispatch(loginStart());
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        // You may want to decode user info from token or fetch user info here
        dispatch(loginSuccess({ token: data.token, user: { email, id: 0 } }));
        router.push("/dashboard");
      } else {
        setError(data.message || "Login failed");
        dispatch(loginFailure(data.message || "Login failed"));
      }
    } catch (err) {
      setError("Login failed");
      dispatch(loginFailure("Login failed"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center py-12">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4"
        >
          <h1 className="text-2xl font-bold text-center mb-2">
            เข้าสู่ระบบจัดการหอพัก
          </h1>
          <div>
            <label className="block mb-1">อีเมล</label>
            <input
              type="email"
              className="w-full border px-3 py-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">รหัสผ่าน</label>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-center">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
          >
            เข้าสู่ระบบ
          </button>
          <div className="mt-2 text-center">
            <a href="/register" className="text-blue-600 hover:underline">
              สมัครสมาชิก
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
