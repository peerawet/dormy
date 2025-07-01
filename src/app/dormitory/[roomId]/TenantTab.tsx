"use client";
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ValidatedInput from "@/app/components/ValidatedInput";
import {
  validators,
  validateForm,
  FieldValidation,
} from "../../../utils/validation";

// ฟังก์ชันเปิดหน้า preview สัญญาเช่าใน tab ใหม่
function openContractPreview(contractId: number) {
  const url = `/contract-preview/${contractId}`;
  window.open(url, "_blank");
}

function TenantModal({
  open,
  onClose,
  onSave,
  initial,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (form: any) => void;
  initial?: any;
  loading?: boolean;
}) {
  type FormType = {
    name: string;
    phone: string;
    idCard: string;
    address: string;
    password: string;
    startDate: string;
    endDate: string;
  };
  const [form, setForm] = useState<FormType>(
    initial
      ? {
          name: initial.name || "",
          phone: initial.phone || "",
          idCard: initial.idCard || "",
          address: initial.address || "",
          password: "", // ไม่แสดง password เดิม
          startDate: initial.startDate
            ? new Date(initial.startDate).toISOString().split("T")[0]
            : "",
          endDate: initial.endDate
            ? new Date(initial.endDate).toISOString().split("T")[0]
            : "",
        }
      : {
          name: "",
          phone: "",
          idCard: "",
          address: "",
          password: "",
          startDate: "",
          endDate: "",
        }
  );
  const [fieldErrors, setFieldErrors] = useState<FieldValidation>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Validation rules
  const validationRules = useMemo(
    () => ({
      name: [
        (value: string) => validators.required(value, "ชื่อผู้เช่า"),
        (value: string) => validators.minLength(value, 2, "ชื่อผู้เช่า"),
        (value: string) => validators.maxLength(value, 100, "ชื่อผู้เช่า"),
      ],
      phone: [
        (value: string) => validators.required(value, "เบอร์โทรศัพท์"),
        (value: string) => validators.phone(value),
      ],
      address: [
        (value: string) => validators.required(value, "ที่อยู่ผู้เช่า"),
        (value: string) => validators.minLength(value, 10, "ที่อยู่ผู้เช่า"),
        (value: string) => validators.maxLength(value, 500, "ที่อยู่ผู้เช่า"),
      ],
      idCard: [(value: string) => validators.idCard(value)],
      password: initial
        ? [
            // สำหรับการแก้ไข - password ไม่บังคับ
            (value: string) => {
              if (!value) return { isValid: true, message: "" };
              return validators.minLength(value, 6, "รหัสผ่าน").isValid
                ? { isValid: true, message: "" }
                : {
                    isValid: false,
                    message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
                  };
            },
          ]
        : [
            // สำหรับการสร้างใหม่ - password บังคับ
            (value: string) => validators.required(value, "รหัสผ่าน"),
            (value: string) => validators.minLength(value, 6, "รหัสผ่าน"),
          ],
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
    [form.startDate, initial]
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
            name: initial.name || "",
            phone: initial.phone || "",
            idCard: initial.idCard || "",
            address: initial.address || "",
            password: "", // ไม่แสดง password เดิม
            startDate: initial.startDate
              ? new Date(initial.startDate).toISOString().split("T")[0]
              : "",
            endDate: initial.endDate
              ? new Date(initial.endDate).toISOString().split("T")[0]
              : "",
          }
        : {
            name: "",
            phone: "",
            idCard: "",
            address: "",
            password: "",
            startDate: "",
            endDate: "",
          }
    );
    setFieldErrors({});
    setHasSubmitted(false);
  }, [initial, open]);

  if (!open) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-2xl">{initial ? "✏️" : "👤"}</span>
            {initial ? "แก้ไขข้อมูลผู้เช่า" : "เพิ่มผู้เช่าใหม่"}
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
            {/* ข้อมูลผู้เช่า */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                👤 ข้อมูลผู้เช่า
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ValidatedInput
                  label="ชื่อผู้เช่า"
                  value={form.name}
                  onChange={(value) => setForm((f) => ({ ...f, name: value }))}
                  validation={fieldErrors.name}
                  placeholder="กรอกชื่อ-นามสกุลผู้เช่า"
                  required
                  icon="👤"
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ValidatedInput
                  label="เลขบัตรประชาชน"
                  value={form.idCard}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, idCard: value }))
                  }
                  validation={fieldErrors.idCard}
                  placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
                  icon="🆔"
                  disabled={loading}
                />

                <ValidatedInput
                  label={initial ? "รหัสผ่านใหม่ (ไม่บังคับ)" : "รหัสผ่าน"}
                  value={form.password}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, password: value }))
                  }
                  validation={fieldErrors.password}
                  placeholder={
                    initial
                      ? "ใส่รหัสผ่านใหม่หากต้องการเปลี่ยน"
                      : "กรอกรหัสผ่าน"
                  }
                  type="password"
                  required={!initial}
                  icon="🔒"
                  disabled={loading}
                />
              </div>

              <ValidatedInput
                label="ที่อยู่ผู้เช่า"
                value={form.address}
                onChange={(value) => setForm((f) => ({ ...f, address: value }))}
                validation={fieldErrors.address}
                placeholder="กรอกที่อยู่ที่สามารถติดต่อได้"
                type="textarea"
                required
                icon="📍"
                rows={3}
                disabled={loading}
              />
            </div>

            {/* ข้อมูลสัญญา */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
                📅 ข้อมูลสัญญา
              </h3>

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
                  onChange={(value) =>
                    setForm((f) => ({ ...f, endDate: value }))
                  }
                  validation={fieldErrors.endDate}
                  type="date"
                  required
                  icon="🏁"
                  disabled={loading}
                />
              </div>

              {/* แสดงระยะเวลาสัญญา */}
              {form.startDate &&
                form.endDate &&
                new Date(form.endDate) > new Date(form.startDate) && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 text-lg">📊</span>
                        <span className="text-sm font-medium text-gray-700">
                          ระยะเวลาสัญญา
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {Math.ceil(
                            (new Date(form.endDate).getTime() -
                              new Date(form.startDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          วัน
                        </div>
                        <div className="text-xs text-gray-500">
                          (~
                          {Math.ceil(
                            (new Date(form.endDate).getTime() -
                              new Date(form.startDate).getTime()) /
                              (1000 * 60 * 60 * 24 * 30)
                          )}{" "}
                          เดือน)
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            onClick={onClose}
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              loading
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : isFormValid
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={() => {
              setHasSubmitted(true);
              if (isFormValid) {
                onSave(form);
              }
            }}
            disabled={loading || (!isFormValid && hasSubmitted)}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-gray-600"></div>
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>{initial ? "บันทึกการแก้ไข" : "เพิ่มผู้เช่า"}</span>
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

function ConfirmModal({
  open,
  onClose,
  onConfirm,
  text,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  text: string;
}) {
  if (!open) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-sm relative flex flex-col p-0">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          ×
        </button>
        {/* Header */}
        <div className="bg-blue-50 px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-blue-900 text-center">
            ยืนยัน
          </h2>
        </div>
        {/* Content */}
        <div className="bg-gray-50 px-6 py-6 text-center text-gray-700">
          {text}
        </div>
        {/* Footer */}
        <div className="bg-white px-6 py-4 flex gap-2 justify-center border-t">
          <button className="px-4 py-1 bg-gray-300 rounded" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={onConfirm}
          >
            ลบ
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

export default function TenantTab({ roomId }: { roomId: string }) {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editTenant, setEditTenant] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const auth = useSelector((state: RootState) => state.auth);
  const room = useSelector((state: RootState) => state.room.currentRoom);

  async function fetchTenants() {
    setLoading(true);
    const res = await fetch(`/api/tenant?roomId=${roomId}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    const data = await res.json();
    if (data.success) setTenants(data.tenants);
    setLoading(false);
  }

  useEffect(() => {
    if (auth.token) fetchTenants();
  }, [auth.token, roomId]);

  async function handleSave(form: any) {
    setModalLoading(true);
    if (editTenant) {
      await fetch("/api/tenant", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ ...form, id: editTenant.id, roomId }),
      });
    } else {
      await fetch("/api/tenant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ ...form, roomId }),
      });
    }
    setModalLoading(false);
    setModalOpen(false);
    setEditTenant(null);
    await fetchTenants();
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch("/api/tenant", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ id: deleteId }),
    });
    setDeleteId(null);
    await fetchTenants();
  }

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden flex flex-col p-0">
      {/* Header: Title + Add Button */}
      <div className="bg-blue-50 px-6 py-4 flex justify-between items-center border-b">
        <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
          👥 ผู้เช่า
        </h3>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            setModalOpen(true);
            setEditTenant(null);
          }}
        >
          + เพิ่มผู้เช่า
        </button>
      </div>
      {/* Section: Table */}
      <div className="bg-gray-50 px-6 py-6">
        {loading ? (
          <div className="text-center text-gray-500">กำลังโหลด...</div>
        ) : tenants.length === 0 ? (
          <div className="text-center text-gray-500">ยังไม่มีผู้เช่า</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left border border-blue-100 rounded-xl overflow-hidden text-sm">
              <thead>
                <tr className="bg-blue-100 text-blue-900">
                  <th className="p-3 font-semibold whitespace-nowrap">
                    ชื่อผู้เช่า
                  </th>
                  <th className="p-3 font-semibold whitespace-nowrap">
                    เบอร์โทร
                  </th>
                  <th className="p-3 font-semibold whitespace-nowrap">
                    ที่อยู่
                  </th>
                  <th className="p-3 font-semibold whitespace-nowrap">
                    วันที่เริ่ม
                  </th>
                  <th className="p-3 font-semibold whitespace-nowrap">
                    วันที่สิ้นสุด
                  </th>
                  <th className="p-3 font-semibold whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t, i) => (
                  <tr
                    key={t.id}
                    className={
                      "border-t border-blue-100 hover:bg-blue-50 transition-colors " +
                      (i % 2 === 0 ? "bg-white" : "bg-blue-25")
                    }
                  >
                    <td className="p-3 whitespace-nowrap font-medium">
                      {t.name}
                    </td>
                    <td className="p-3 whitespace-nowrap">{t.phone}</td>
                    <td
                      className="p-3 whitespace-nowrap max-w-xs truncate"
                      title={t.address}
                    >
                      {t.address}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {t.startDate.slice(0, 10)}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {t.endDate.slice(0, 10)}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                          onClick={() => openContractPreview(t.id)}
                        >
                          📋 ร่างสัญญา
                        </button>
                        <button
                          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          onClick={() => {
                            setModalOpen(true);
                            setEditTenant(t);
                          }}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          onClick={() => setDeleteId(t.id)}
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <TenantModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTenant(null);
        }}
        onSave={handleSave}
        initial={editTenant}
        loading={modalLoading}
      />
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        text="ยืนยันการลบผู้เช่า?"
      />
    </div>
  );
}
