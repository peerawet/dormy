"use client";
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ValidatedInput from "./ValidatedInput";
import {
  validators,
  validateForm,
  FieldValidation,
} from "../../utils/validation";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    address: "",
    idCard: "",
    email: "",
    promptpay: "",
  });
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldValidation>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isOpen && auth.token) {
      console.log("Modal opened, fetching profile..."); // Debug log
      fetchProfile();
    } else if (!isOpen) {
      // Reset profile state when modal closes
      console.log("Modal closed, resetting profile state..."); // Debug log
      setProfile({
        name: "",
        phone: "",
        address: "",
        idCard: "",
        email: "",
        promptpay: "",
      });
      setMessage("");
      setLoading(false);
      setDataLoaded(false);
      setFieldErrors({});
      setHasSubmitted(false);
    }
  }, [isOpen, auth.token]);

  // Validation rules
  const validationRules = useMemo(
    () => ({
      name: [
        (value: string) => validators.required(value, "ชื่อ"),
        (value: string) => validators.minLength(value, 2, "ชื่อ"),
        (value: string) => validators.maxLength(value, 100, "ชื่อ"),
      ],
      phone: [
        (value: string) => validators.required(value, "เบอร์โทรศัพท์"),
        (value: string) => validators.phone(value),
      ],
      address: [
        (value: string) => validators.required(value, "ที่อยู่"),
        (value: string) => validators.minLength(value, 10, "ที่อยู่"),
        (value: string) => validators.maxLength(value, 500, "ที่อยู่"),
      ],
      idCard: [(value: string) => validators.idCard(value)],
      promptpay: [(value: string) => validators.promptpay(value)],
    }),
    []
  );

  // Real-time validation
  const { isValid: isFormValid, errors } = useMemo(() => {
    return validateForm(profile, validationRules);
  }, [profile, validationRules]);

  useEffect(() => {
    setFieldErrors(errors);
  }, [errors]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();

      console.log("Profile API Response:", data); // Debug log

      if (data.success && data.user) {
        console.log("Setting profile data:", data.user); // Debug log
        setProfile({
          name: data.user.name || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
          idCard: data.user.idCard || "",
          email: data.user.email || "",
          promptpay: data.user.promptpay || "",
        });
        setDataLoaded(true);
      } else {
        console.error("Profile fetch failed:", data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setHasSubmitted(true);

    if (!isFormValid) {
      setMessage("กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          idCard: profile.idCard,
          promptpay: profile.promptpay,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("บันทึกข้อมูลเรียบร้อยแล้ว");
        setTimeout(() => {
          setMessage("");
          onClose();
        }, 1500);
      } else {
        setMessage(data.message || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-2xl">👤</span>
            ข้อมูลส่วนตัว
          </h2>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Info Banner */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💡</span>
              <h3 className="font-semibold text-blue-900">ข้อมูลสำคัญ</h3>
            </div>
            <p className="text-blue-700 text-sm">
              ข้อมูลเหล่านี้จะถูกใช้ในการสร้างสัญญาเช่า
              กรุณากรอกให้ถูกต้องและครบถ้วน
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes("เรียบร้อย")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{message.includes("เรียบร้อย") ? "✅" : "❌"}</span>
                <span>{message}</span>
              </div>
            </div>
          )}

          {/* No Data State */}
          {!loading && !dataLoaded && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">😞</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                ไม่สามารถโหลดข้อมูลได้
              </h3>
              <p className="text-gray-600 mb-4">
                เกิดข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง
              </p>
              <button
                onClick={fetchProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 ลองใหม่
              </button>
            </div>
          )}

          {/* Form */}
          {!loading && dataLoaded && (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-6">
                {/* Email (Read-only) */}
                <ValidatedInput
                  label="อีเมล"
                  value={profile.email}
                  onChange={() => {}} // No-op for read-only
                  type="email"
                  disabled={true}
                  icon="📧"
                />
                <p className="text-xs text-gray-500 -mt-4 ml-1">
                  ✨ ไม่สามารถแก้ไขอีเมลได้
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <ValidatedInput
                    label="ชื่อ-นามสกุล"
                    value={profile.name}
                    onChange={(value) =>
                      setProfile({ ...profile, name: value })
                    }
                    validation={fieldErrors.name}
                    placeholder="กรอกชื่อ-นามสกุล"
                    required
                    icon="👤"
                    disabled={saving}
                  />

                  {/* Phone */}
                  <ValidatedInput
                    label="เบอร์โทรศัพท์"
                    value={profile.phone}
                    onChange={(value) =>
                      setProfile({ ...profile, phone: value })
                    }
                    validation={fieldErrors.phone}
                    placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก"
                    type="tel"
                    required
                    icon="📱"
                    disabled={saving}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ID Card */}
                  <ValidatedInput
                    label="เลขบัตรประชาชน"
                    value={profile.idCard}
                    onChange={(value) =>
                      setProfile({ ...profile, idCard: value })
                    }
                    validation={fieldErrors.idCard}
                    placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
                    icon="🆔"
                    disabled={saving}
                  />

                  {/* PromptPay */}
                  <ValidatedInput
                    label="หมายเลข PromptPay"
                    value={profile.promptpay}
                    onChange={(value) =>
                      setProfile({ ...profile, promptpay: value })
                    }
                    validation={fieldErrors.promptpay}
                    placeholder="เบอร์โทร 10 หลัก หรือเลขบัตรประชาชน 13 หลัก"
                    icon="💳"
                    disabled={saving}
                  />
                </div>

                {/* Address - Full width */}
                <ValidatedInput
                  label="ที่อยู่"
                  value={profile.address}
                  onChange={(value) =>
                    setProfile({ ...profile, address: value })
                  }
                  validation={fieldErrors.address}
                  placeholder="กรอกที่อยู่ที่สามารถติดต่อได้"
                  type="textarea"
                  required
                  icon="📍"
                  rows={3}
                  disabled={saving}
                />
              </div>

              {/* Form validation summary */}
              {hasSubmitted && !isFormValid && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
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
                              <li
                                key={field}
                                className="flex items-center gap-2"
                              >
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
                  disabled={saving}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving || (!isFormValid && hasSubmitted)}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    saving
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                      : isFormValid
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-gray-600"></div>
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>บันทึกข้อมูล</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  // ใช้ Portal เพื่อ render modal ที่ body
  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
