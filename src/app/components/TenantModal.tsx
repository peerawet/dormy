import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import ValidatedInput from "./ValidatedInput";
import { validators, FieldValidation } from "../../utils/validation";

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: TenantFormData) => Promise<void>;
  editTenant?: {
    id: number;
    name: string;
    phone: string;
    idCard?: string;
    address: string;
    linkCode?: string;
    rooms: {
      room: {
        id: number;
        name: string;
      };
    }[];
  } | null;
  rooms: {
    id: number;
    name: string;
    dormitory: {
      id: number;
      name: string;
    };
  }[];
  loading?: boolean;
  onRegenerateLinkCode?: (tenantId: number) => Promise<string | null>;
}

interface TenantFormData {
  id?: number;
  name: string;
  phone: string;
  idCard?: string;
  address: string;
  password?: string;
  roomIds: number[];
}

export default function TenantModal({
  isOpen,
  onClose,
  onSubmit,
  editTenant,
  rooms,
  loading = false,
  onRegenerateLinkCode,
}: TenantModalProps) {
  const [formData, setFormData] = useState<TenantFormData>({
    name: "",
    phone: "",
    idCard: "",
    address: "",
    password: "",
    roomIds: [],
  });
  const [fieldErrors, setFieldErrors] = useState<FieldValidation>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [linkCode, setLinkCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Real-time validation
  const { isValid: isFormValid, errors } = useMemo(() => {
    const errors: FieldValidation = {};
    let isValid = true;

    // Validate name
    const nameResult = validators.required(formData.name, "ชื่อ");
    errors.name = nameResult;
    if (!nameResult.isValid) isValid = false;

    // Validate phone
    const phoneResult = validators.required(formData.phone, "เบอร์โทร");
    errors.phone = phoneResult;
    if (!phoneResult.isValid) isValid = false;

    // Validate address
    const addressResult = validators.required(formData.address, "ที่อยู่");
    errors.address = addressResult;
    if (!addressResult.isValid) isValid = false;

    // Validate password (only for new tenant)
    if (!editTenant) {
      const passwordResult = validators.required(
        formData.password || "",
        "รหัสผ่าน"
      );
      errors.password = passwordResult;
      if (!passwordResult.isValid) isValid = false;
    } else {
      errors.password = { isValid: true, message: "" };
    }

    // Validate roomIds
    if (!formData.roomIds || formData.roomIds.length === 0) {
      errors.roomIds = {
        isValid: false,
        message: "กรุณาเลือกอย่างน้อย 1 ห้อง",
      };
      isValid = false;
    } else {
      errors.roomIds = { isValid: true, message: "" };
    }

    return { isValid, errors };
  }, [formData, editTenant]);

  useEffect(() => {
    setFieldErrors(errors);
  }, [errors]);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editTenant) {
        setFormData({
          id: editTenant.id,
          name: editTenant.name,
          phone: editTenant.phone,
          idCard: editTenant.idCard || "",
          address: editTenant.address,
          password: "",
          roomIds: editTenant.rooms?.map((tr: any) => tr.room.id) || [],
        });
        setLinkCode(editTenant.linkCode || "");
      } else {
        setFormData({
          name: "",
          phone: "",
          idCard: "",
          address: "",
          password: "",
          roomIds: [],
        });
        setLinkCode("");
      }
      setHasSubmitted(false);
      setCopied(false);
    }
  }, [isOpen, editTenant]);

  const handleCopyLinkCode = async () => {
    if (linkCode) {
      await navigator.clipboard.writeText(linkCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerateLinkCode = async () => {
    if (!editTenant || !onRegenerateLinkCode) return;
    if (!confirm("คุณต้องการสร้างรหัสเชื่อมต่อใหม่หรือไม่?\n\nรหัสเดิมจะใช้งานไม่ได้อีกต่อไป")) {
      return;
    }
    setRegenerating(true);
    const newCode = await onRegenerateLinkCode(editTenant.id);
    if (newCode) {
      setLinkCode(newCode);
    }
    setRegenerating(false);
  };

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

  const handleRoomToggle = (roomId: number) => {
    setFormData((prev) => ({
      ...prev,
      roomIds: prev.roomIds.includes(roomId)
        ? prev.roomIds.filter((id) => id !== roomId)
        : [...prev.roomIds, roomId],
    }));
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-3xl">👥</span>
            {editTenant ? "แก้ไขข้อมูลผู้เช่า" : "เพิ่มผู้เช่าใหม่"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <ValidatedInput
              label="ชื่อ-นามสกุล"
              required
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              validation={hasSubmitted ? fieldErrors.name : undefined}
              placeholder="กรอกชื่อ-นามสกุล"
            />

            {/* Phone */}
            <ValidatedInput
              label="เบอร์โทรศัพท์"
              required
              value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
              validation={hasSubmitted ? fieldErrors.phone : undefined}
              placeholder="กรอกเบอร์โทรศัพท์"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ID Card */}
            <ValidatedInput
              label="เลขบัตรประชาชน"
              value={formData.idCard || ""}
              onChange={(value) => setFormData({ ...formData, idCard: value })}
              placeholder="กรอกเลขบัตรประชาชน (ไม่บังคับ)"
            />

            {/* Password (only for new tenant) */}
            {!editTenant && (
              <ValidatedInput
                label="รหัสผ่าน"
                required
                type="password"
                value={formData.password || ""}
                onChange={(value) =>
                  setFormData({ ...formData, password: value })
                }
                validation={hasSubmitted ? fieldErrors.password : undefined}
                placeholder="กำหนดรหัสผ่าน"
              />
            )}
          </div>

          {/* Address */}
          <ValidatedInput
            label="ที่อยู่"
            required
            value={formData.address}
            onChange={(value) => setFormData({ ...formData, address: value })}
            validation={hasSubmitted ? fieldErrors.address : undefined}
            placeholder="กรอกที่อยู่"
            type="textarea"
          />

          {/* Link Code (only for edit mode) */}
          {editTenant && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🔗</span>
                <h3 className="font-semibold text-green-900">รหัสเชื่อมต่อ LINE</h3>
              </div>
              <p className="text-green-700 text-sm mb-3">
                ใช้รหัสนี้ส่งให้ผู้เช่าเพื่อเชื่อมต่อ LINE กับระบบ
              </p>
              {linkCode ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white px-4 py-3 rounded-lg border border-green-300 font-mono text-sm text-gray-800 truncate">
                    {linkCode}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLinkCode}
                    className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      copied
                        ? "bg-green-600 text-white"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {copied ? "✓ คัดลอกแล้ว" : "📋 คัดลอก"}
                  </button>
                  {onRegenerateLinkCode && (
                    <button
                      type="button"
                      onClick={handleRegenerateLinkCode}
                      disabled={regenerating}
                      className="px-4 py-3 bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition-colors disabled:opacity-50"
                    >
                      {regenerating ? "⏳" : "🔄"} สร้างใหม่
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-green-700 text-sm mb-3">ยังไม่มีรหัสเชื่อมต่อ</p>
                  {onRegenerateLinkCode && (
                    <button
                      type="button"
                      onClick={handleRegenerateLinkCode}
                      disabled={regenerating}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {regenerating ? "⏳ กำลังสร้าง..." : "✨ สร้างรหัสเชื่อมต่อ"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Rooms Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              เลือกห้องพัก <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-4 border border-gray-300 rounded-lg bg-gray-50">
              {rooms.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <p>ไม่มีห้องพักที่ว่าง</p>
                  <p className="text-sm">กรุณาเพิ่มห้องพักในหอพักก่อน</p>
                </div>
              ) : (
                rooms.map((room) => (
                  <label
                    key={room.id}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.roomIds.includes(room.id)
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.roomIds.includes(room.id)}
                      onChange={() => handleRoomToggle(room.id)}
                    />
                    <div
                      className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                        formData.roomIds.includes(room.id)
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {formData.roomIds.includes(room.id) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{room.dormitory.name}</div>
                      <div className="text-sm text-gray-500">
                        ห้อง {room.name}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
            {hasSubmitted && !fieldErrors.roomIds?.isValid && (
              <p className="text-red-500 text-sm mt-1">
                {fieldErrors.roomIds?.message}
              </p>
            )}
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
                  {editTenant ? "อัปเดต" : "บันทึก"}
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
