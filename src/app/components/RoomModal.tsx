import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { addRoom, editRoom, deleteRoom } from "@/store/roomSlice";
import ValidatedInput from "@/app/components/ValidatedInput";
import {
  validators,
  validateForm,
  FieldValidation,
} from "../../utils/validation";

export default function RoomModal({
  open,
  onClose,
  room,
  dormitoryId,
  token,
}: {
  open: boolean;
  onClose: () => void;
  room: any | null;
  dormitoryId: number | null;
  token: string;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const isEdit = !!room;
  const [form, setForm] = useState({
    name: "",
    price: "",
    waterRate: "",
    electricRate: "",
    waterFlat: "",
    electricFlat: "",
    commonFee: "",
    otherFee: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldValidation>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (room) {
      setForm({
        name: room.name || "",
        price: room.price ? String(room.price) : "",
        waterRate: room.waterRate ? String(room.waterRate) : "",
        electricRate: room.electricRate ? String(room.electricRate) : "",
        waterFlat: room.waterFlat ? String(room.waterFlat) : "",
        electricFlat: room.electricFlat ? String(room.electricFlat) : "",
        commonFee: room.commonFee ? String(room.commonFee) : "",
        otherFee: room.otherFee ? String(room.otherFee) : "",
      });
    } else {
      setForm({
        name: "",
        price: "",
        waterRate: "",
        electricRate: "",
        waterFlat: "",
        electricFlat: "",
        commonFee: "",
        otherFee: "",
      });
    }
    setError("");
    setSuccess("");
    setConfirmDelete(false);
    setFieldErrors({});
    setHasSubmitted(false);
  }, [room, open]);

  // Validation rules
  const validationRules = useMemo(
    () => ({
      name: [
        (value: string) => validators.required(value, "ชื่อห้องพัก"),
        (value: string) => validators.minLength(value, 1, "ชื่อห้องพัก"),
        (value: string) => validators.maxLength(value, 20, "ชื่อห้องพัก"),
      ],
      price: [
        (value: string) => validators.required(value, "ราคาค่าเช่า"),
        (value: string) => validators.positiveNumber(value, "ราคาค่าเช่า"),
      ],
      // Optional fields - only validate if value exists
      waterRate: [
        (value: string) =>
          value
            ? validators.positiveNumber(value, "ค่าน้ำต่อหน่วย")
            : { isValid: true, message: "" },
      ],
      electricRate: [
        (value: string) =>
          value
            ? validators.positiveNumber(value, "ค่าไฟต่อหน่วย")
            : { isValid: true, message: "" },
      ],
      waterFlat: [
        (value: string) =>
          value
            ? validators.positiveNumber(value, "ค่าน้ำเหมา")
            : { isValid: true, message: "" },
      ],
      electricFlat: [
        (value: string) =>
          value
            ? validators.positiveNumber(value, "ค่าไฟเหมา")
            : { isValid: true, message: "" },
      ],
      commonFee: [
        (value: string) =>
          value
            ? validators.positiveNumber(value, "ค่าส่วนกลาง")
            : { isValid: true, message: "" },
      ],
      otherFee: [
        (value: string) =>
          value
            ? validators.positiveNumber(value, "ค่าอื่นๆ")
            : { isValid: true, message: "" },
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

  async function handleSave() {
    setHasSubmitted(true);

    if (!isFormValid || !dormitoryId) {
      setError("กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    const payload = {
      dormitoryId,
      name: form.name,
      price: Number(form.price),
      waterRate: form.waterRate ? Number(form.waterRate) : null,
      electricRate: form.electricRate ? Number(form.electricRate) : null,
      waterFlat: form.waterFlat ? Number(form.waterFlat) : null,
      electricFlat: form.electricFlat ? Number(form.electricFlat) : null,
      commonFee: form.commonFee ? Number(form.commonFee) : null,
      otherFee: form.otherFee ? Number(form.otherFee) : null,
    };
    try {
      if (isEdit) {
        await dispatch(
          editRoom({ token, room: { id: room.id, ...payload } })
        ).unwrap();
        setSuccess("แก้ไขห้องพักเรียบร้อยแล้ว");
      } else {
        await dispatch(addRoom({ token, room: payload })).unwrap();
        setSuccess("สร้างห้องพักเรียบร้อยแล้ว");
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
    if (!room || !dormitoryId) return;
    setLoading(true);
    setError("");
    try {
      await dispatch(
        deleteRoom({ token, roomId: room.id, dormitoryId })
      ).unwrap();
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-2xl">{isEdit ? "✏️" : "🏠"}</span>
            {isEdit ? "แก้ไขห้องพัก" : "สร้างห้องพักใหม่"}
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
          <div className="space-y-8">
            {/* ข้อมูลพื้นฐาน */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                  🏠 ข้อมูลพื้นฐาน
                </h3>

                <ValidatedInput
                  label="ชื่อห้องพัก"
                  value={form.name}
                  onChange={(value) => setForm((f) => ({ ...f, name: value }))}
                  validation={fieldErrors.name}
                  placeholder="เช่น A101, B202"
                  required
                  icon="🏠"
                  disabled={loading}
                />

                <ValidatedInput
                  label="ราคาค่าเช่า"
                  value={form.price}
                  onChange={(value) => setForm((f) => ({ ...f, price: value }))}
                  validation={fieldErrors.price}
                  placeholder="0"
                  type="number"
                  suffix="บาท/เดือน"
                  required
                  icon="💰"
                  disabled={loading}
                  min={0}
                  step="100"
                />
              </div>

              {/* ค่าน้ำ */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                  💧 ค่าน้ำ
                </h3>

                <ValidatedInput
                  label="ค่าน้ำต่อหน่วย"
                  value={form.waterRate}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, waterRate: value }))
                  }
                  validation={fieldErrors.waterRate}
                  placeholder="0 (ไม่ใส่หากไม่คิดค่าน้ำ)"
                  type="number"
                  suffix="บาท/หน่วย"
                  icon="💧"
                  disabled={loading}
                  min={0}
                  step="0.1"
                />

                <ValidatedInput
                  label="ค่าน้ำแบบเหมา"
                  value={form.waterFlat}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, waterFlat: value }))
                  }
                  validation={fieldErrors.waterFlat}
                  placeholder="0 (ไม่ใส่หากไม่คิดค่าน้ำเหมา)"
                  type="number"
                  suffix="บาท/เดือน"
                  icon="🚰"
                  disabled={loading}
                  min={0}
                  step="10"
                />
              </div>
            </div>

            {/* ค่าไฟ และค่าใช้จ่ายอื่นๆ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                  ⚡ ค่าไฟ
                </h3>

                <ValidatedInput
                  label="ค่าไฟต่อหน่วย"
                  value={form.electricRate}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, electricRate: value }))
                  }
                  validation={fieldErrors.electricRate}
                  placeholder="0 (ไม่ใส่หากไม่คิดค่าไฟ)"
                  type="number"
                  suffix="บาท/หน่วย"
                  icon="⚡"
                  disabled={loading}
                  min={0}
                  step="0.1"
                />

                <ValidatedInput
                  label="ค่าไฟแบบเหมา"
                  value={form.electricFlat}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, electricFlat: value }))
                  }
                  validation={fieldErrors.electricFlat}
                  placeholder="0 (ไม่ใส่หากไม่คิดค่าไฟเหมา)"
                  type="number"
                  suffix="บาท/เดือน"
                  icon="💡"
                  disabled={loading}
                  min={0}
                  step="10"
                />
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                  💰 ค่าใช้จ่ายอื่นๆ
                </h3>

                <ValidatedInput
                  label="ค่าส่วนกลาง"
                  value={form.commonFee}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, commonFee: value }))
                  }
                  validation={fieldErrors.commonFee}
                  placeholder="0 (เช่น ค่าขยะ ค่าดูแลสวน)"
                  type="number"
                  suffix="บาท/เดือน"
                  icon="🏢"
                  disabled={loading}
                  min={0}
                  step="10"
                />

                <ValidatedInput
                  label="ค่าอื่นๆ"
                  value={form.otherFee}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, otherFee: value }))
                  }
                  validation={fieldErrors.otherFee}
                  placeholder="0 (ค่าใช้จ่ายเพิ่มเติม)"
                  type="number"
                  suffix="บาท/เดือน"
                  icon="📋"
                  disabled={loading}
                  min={0}
                  step="10"
                />
              </div>
            </div>

            {/* สรุปค่าใช้จ่าย */}
            {
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">
                  📊 สรุปค่าใช้จ่ายรายเดือน
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>ค่าเช่า:</span>
                    <span className="font-semibold">
                      ฿{Number(form.price || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ค่าน้ำเหมา:</span>
                    <span className="font-semibold">
                      ฿{Number(form.waterFlat || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ค่าไฟเหมา:</span>
                    <span className="font-semibold">
                      ฿{Number(form.electricFlat || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ค่าส่วนกลาง:</span>
                    <span className="font-semibold">
                      ฿{Number(form.commonFee || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ค่าอื่นๆ:</span>
                    <span className="font-semibold">
                      ฿{Number(form.otherFee || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 col-span-2">
                    <span className="font-bold">รวมค่าคงที่:</span>
                    <span className="font-bold text-blue-600">
                      ฿
                      {(
                        Number(form.price || 0) +
                        Number(form.waterFlat || 0) +
                        Number(form.electricFlat || 0) +
                        Number(form.commonFee || 0) +
                        Number(form.otherFee || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                {(form.waterRate || form.electricRate) && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <h5 className="text-sm font-semibold text-gray-600 mb-2">
                      📋 ค่าใช้จ่ายแปรผัน (ขึ้นอยู่กับการใช้งาน)
                    </h5>
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                      {form.waterRate && (
                        <div className="flex justify-between">
                          <span>ค่าน้ำต่อหน่วย:</span>
                          <span>
                            ฿{Number(form.waterRate).toFixed(2)}/หน่วย
                          </span>
                        </div>
                      )}
                      {form.electricRate && (
                        <div className="flex justify-between">
                          <span>ค่าไฟต่อหน่วย:</span>
                          <span>
                            ฿{Number(form.electricRate).toFixed(2)}/หน่วย
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            }

            {/* Messages */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-green-700 font-medium">{success}</span>
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
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            {isEdit && !confirmDelete && (
              <button
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                onClick={() => setConfirmDelete(true)}
                disabled={loading}
              >
                🗑️ ลบห้องพัก
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
              disabled={Boolean(
                loading || success || (!isFormValid && hasSubmitted)
              )}
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
                  <span>{isEdit ? "บันทึกการแก้ไข" : "สร้างห้องพัก"}</span>
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
