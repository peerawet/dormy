"use client";
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import ValidatedInput from "./ValidatedInput";
import {
  validators,
  validateForm,
  FieldValidation,
} from "../../utils/validation";

interface BillModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: any) => void;
  loading?: boolean;
  room: any;
  tenants: { id: number; name: string; phone: string; address: string }[];
  bills: any[];
  editBill?: any | null;
  autoSelectTenant?: boolean;
}

export default function BillModal({
  open,
  onClose,
  onSave,
  loading,
  room,
  tenants,
  bills,
  editBill,
  autoSelectTenant = false,
}: BillModalProps) {
  const isEdit = !!editBill;
  const [form, setForm] = useState({
    id: null as number | null,
    billDate: "",
    tenantId: "",
    water: "",
    meterWaterStart: "",
    meterWaterEnd: "",
    electric: "",
    meterElectricStart: "",
    meterElectricEnd: "",
    common: "",
    other: "",
    rent: "",
    discount: "",
    total: "",
  });

  const [fieldErrors, setFieldErrors] = useState<FieldValidation>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Validation rules
  const validationRules = useMemo(
    () => ({
      billDate: [(value: string) => validators.required(value, "วันที่บิล")],
      tenantId: [(value: string) => validators.required(value, "ผู้เช่า")],
      rent: [
        (value: string) => validators.required(value, "ค่าเช่า"),
        (value: string) => validators.positiveNumber(value, "ค่าเช่า"),
      ],
      meterWaterStart: [
        (value: string) => {
          if (!value.trim()) return { isValid: true, message: "" };
          return validators.number(value, "เลขมิเตอร์น้ำต้น");
        },
      ],
      meterWaterEnd: [
        (value: string) => {
          if (!value.trim() || !form.meterWaterStart)
            return { isValid: true, message: "" };
          const start = Number(form.meterWaterStart);
          const end = Number(value);
          if (isNaN(end)) return validators.number(value, "เลขมิเตอร์น้ำปลาย");
          return end >= start
            ? { isValid: true, message: "" }
            : {
                isValid: false,
                message: "เลขมิเตอร์ปลายต้องมากกว่าหรือเท่ากับเลขต้น",
              };
        },
      ],
      meterElectricStart: [
        (value: string) => {
          if (!value.trim()) return { isValid: true, message: "" };
          return validators.number(value, "เลขมิเตอร์ไฟต้น");
        },
      ],
      meterElectricEnd: [
        (value: string) => {
          if (!value.trim() || !form.meterElectricStart)
            return { isValid: true, message: "" };
          const start = Number(form.meterElectricStart);
          const end = Number(value);
          if (isNaN(end)) return validators.number(value, "เลขมิเตอร์ไฟปลาย");
          return end >= start
            ? { isValid: true, message: "" }
            : {
                isValid: false,
                message: "เลขมิเตอร์ปลายต้องมากกว่าหรือเท่ากับเลขต้น",
              };
        },
      ],
      common: [
        (value: string) => {
          if (!value.trim()) return { isValid: true, message: "" };
          return validators.number(value, "ค่าส่วนกลาง");
        },
      ],
      other: [
        (value: string) => {
          if (!value.trim()) return { isValid: true, message: "" };
          return validators.number(value, "ค่าอื่นๆ");
        },
      ],
      discount: [
        (value: string) => {
          if (!value.trim()) return { isValid: true, message: "" };
          return validators.number(value, "ส่วนลด");
        },
      ],
    }),
    [form.meterWaterStart, form.meterElectricStart]
  );

  // Real-time validation
  const { isValid: isFormValid, errors } = useMemo(() => {
    const { id, ...formToValidate } = form;
    return validateForm(formToValidate, validationRules);
  }, [form, validationRules]);

  useEffect(() => {
    setFieldErrors(errors);
  }, [errors]);

  useEffect(() => {
    if (open) {
      if (isEdit) {
        // Pre-fill form with edit bill data
        setForm({
          id: editBill.id,
          billDate: editBill.billDate?.slice(0, 10) || "",
          tenantId: editBill.tenantId ? String(editBill.tenantId) : "",
          water: editBill.water ? String(editBill.water) : "",
          meterWaterStart: editBill.meterWaterStart
            ? String(editBill.meterWaterStart)
            : "",
          meterWaterEnd: editBill.meterWaterEnd
            ? String(editBill.meterWaterEnd)
            : "",
          electric: editBill.electric ? String(editBill.electric) : "",
          meterElectricStart: editBill.meterElectricStart
            ? String(editBill.meterElectricStart)
            : "",
          meterElectricEnd: editBill.meterElectricEnd
            ? String(editBill.meterElectricEnd)
            : "",
          common: editBill.common ? String(editBill.common) : "",
          other: editBill.other ? String(editBill.other) : "",
          rent: editBill.rent ? String(editBill.rent) : "",
          discount: editBill.discount ? String(editBill.discount) : "",
          total: editBill.total ? String(editBill.total) : "",
        });
      } else {
        // หา bill ล่าสุดเพื่อ prefill เลขมิเตอร์
        const latestBill = bills?.length > 0 ? bills[0] : null;

        setForm({
          id: null,
          billDate: new Date().toISOString().slice(0, 10), // วันปัจจุบัน
          tenantId:
            autoSelectTenant && tenants?.length === 1
              ? String(tenants[0].id)
              : "",
          water: "",
          meterWaterStart: latestBill?.meterWaterEnd
            ? String(latestBill.meterWaterEnd)
            : "",
          meterWaterEnd: "",
          electric: "",
          meterElectricStart: latestBill?.meterElectricEnd
            ? String(latestBill.meterElectricEnd)
            : "",
          meterElectricEnd: "",
          common: room?.commonFee ? String(room.commonFee) : "",
          other: room?.otherFee ? String(room.otherFee) : "",
          rent: room?.price ? String(room.price) : "",
          discount: "",
          total: "",
        });
      }
      setFieldErrors({});
      setHasSubmitted(false);
    }
  }, [open, room, tenants, bills, editBill, isEdit]);

  useEffect(() => {
    let water = form.water;
    if (form.meterWaterStart && form.meterWaterEnd && room?.waterRate) {
      const units = Number(form.meterWaterEnd) - Number(form.meterWaterStart);
      if (units >= 0) water = String(units * room.waterRate);
    } else if (room?.waterFlat) {
      water = String(room.waterFlat);
    }
    let electric = form.electric;
    if (
      form.meterElectricStart &&
      form.meterElectricEnd &&
      room?.electricRate
    ) {
      const units =
        Number(form.meterElectricEnd) - Number(form.meterElectricStart);
      if (units >= 0) electric = String(units * room.electricRate);
    } else if (room?.electricFlat) {
      electric = String(room.electricFlat);
    }
    const total =
      (Number(water) || 0) +
      (Number(electric) || 0) +
      (Number(form.common) || 0) +
      (Number(form.other) || 0) +
      (Number(form.rent) || 0) -
      (Number(form.discount) || 0);
    setForm((f) => ({
      ...f,
      water,
      electric,
      total: String(total),
    }));
  }, [
    form.meterWaterStart,
    form.meterWaterEnd,
    form.meterElectricStart,
    form.meterElectricEnd,
    form.common,
    form.other,
    form.rent,
    form.discount,
    room,
  ]);

  // Calculate units for display
  const waterUnits = useMemo(() => {
    if (form.meterWaterStart && form.meterWaterEnd) {
      const start = Number(form.meterWaterStart);
      const end = Number(form.meterWaterEnd);
      return end >= start ? end - start : 0;
    }
    return 0;
  }, [form.meterWaterStart, form.meterWaterEnd]);

  const electricUnits = useMemo(() => {
    if (form.meterElectricStart && form.meterElectricEnd) {
      const start = Number(form.meterElectricStart);
      const end = Number(form.meterElectricEnd);
      return end >= start ? end - start : 0;
    }
    return 0;
  }, [form.meterElectricStart, form.meterElectricEnd]);

  const handleSave = () => {
    setHasSubmitted(true);
    if (isFormValid) {
      const formData = { ...form };
      if (isEdit) {
        formData.id = editBill.id;
      }
      onSave(formData);
    }
  };

  if (!open) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-2xl">{isEdit ? "✏️" : "📋"}</span>
            {isEdit ? "แก้ไขบิล" : "สร้างบิลใหม่"}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ข้อมูลพื้นฐาน */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                📅 ข้อมูลพื้นฐาน
              </h3>

              <ValidatedInput
                label="วันที่บิล"
                value={form.billDate}
                onChange={(value) =>
                  setForm((f) => ({ ...f, billDate: value }))
                }
                validation={fieldErrors.billDate}
                type="date"
                required
                icon="📅"
                disabled={loading}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">👤</span>
                    ชื่อผู้เช่า
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                {tenants.length === 0 ? (
                  <div className="w-full px-4 py-3 border border-orange-200 bg-orange-50 rounded-xl text-orange-700 font-medium">
                    ⚠️ ยังไม่มีผู้เช่าในห้องนี้ กรุณาเพิ่มผู้เช่าก่อนสร้างบิล
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
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
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
            </div>

            {/* ค่าใช้จ่าย */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                💰 ค่าใช้จ่าย
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <ValidatedInput
                  label="ค่าเช่า"
                  value={form.rent}
                  onChange={(value) => setForm((f) => ({ ...f, rent: value }))}
                  validation={fieldErrors.rent}
                  type="number"
                  placeholder="0"
                  required
                  icon="🏠"
                  suffix="บาท"
                  disabled={loading}
                  min={0}
                />

                <ValidatedInput
                  label="ค่าส่วนกลาง"
                  value={form.common}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, common: value }))
                  }
                  validation={fieldErrors.common}
                  type="number"
                  placeholder="0"
                  icon="🏢"
                  suffix="บาท"
                  disabled={loading}
                  min={0}
                />
              </div>

              <ValidatedInput
                label="ค่าอื่นๆ"
                value={form.other}
                onChange={(value) => setForm((f) => ({ ...f, other: value }))}
                validation={fieldErrors.other}
                type="number"
                placeholder="0"
                icon="📋"
                suffix="บาท"
                disabled={loading}
                min={0}
              />

              <ValidatedInput
                label="ส่วนลด"
                value={form.discount}
                onChange={(value) =>
                  setForm((f) => ({ ...f, discount: value }))
                }
                validation={fieldErrors.discount}
                type="number"
                placeholder="0"
                icon="💰"
                suffix="บาท"
                disabled={loading}
                min={0}
              />
            </div>

            {/* มิเตอร์น้ำ */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                💧 มิเตอร์น้ำ
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <ValidatedInput
                  label="เลขต้น"
                  value={form.meterWaterStart}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, meterWaterStart: value }))
                  }
                  validation={fieldErrors.meterWaterStart}
                  type="number"
                  placeholder="0"
                  icon="🔢"
                  suffix="หน่วย"
                  disabled={loading}
                  min={0}
                />

                <ValidatedInput
                  label="เลขปลาย"
                  value={form.meterWaterEnd}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, meterWaterEnd: value }))
                  }
                  validation={fieldErrors.meterWaterEnd}
                  type="number"
                  placeholder="0"
                  icon="🔢"
                  suffix="หน่วย"
                  disabled={loading}
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">💧</span>
                    ค่าน้ำ (คำนวณอัตโนมัติ)
                  </span>
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 font-semibold"
                  value={form.water}
                  readOnly
                />
              </div>

              {/* แสดงจำนวนหน่วยน้ำ */}
              {form.meterWaterStart &&
                form.meterWaterEnd &&
                waterUnits >= 0 && (
                  <div className="text-center py-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                      💧 ใช้น้ำ {waterUnits.toLocaleString()} หน่วย
                      {room?.waterRate && ` (${room.waterRate} บาท/หน่วย)`}
                    </span>
                  </div>
                )}
            </div>

            {/* มิเตอร์ไฟ */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                ⚡ มิเตอร์ไฟ
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <ValidatedInput
                  label="เลขต้น"
                  value={form.meterElectricStart}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, meterElectricStart: value }))
                  }
                  validation={fieldErrors.meterElectricStart}
                  type="number"
                  placeholder="0"
                  icon="🔢"
                  suffix="หน่วย"
                  disabled={loading}
                  min={0}
                />

                <ValidatedInput
                  label="เลขปลาย"
                  value={form.meterElectricEnd}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, meterElectricEnd: value }))
                  }
                  validation={fieldErrors.meterElectricEnd}
                  type="number"
                  placeholder="0"
                  icon="🔢"
                  suffix="หน่วย"
                  disabled={loading}
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">⚡</span>
                    ค่าไฟ (คำนวณอัตโนมัติ)
                  </span>
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 font-semibold"
                  value={form.electric}
                  readOnly
                />
              </div>
              {/* แสดงจำนวนหน่วยไฟ */}
              {form.meterElectricStart &&
                form.meterElectricEnd &&
                electricUnits >= 0 && (
                  <div className="text-center py-2">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
                      ⚡ ใช้ไฟ {electricUnits.toLocaleString()} หน่วย
                      {room?.electricRate &&
                        ` (${room.electricRate} บาท/หน่วย)`}
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Form validation summary */}
          {hasSubmitted && !isFormValid && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
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

          {/* รวมทั้งหมด */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-700">
                💸 ยอดรวมทั้งหมด
              </span>
              <span className="text-3xl font-bold text-blue-600">
                ฿{Number(form.total || 0).toLocaleString()}
              </span>
            </div>
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
                <span>{isEdit ? "บันทึกการแก้ไข" : "สร้างบิลใหม่"}</span>
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
