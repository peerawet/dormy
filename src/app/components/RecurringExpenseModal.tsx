import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import ValidatedInput from "./ValidatedInput";
import { FieldValidation } from "../../utils/validation";
import { RecurringExpenseFormData } from "@/store/recurringExpenseSlice";

interface RecurringExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: RecurringExpenseFormData) => Promise<void>;
  editRecurringExpense?: {
    id: number;
    dormitoryId: number;
    roomId?: number;
    type: string;
    description: string;
    amount: number;
    frequency: string;
    dayOfMonth?: number;
    isActive: boolean;
  } | null;
  initialData?: Partial<RecurringExpenseFormData> | null;
  dormitories: {
    id: number;
    name: string;
    rooms: {
      id: number;
      name: string;
    }[];
  }[];
  loading?: boolean;
}

const expenseTypes = [
  { value: "water", label: "ค่าน้ำ", color: "blue", icon: "💧" },
  { value: "electric", label: "ค่าไฟ", color: "yellow", icon: "⚡" },
  { value: "maintenance", label: "ซ่อมบำรุง", color: "orange", icon: "🔧" },
  { value: "cleaning", label: "ทำความสะอาด", color: "green", icon: "🧹" },
  { value: "repair", label: "ซ่อมแซม", color: "red", icon: "🔨" },
  { value: "security", label: "รักษาความปลอดภัย", color: "purple", icon: "🛡️" },
  { value: "insurance", label: "ประกันภัย", color: "indigo", icon: "🛡️" },
  { value: "internet", label: "อินเทอร์เน็ต", color: "cyan", icon: "🌐" },
  {
    value: "furniture",
    label: "ของใช้เฟอร์นิเจอร์",
    color: "teal",
    icon: "🛋️",
  },
  { value: "tools", label: "เครื่องมือ", color: "lime", icon: "🛠️" },
  { value: "other", label: "อื่นๆ", color: "gray", icon: "📝" },
];

const frequencyOptions = [
  { value: "monthly", label: "รายเดือน", icon: "📅" },
  { value: "weekly", label: "รายสัปดาห์", icon: "📆" },
  { value: "yearly", label: "รายปี", icon: "📆" },
];

