"use client";
import Navbar from "../components/Navbar";
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { loginStart, loginSuccess, loginFailure } from "@/store/authSlice";
import { RootState } from "@/store";
import Link from "next/link";
import ValidatedInput from "../components/ValidatedInput";
import {
  validators,
  validateForm,
  FieldValidation,
} from "../../utils/validation";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldValidation>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { token } = useSelector((state: RootState) => state.auth);

  // Validation rules
  const validationRules = useMemo(
    () => ({
      name: [
        (value: string) => validators.required(value, "ชื่อ-นามสกุล"),
        (value: string) => validators.minLength(value, 2, "ชื่อ-นามสกุล"),
        (value: string) => validators.maxLength(value, 100, "ชื่อ-นามสกุล"),
      ],
      phone: [
        (value: string) => validators.required(value, "เบอร์โทรศัพท์"),
        (value: string) => validators.phone(value),
      ],
      email: [
        (value: string) => validators.required(value, "อีเมล"),
        (value: string) => {
          const emailRegex = /\S+@\S+\.\S+/;
          return emailRegex.test(value)
            ? { isValid: true, message: "" }
            : { isValid: false, message: "รูปแบบอีเมลไม่ถูกต้อง" };
        },
      ],
      password: [
        (value: string) => validators.required(value, "รหัสผ่าน"),
        (value: string) => validators.minLength(value, 6, "รหัสผ่าน"),
      ],
      confirmPassword: [
        (value: string) => validators.required(value, "ยืนยันรหัสผ่าน"),
        (value: string) => {
          return value === form.password
            ? { isValid: true, message: "" }
            : { isValid: false, message: "รหัสผ่านไม่ตรงกัน" };
        },
      ],
    }),
    [form.password]
  );

  // Real-time validation
  const { isValid: isFormValid, errors } = useMemo(() => {
    return validateForm(form, validationRules);
  }, [form, validationRules]);

  useEffect(() => {
    setFieldErrors(errors);
  }, [errors]);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setHasSubmitted(true);

    if (!isFormValid) {
      setError("กรุณาตรวจสอบข้อมูลให้ถูกต้อง");
      return;
    }

    setLoading(true);
    dispatch(loginStart());
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("สมัครสมาชิกสำเร็จ กำลังเข้าสู่ระบบ...");
        dispatch(
          loginSuccess({
            token: "",
            user: {
              email: form.email,
              id: data.user.id,
              name: form.name,
              phone: form.phone,
            },
          })
        );
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        setError(data.message || "การสมัครสมาชิกล้มเหลว");
        dispatch(loginFailure(data.message || "Register failed"));
      }
    } catch {
      setError("การสมัครสมาชิกล้มเหลว");
      dispatch(loginFailure("Register failed"));
    } finally {
      setLoading(false);
    }
  };

  // Don't render content if user is authenticated (being redirected)
  if (token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            คุณล็อกอินแล้ว กำลังเข้าสู่แดชบอร์ด...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <Navbar />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-2xl border border-white/50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">กำลังสมัครสมาชิก...</p>
          </div>
        </div>
      )}

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-100/20 to-pink-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="flex flex-1 items-center justify-center py-12 px-6 relative z-10">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 backdrop-blur-sm text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-blue-200/50">
              <span>✨</span>
              <span>สมัครสมาชิก</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 mb-2">
              เริ่มต้นกับ Dormy
            </h1>
            <p className="text-gray-600">
              สร้างบัญชีเพื่อจัดการหอพักอย่างมืออาชีพ
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50 space-y-6"
          >
            {/* Name Field */}
            <ValidatedInput
              label="ชื่อ-นามสกุล"
              value={form.name}
              onChange={(value) => setForm((f) => ({ ...f, name: value }))}
              validation={fieldErrors.name}
              placeholder="กรอกชื่อ-นามสกุลของคุณ"
              required
              icon="👤"
              disabled={loading}
            />

            {/* Phone Field */}
            <ValidatedInput
              label="เบอร์โทรศัพท์"
              value={form.phone}
              onChange={(value) => setForm((f) => ({ ...f, phone: value }))}
              validation={fieldErrors.phone}
              type="tel"
              placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก"
              required
              icon="📱"
              disabled={loading}
            />

            {/* Email Field */}
            <ValidatedInput
              label="อีเมล"
              value={form.email}
              onChange={(value) => setForm((f) => ({ ...f, email: value }))}
              validation={fieldErrors.email}
              type="email"
              placeholder="กรอกอีเมลของคุณ"
              required
              icon="📧"
              disabled={loading}
            />

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2">
                  <span className="text-lg">🔒</span>
                  รหัสผ่าน
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 bg-white/80 backdrop-blur-sm ${
                    fieldErrors.password && !fieldErrors.password.isValid
                      ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500/20"
                      : fieldErrors.password &&
                        fieldErrors.password.isValid &&
                        form.password
                      ? "border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500/20"
                      : "border-gray-200 text-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {fieldErrors.password && !fieldErrors.password.isValid && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <span className="text-xs">⚠️</span>
                  <span>{fieldErrors.password.message}</span>
                </div>
              )}
              {fieldErrors.password &&
                fieldErrors.password.isValid &&
                form.password && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <span className="text-xs">✅</span>
                    <span>ถูกต้อง</span>
                  </div>
                )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2">
                  <span className="text-lg">🔐</span>
                  ยืนยันรหัสผ่าน
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 bg-white/80 backdrop-blur-sm ${
                    fieldErrors.confirmPassword &&
                    !fieldErrors.confirmPassword.isValid
                      ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500/20"
                      : fieldErrors.confirmPassword &&
                        fieldErrors.confirmPassword.isValid &&
                        form.confirmPassword
                      ? "border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500/20"
                      : "border-gray-200 text-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                  }
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {fieldErrors.confirmPassword &&
                !fieldErrors.confirmPassword.isValid && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <span className="text-xs">⚠️</span>
                    <span>{fieldErrors.confirmPassword.message}</span>
                  </div>
                )}
              {fieldErrors.confirmPassword &&
                fieldErrors.confirmPassword.isValid &&
                form.confirmPassword && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <span className="text-xs">✅</span>
                    <span>ถูกต้อง</span>
                  </div>
                )}
            </div>

            {/* Form validation summary */}
            {hasSubmitted && !isFormValid && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-600 text-lg">⚠️</span>
                  <div>
                    <p className="text-yellow-800 font-medium mb-2">
                      กรุณาตรวจสอบข้อมูล:
                    </p>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      {Object.entries(fieldErrors).map(
                        ([field, validation]) =>
                          !validation.isValid && (
                            <li key={field} className="flex items-center gap-2">
                              <span>•</span>
                              <span>{validation.message}</span>
                            </li>
                          )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <span className="text-red-500">⚠️</span>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <span className="text-green-500">✅</span>
                <span className="text-green-700 text-sm">{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (!isFormValid && hasSubmitted)}
              className={`w-full py-4 rounded-xl font-semibold text-lg shadow-xl transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3 ${
                loading
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : isFormValid
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-2xl hover:scale-[1.02]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-gray-600"></div>
                  <span>กำลังสมัครสมาชิก...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>สมัครสมาชิกฟรี</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-gray-500">หรือ</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-600 mb-3">มีบัญชีอยู่แล้ว?</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              >
                <span>🔑</span>
                <span>เข้าสู่ระบบ</span>
              </Link>
            </div>
          </form>

          {/* Benefits */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-white/50">
              <div className="text-2xl mb-2">🆓</div>
              <div className="text-xs text-gray-600 font-medium">ใช้งานฟรี</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-white/50">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-xs text-gray-600 font-medium">
                เริ่มได้ทันที
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-white/50">
              <div className="text-2xl mb-2">🛡️</div>
              <div className="text-xs text-gray-600 font-medium">ปลอดภัย</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
