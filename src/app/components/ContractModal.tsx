"use client";
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import ValidatedInput from "./ValidatedInput";
import {
  validators,
  validateForm,
  FieldValidation,
} from "../../utils/validation";

interface ContractModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: any) => void;
  initial?: any;
  loading?: boolean;
  tenants: any[];
  roomId: string;
}

export function ContractModal({
  open,
  onClose,
  onSave,
  initial,
  loading,
  tenants,
  roomId,
}: ContractModalProps) {
  type FormType = {
    tenantId: string;
    startDate: string;
    endDate: string;
  };

  const [form, setForm] = useState<FormType>(
    initial
      ? {
          tenantId: initial.tenantId ? String(initial.tenantId) : "",
          startDate: initial.startDate
            ? new Date(initial.startDate).toISOString().split("T")[0]
            : "",
          endDate: initial.endDate
            ? new Date(initial.endDate).toISOString().split("T")[0]
            : "",
        }
      : {
          tenantId: "",
          startDate: "",
          endDate: "",
        }
  );

  const [fieldErrors, setFieldErrors] = useState<FieldValidation>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Validation rules
  const validationRules = useMemo(
    () => ({
      tenantId: [(value: string) => validators.required(value, "ผู้เช่า")],
      startDate: [
        (value: string) => validators.required(value, "วันที่เริ่มสัญญา"),
      ],
      endDate: [
        (value: string) => validators.required(value, "วันที่สิ้นสุดสัญญา"),
        (value: string) => {
          if (!value || !form.startDate) return { isValid: true, message: "" };
          const start = new Date(form.startDate);
          const end = new Date(value);
          return end > start
            ? { isValid: true, message: "" }
            : {
                isValid: false,
                message: "วันที่สิ้นสุดต้องหลังจากวันที่เริ่มสัญญา",
              };
        },
      ],
    }),
    [form.startDate]
  );

  // Real-time validation
  const { isValid: isFormValid, errors } = useMemo(() => {
    return validateForm(form, validationRules);
  }, [form, validationRules]);

  useEffect(() => {
    setFieldErrors(errors);
  }, [errors]);

  useEffect(() => {
    setForm(
      initial
        ? {
            tenantId: initial.tenantId ? String(initial.tenantId) : "",
            startDate: initial.startDate
              ? new Date(initial.startDate).toISOString().split("T")[0]
              : "",
            endDate: initial.endDate
              ? new Date(initial.endDate).toISOString().split("T")[0]
              : "",
          }
        : {
            tenantId: "",
            startDate: "",
            endDate: "",
          }
    );
    setFieldErrors({});
    setHasSubmitted(false);
  }, [initial, open]);

  const handleSave = () => {
    setHasSubmitted(true);
    if (isFormValid) {
      const formData: any = { ...form, roomId: Number(roomId) };
      if (initial) {
        formData.id = initial.id;
      }
      onSave(formData);
    }
  };

  if (!open) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-2xl">{initial ? "✏️" : "📋"}</span>
            {initial ? "แก้ไขสัญญาเช่า" : "สร้างสัญญาเช่าใหม่"}
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
          <div className="space-y-6">
            {/* เลือกผู้เช่า */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <span className="text-lg">👤</span>
                  ผู้เช่า
                  <span className="text-red-500">*</span>
                </span>
              </label>
              {tenants.length === 0 ? (
                <div className="w-full px-4 py-3 border border-orange-200 bg-orange-50 rounded-xl text-orange-700 font-medium">
                  ⚠️ ยังไม่มีผู้เช่าในระบบ กรุณาเพิ่มผู้เช่าก่อนสร้างสัญญา
                </div>
              ) : (
                <select
                  className={`w-full px-4 py-3 border rounded-xl font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 ${
                    fieldErrors.tenantId && !fieldErrors.tenantId.isValid
                      ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500/20"
                      : fieldErrors.tenantId &&
                        fieldErrors.tenantId.isValid &&
                        form.tenantId
                      ? "border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500/20"
                      : "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  value={form.tenantId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tenantId: e.target.value }))
                  }
                  disabled={loading}
                >
                  <option value="">เลือกผู้เช่า</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} ({tenant.phone})
                    </option>
                  ))}
                </select>
              )}
              {fieldErrors.tenantId && !fieldErrors.tenantId.isValid && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                  <span className="text-xs">⚠️</span>
                  <span>{fieldErrors.tenantId.message}</span>
                </div>
              )}
            </div>

            {/* วันที่สัญญา */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ValidatedInput
                label="วันที่เริ่มสัญญา"
                value={form.startDate}
                onChange={(value) =>
                  setForm((f) => ({ ...f, startDate: value }))
                }
                validation={fieldErrors.startDate}
                type="date"
                required
                icon="📅"
                disabled={loading}
              />

              <ValidatedInput
                label="วันที่สิ้นสุดสัญญา"
                value={form.endDate}
                onChange={(value) => setForm((f) => ({ ...f, endDate: value }))}
                validation={fieldErrors.endDate}
                type="date"
                required
                icon="📅"
                disabled={loading}
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
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50 gap-3">
          <button
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            onClick={onClose}
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              loading || tenants.length === 0
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : isFormValid
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleSave}
            disabled={
              loading || tenants.length === 0 || (!isFormValid && hasSubmitted)
            }
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-gray-600"></div>
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>{initial ? "บันทึกการแก้ไข" : "สร้างสัญญาใหม่"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // ใช้ Portal เพื่อ render modal ที่ body
  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  text: string;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  text,
}: ConfirmModalProps) {
  if (!open) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-xl font-semibold text-gray-800">ยืนยันการลบ</h3>
          </div>
          <p className="text-gray-600 mb-6">{text}</p>
          <div className="flex gap-3 justify-end">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              onClick={onClose}
            >
              ยกเลิก
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              onClick={onConfirm}
            >
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