export default function RecurringExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  editRecurringExpense,
  initialData,
  dormitories,
  loading = false,
}: RecurringExpenseModalProps) {
  const [formData, setFormData] = useState<RecurringExpenseFormData>({
    dormitoryId: 0,
    roomId: undefined,
    type: "other",
    description: "",
    amount: 0,
    frequency: "monthly",
    dayOfMonth: undefined,
    isActive: true,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldValidation>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Get available rooms for selected dormitory
  const availableRooms = useMemo(() => {
    if (!formData.dormitoryId) return [];
    const dormitory = dormitories.find((d) => d.id === formData.dormitoryId);
    return dormitory?.rooms || [];
  }, [formData.dormitoryId, dormitories]);

  // Real-time validation
  const { isValid: isFormValid, errors } = useMemo(() => {
    const errors: FieldValidation = {};
    let isValid = true;

    // Validate dormitory
    if (!formData.dormitoryId || formData.dormitoryId === 0) {
      errors.dormitoryId = { isValid: false, message: "กรุณาเลือกหอพัก" };
      isValid = false;
    } else {
      errors.dormitoryId = { isValid: true, message: "" };
    }

    // Validate type
    if (!formData.type.trim()) {
      errors.type = { isValid: false, message: "กรุณาเลือกประเภทค่าใช้จ่าย" };
      isValid = false;
    } else {
      errors.type = { isValid: true, message: "" };
    }

    // Description is optional
    errors.description = { isValid: true, message: "" };

    // Validate amount
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = {
        isValid: false,
        message: "กรุณาระบุจำนวนเงินที่ถูกต้อง",
      };
      isValid = false;
    } else {
      errors.amount = { isValid: true, message: "" };
    }

    // Validate frequency
    if (!formData.frequency) {
      errors.frequency = { isValid: false, message: "กรุณาเลือกความถี่" };
      isValid = false;
    } else {
      errors.frequency = { isValid: true, message: "" };
    }

    // Validate dayOfMonth for monthly frequency
    if (formData.frequency === "monthly") {
      if (!formData.dayOfMonth || formData.dayOfMonth < 1 || formData.dayOfMonth > 31) {
        errors.dayOfMonth = {
          isValid: false,
          message: "กรุณาระบุวันที่ (1-31)",
        };
        isValid = false;
      } else {
        errors.dayOfMonth = { isValid: true, message: "" };
      }
    } else {
      errors.dayOfMonth = { isValid: true, message: "" };
    }

    return { isValid, errors };
  }, [formData]);

  useEffect(() => {
    setFieldErrors(errors);
  }, [errors]);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editRecurringExpense) {
        setFormData({
          id: editRecurringExpense.id,
          dormitoryId: editRecurringExpense.dormitoryId,
          roomId: editRecurringExpense.roomId || undefined,
          type: editRecurringExpense.type,
          description: editRecurringExpense.description,
          amount: editRecurringExpense.amount,
          frequency: editRecurringExpense.frequency,
          dayOfMonth: editRecurringExpense.dayOfMonth || undefined,
          isActive: editRecurringExpense.isActive,
        });
      } else {
        const defaultData = {
          dormitoryId: dormitories.length > 0 ? dormitories[0].id : 0,
          roomId: undefined,
          type: "other",
          description: "",
          amount: 0,
          frequency: "monthly" as const,
          dayOfMonth: undefined,
          isActive: true,
        };
        setFormData({
          ...defaultData,
          ...initialData,
        });
      }
      setHasSubmitted(false);
    }
  }, [isOpen, editRecurringExpense, initialData, dormitories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!isFormValid) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-3xl">🔄</span>
            {editRecurringExpense
              ? "แก้ไขค่าใช้จ่ายประจำ"
              : "เพิ่มค่าใช้จ่ายประจำ"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dormitory */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                หอพัก <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full px-4 py-3 border rounded-xl font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 ${
                  hasSubmitted && !fieldErrors.dormitoryId?.isValid
                    ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500/20"
                    : hasSubmitted &&
                      fieldErrors.dormitoryId?.isValid &&
                      formData.dormitoryId
                    ? "border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500/20"
                    : "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                value={formData.dormitoryId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dormitoryId: Number(e.target.value),
                    roomId: undefined,
                  })
                }
              >
                <option value={0}>เลือกหอพัก</option>
                {dormitories.map((dorm) => (
                  <option key={dorm.id} value={dorm.id}>
                    {dorm.name}
                  </option>
                ))}
              </select>
              {hasSubmitted && !fieldErrors.dormitoryId?.isValid && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldErrors.dormitoryId?.message}
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                ประเภท <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full px-4 py-3 border rounded-xl font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 ${
                  hasSubmitted && !fieldErrors.type?.isValid
                    ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500/20"
                    : hasSubmitted && fieldErrors.type?.isValid && formData.type
                    ? "border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500/20"
                    : "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                {expenseTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
              {hasSubmitted && !fieldErrors.type?.isValid && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldErrors.type?.message}
                </p>
              )}
            </div>
          </div>

          {/* Room (Optional) */}
          {availableRooms.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                ห้อง (ไม่บังคับ)
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl font-medium bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300"
                value={formData.roomId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    roomId: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              >
                <option value="">ไม่ระบุห้อง (ค่าใช้จ่ายทั่วไป)</option>
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    ห้อง {room.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <ValidatedInput
            label="รายละเอียด"
            type="textarea"
            value={formData.description}
            onChange={(value) =>
              setFormData({ ...formData, description: value })
            }
            validation={hasSubmitted ? fieldErrors.description : undefined}
            placeholder="กรอกรายละเอียดค่าใช้จ่าย (ไม่บังคับ)"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <ValidatedInput
              label="จำนวนเงิน"
              required
              type="number"
              value={formData.amount.toString()}
              onChange={(value) =>
                setFormData({ ...formData, amount: Number(value) || 0 })
              }
              validation={hasSubmitted ? fieldErrors.amount : undefined}
              placeholder="0"
              min={0}
              step="0.01"
            />

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                ความถี่ <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full px-4 py-3 border rounded-xl font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 ${
                  hasSubmitted && !fieldErrors.frequency?.isValid
                    ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500/20"
                    : hasSubmitted &&
                      fieldErrors.frequency?.isValid &&
                      formData.frequency
                    ? "border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500/20"
                    : "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    frequency: e.target.value,
                    dayOfMonth:
                      e.target.value === "monthly"
                        ? formData.dayOfMonth || 1
                        : undefined,
                  })
                }
              >
                {frequencyOptions.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.icon} {freq.label}
                  </option>
                ))}
              </select>
              {hasSubmitted && !fieldErrors.frequency?.isValid && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldErrors.frequency?.message}
                </p>
              )}
            </div>
          </div>

          {/* Day of Month (only for monthly) */}
          {formData.frequency === "monthly" && (
            <div>
              <ValidatedInput
                label="วันที่ของเดือน"
                required
                type="number"
                value={formData.dayOfMonth?.toString() || ""}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    dayOfMonth: Number(value) || undefined,
                  })
                }
                validation={hasSubmitted ? fieldErrors.dayOfMonth : undefined}
                placeholder="1-31"
                min={1}
                max={31}
              />
            </div>
          )}

          {/* Is Active */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              เปิดใช้งาน
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading || (hasSubmitted && !isFormValid)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <span className="text-lg">💾</span>
                  {editRecurringExpense ? "อัปเดต" : "บันทึก"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

