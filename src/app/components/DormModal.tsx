import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { addDorm, editDorm, deleteDorm } from "@/store/dormSlice";
import ValidatedInput from "@/app/components/ValidatedInput";
import {
  validators,
  validateForm,
  FieldValidation,
} from "../../utils/validation";

export default function DormModal({
  open,
  onClose,
  dorm,
  token,
}: {
  open: boolean;
  onClose: () => void;
  dorm: any | null;
  token: string;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const isEdit = !!dorm;
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldValidation>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Validation rules
  const validationRules = useMemo(
    () => ({
      name: [
        (value: string) => validators.required(value, "ชื่อหอพัก"),
        (value: string) => validators.minLength(value, 2, "ชื่อหอพัก"),
        (value: string) => validators.maxLength(value, 100, "ชื่อหอพัก"),
      ],
      address: [
        (value: string) => validators.required(value, "ที่อยู่หอพัก"),
        (value: string) => validators.minLength(value, 10, "ที่อยู่หอพัก"),
        (value: string) => validators.maxLength(value, 500, "ที่อยู่หอพัก"),
      ],
      phone: [
        (value: string) => validators.required(value, "เบอร์โทรศัพท์"),
        (value: string) => validators.phone(value),
      ],
    }),
    []
  );

  // Real-time validation
  const { isValid: isFormValid, errors } = useMemo(() => {
    return validateForm(form, validationRules);
  }, [form, validationRules]);

  useEffect(() => {
    setFieldErrors(errors);
  }, [errors]);

  useEffect(() => {
    if (dorm) {
      setForm({
        name: dorm.name || "",
        address: dorm.address || "",
        phone: dorm.phone || "",
      });
    } else {
      setForm({ name: "", address: "", phone: "" });
    }
    setError("");
    setSuccess("");
    setConfirmDelete(false);
    setFieldErrors({});
    setHasSubmitted(false);
  }, [dorm, open]);

  async function handleSave() {
    setHasSubmitted(true);

    if (!isFormValid) {
      setError("กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isEdit) {
        await dispatch(editDorm({ token, id: dorm.id, dorm: form })).unwrap();
        setSuccess("แก้ไขหอพักเรียบร้อยแล้ว");
      } else {
        await dispatch(addDorm({ token, dorm: form })).unwrap();
        setSuccess("สร้างหอพักเรียบร้อยแล้ว");
      }

      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e: any) {
      setError(e || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    setError("");
    try {
      await dispatch(deleteDorm({ token, id: dorm.id })).unwrap();
      onClose();
    } catch (e: any) {
      setError(e || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
      setConfirmDelete(false);
    }
  }

  if (!open) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-2xl">{isEdit ? "✏️" : "🏢"}</span>
            {isEdit ? "แก้ไขหอพัก" : "สร้างหอพักใหม่"}
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
          <div className="grid grid-cols-1 gap-6">
            {/* ข้อมูลหอพัก */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                🏢 ข้อมูลหอพัก
              </h3>

              <ValidatedInput
                label="ชื่อหอพัก"
                value={form.name}
                onChange={(value) => setForm((f) => ({ ...f, name: value }))}
                validation={fieldErrors.name}
                placeholder="กรอกชื่อหอพัก เช่น หอพักแสงทอง"
                required
                icon="🏢"
                disabled={loading}
              />

              <ValidatedInput
                label="ที่อยู่หอพัก"
                value={form.address}
                onChange={(value) => setForm((f) => ({ ...f, address: value }))}
                validation={fieldErrors.address}
                placeholder="กรอกที่อยู่หอพักพร้อมรายละเอียด"
                type="textarea"
                required
                icon="📍"
                rows={4}
                disabled={loading}
              />

              <ValidatedInput
                label="เบอร์โทรศัพท์"
                value={form.phone}
                onChange={(value) => setForm((f) => ({ ...f, phone: value }))}
                validation={fieldErrors.phone}
                placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก"
                type="tel"
                required
                icon="📱"
                disabled={loading}
              />

              {/* Messages */}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-green-700 font-medium">
                      {success}
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✕</span>
                    </div>
                    <span className="text-red-700 font-medium">{error}</span>
                  </div>
                </div>
              )}

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
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            {isEdit && !confirmDelete && (
              <button
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                onClick={() => setConfirmDelete(true)}
                disabled={loading}
              >
                🗑️ ลบหอพัก
              </button>
            )}
            {isEdit && confirmDelete && (
              <div className="flex items-center gap-3">
                <span className="text-red-600 font-medium">
                  ⚠️ ยืนยันการลบ?
                </span>
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  onClick={() => setConfirmDelete(false)}
                  disabled={loading}
                >
                  ยกเลิก
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  ลบถาวร
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              onClick={onClose}
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                loading || success
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : isFormValid
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={handleSave}
              disabled={loading || !!success || (!isFormValid && hasSubmitted)}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-gray-600"></div>
                  <span>{isEdit ? "กำลังบันทึก..." : "กำลังสร้าง..."}</span>
                </>
              ) : success ? (
                <>
                  <span className="text-green-600">✅</span>
                  <span>สำเร็จ</span>
                </>
              ) : (
                <>
                  <span>{isEdit ? "💾" : "➕"}</span>
                  <span>{isEdit ? "บันทึกการแก้ไข" : "สร้างหอพัก"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ใช้ Portal เพื่อ render modal ที่ body
  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
