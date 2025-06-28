"use client";
import Navbar from "../components/Navbar";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { loginStart, loginSuccess, loginFailure } from "../../store/authSlice";

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}
function validatePhone(phone: string) {
  return /^\d{9,15}$/.test(phone);
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name || !phone || !email || !password || !confirmPassword) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (!validateEmail(email)) {
      setError("อีเมลไม่ถูกต้อง");
      return;
    }
    if (!validatePhone(phone)) {
      setError("เบอร์โทรศัพท์ไม่ถูกต้อง");
      return;
    }
    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setLoading(true);
    dispatch(loginStart());
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("สมัครสมาชิกสำเร็จ กำลังเข้าสู่ระบบ...");
        dispatch(
          loginSuccess({
            token: "",
            user: { email, id: data.user.id, name, phone },
          })
        );
        setTimeout(() => router.push("/"), 1000);
      } else {
        setError(data.message || "Register failed");
        dispatch(loginFailure(data.message || "Register failed"));
      }
    } catch (err) {
      setError("Register failed");
      dispatch(loginFailure("Register failed"));
    } finally {
      setLoading(false);
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
            สมัครสมาชิกจัดการหอพัก
          </h1>
          <div>
            <label className="block mb-1">ชื่อ-นามสกุล</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">เบอร์โทรศัพท์</label>
            <input
              type="tel"
              className="w-full border px-3 py-2 rounded"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
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
          <div>
            <label className="block mb-1">ยืนยันรหัสผ่าน</label>
            <input
              type="password"
              className="w-full border px-3 py-2 rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-center">{error}</div>}
          {success && (
            <div className="text-green-600 text-center">{success}</div>
          )}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold"
            disabled={loading}
          >
            {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
          </button>
          <div className="mt-2 text-center">
            <a href="/login" className="text-blue-600 hover:underline">
              เข้าสู่ระบบ
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
