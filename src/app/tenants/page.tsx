"use client";
import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import Navbar from "@/app/components/Navbar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import ValidatedInput from "@/app/components/ValidatedInput";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";
import { createPortal } from "react-dom";
import {
  validators,
  validateForm,
  FieldValidation,
} from "../../utils/validation";
import {
  fetchTenants,
  fetchRooms,
  addTenant,
  updateTenant,
  deleteTenant,
  clearError,
  clearTenants,
} from "@/store/tenantSlice";

// Interfaces are now imported from tenantSlice
type Tenant = {
  id: number;
  name: string;
  phone: string;
  idCard?: string;
  address: string;
  rooms: {
    room: {
      id: number;
      name: string;
      dormitory: {
        id: number;
        name: string;
      };
    };
  }[];
};

type TenantFormData = {
  id?: number;
  name: string;
  phone: string;
  idCard?: string;
  address: string;
  password?: string;
  roomIds: number[];
};

export default function TenantsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
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

  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const { tenants, rooms, loading, submitting, error } = useSelector(
    (state: RootState) => state.tenant
  );

  // Validation rules
  const validationRules = useMemo(
    () => ({
      name: [(value: string) => validators.required(value, "ชื่อ")],
      phone: [(value: string) => validators.required(value, "เบอร์โทร")],
      address: [(value: string) => validators.required(value, "ที่อยู่")],
      password: [
        (value: string) => {
          if (!editTenant) return validators.required(value, "รหัสผ่าน");
          return { isValid: true, message: "" };
        },
      ],
      roomIds: [
        (value: number[]) => {
          if (!value || value.length === 0) {
            return { isValid: false, message: "กรุณาเลือกอย่างน้อย 1 ห้อง" };
          }
          return { isValid: true, message: "" };
        },
      ],
    }),
    [editTenant]
  );

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

  useEffect(() => {
    if (auth.token) {
      dispatch(fetchTenants({ token: auth.token }));
      dispatch(fetchRooms({ token: auth.token }));
    }

    // Clean up when component unmounts
    return () => {
      dispatch(clearTenants());
    };
  }, [auth.token, dispatch]);

  const handleOpenModal = (tenant?: Tenant) => {
    if (tenant) {
      setEditTenant(tenant);
      setFormData({
        id: tenant.id,
        name: tenant.name,
        phone: tenant.phone,
        idCard: tenant.idCard || "",
        address: tenant.address,
        password: "",
        roomIds: tenant.rooms?.map((tr: any) => tr.room.id) || [],
      });
    } else {
      setEditTenant(null);
      setFormData({
        name: "",
        phone: "",
        idCard: "",
        address: "",
        password: "",
        roomIds: [],
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditTenant(null);
    setFormData({
      name: "",
      phone: "",
      idCard: "",
      address: "",
      password: "",
      roomIds: [],
    });
    setFieldErrors({});
    setHasSubmitted(false);
  };

  const showAlert = (message: string, type: "success" | "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.token || submitting) return;

    setHasSubmitted(true);
    if (!isFormValid) {
      return;
    }

    try {
      if (editTenant) {
        await dispatch(
          updateTenant({
            token: auth.token,
            tenant: formData,
          })
        ).unwrap();
      } else {
        await dispatch(
          addTenant({
            token: auth.token,
            tenant: formData,
          })
        ).unwrap();
      }
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving tenant:", error);
      showAlert(`เกิดข้อผิดพลาด: ${error}`, "error");
    }
  };

  const handleDelete = async () => {
    if (!auth.token || !tenantToDelete) return;

    try {
      await dispatch(
        deleteTenant({
          token: auth.token,
          tenantId: tenantToDelete.id,
        })
      ).unwrap();
      showAlert("ลบผู้เช่าสำเร็จ", "success");
    } catch (error: any) {
      console.error("Error deleting tenant:", error);
      showAlert(`เกิดข้อผิดพลาด: ${error}`, "error");
    } finally {
      setConfirmModalOpen(false);
      setTenantToDelete(null);
    }
  };

  const handleRoomToggle = (roomId: number) => {
    const currentIds = [...formData.roomIds];
    if (currentIds.includes(roomId)) {
      setFormData({
        ...formData,
        roomIds: currentIds.filter((id) => id !== roomId),
      });
    } else {
      setFormData({
        ...formData,
        roomIds: [...currentIds, roomId],
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-blue-50 px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
                <span>👥</span> จัดการผู้เช่า
              </h3>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => handleOpenModal()}
              >
                + เพิ่มผู้เช่า
              </button>
            </div>

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
                          ชื่อ
                        </th>
                        <th className="p-3 font-semibold whitespace-nowrap">
                          เบอร์โทร
                        </th>
                        <th className="p-3 font-semibold whitespace-nowrap">
                          เลขบัตรประชาชน
                        </th>
                        <th className="p-3 font-semibold whitespace-nowrap">
                          ที่อยู่
                        </th>
                        <th className="p-3 font-semibold whitespace-nowrap">
                          ห้องที่เช่า
                        </th>
                        <th className="p-3 font-semibold whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((tenant, i) => (
                        <tr
                          key={tenant.id}
                          className={
                            "border-t border-blue-100 hover:bg-blue-50 transition-colors " +
                            (i % 2 === 0 ? "bg-white" : "bg-blue-25")
                          }
                        >
                          <td className="p-3 whitespace-nowrap font-medium">
                            {tenant.name}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {tenant.phone}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {tenant.idCard || "-"}
                          </td>
                          <td className="p-3 max-w-xs truncate">
                            {tenant.address}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {tenant.rooms.map((tr, index) => (
                                <span
                                  key={index}
                                  className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium"
                                >
                                  {tr.room.dormitory.name} - {tr.room.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                                onClick={() => handleOpenModal(tenant)}
                              >
                                ✏️ แก้ไข
                              </button>
                              <button
                                className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                                onClick={() => {
                                  setTenantToDelete(tenant);
                                  setConfirmModalOpen(true);
                                }}
                              >
                                🗑️ ลบ
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
          </div>
        </div>

        {/* Modal - Style เหมือน BillModal */}
        {modalOpen &&
          createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <span className="text-2xl">{editTenant ? "✏️" : "👥"}</span>
                    {editTenant ? "แก้ไขผู้เช่า" : "เพิ่มผู้เช่าใหม่"}
                  </h2>
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-xl"
                    onClick={handleCloseModal}
                  >
                    ×
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <ValidatedInput
                          label="ชื่อ"
                          type="text"
                          value={formData.name}
                          onChange={(value) =>
                            setFormData({ ...formData, name: value })
                          }
                          validation={fieldErrors.name}
                          required
                          placeholder="กรุณากรอกชื่อ"
                          icon="👤"
                          disabled={submitting}
                        />
                      </div>

                      <div>
                        <ValidatedInput
                          label="เบอร์โทร"
                          type="tel"
                          value={formData.phone}
                          onChange={(value) =>
                            setFormData({ ...formData, phone: value })
                          }
                          validation={fieldErrors.phone}
                          required
                          placeholder="กรุณากรอกเบอร์โทร"
                          icon="📞"
                          disabled={submitting}
                        />
                      </div>
                    </div>

                    <div>
                      <ValidatedInput
                        label="เลขบัตรประชาชน"
                        type="text"
                        value={formData.idCard || ""}
                        onChange={(value) =>
                          setFormData({ ...formData, idCard: value })
                        }
                        placeholder="กรุณากรอกเลขบัตรประชาชน (ไม่บังคับ)"
                        icon="🆔"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <ValidatedInput
                        label="ที่อยู่"
                        type="textarea"
                        value={formData.address}
                        onChange={(value) =>
                          setFormData({ ...formData, address: value })
                        }
                        validation={fieldErrors.address}
                        required
                        placeholder="กรุณากรอกที่อยู่"
                        icon="🏠"
                        disabled={submitting}
                        rows={3}
                      />
                    </div>

                    <div>
                      <ValidatedInput
                        label={`รหัสผ่าน ${
                          editTenant ? "(ปล่อยว่างถ้าไม่ต้องการเปลี่ยน)" : ""
                        }`}
                        type="password"
                        value={formData.password || ""}
                        onChange={(value) =>
                          setFormData({ ...formData, password: value })
                        }
                        validation={fieldErrors.password}
                        required={!editTenant}
                        placeholder="กรุณากรอกรหัสผ่าน"
                        icon="🔒"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center gap-2">
                          <span className="text-lg">🏠</span>
                          เลือกห้องเช่า (เลือกได้หลายห้อง)
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <div
                        className={`border rounded-xl p-4 max-h-60 overflow-y-auto transition-all duration-300 ease-in-out ${
                          fieldErrors.roomIds && !fieldErrors.roomIds.isValid
                            ? "border-red-300 bg-red-50"
                            : fieldErrors.roomIds && fieldErrors.roomIds.isValid
                            ? "border-green-300 bg-green-50"
                            : "border-gray-300 bg-gray-50"
                        }`}
                      >
                        {rooms.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">
                            ไม่มีห้องให้เลือก
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {rooms.map((room) => (
                              <label
                                key={room.id}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                  formData.roomIds.includes(room.id)
                                    ? "bg-blue-100 border-blue-300"
                                    : "bg-white hover:bg-gray-50"
                                } border`}
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.roomIds.includes(room.id)}
                                  onChange={() => handleRoomToggle(room.id)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  disabled={submitting}
                                />
                                <div className="flex-1">
                                  <span className="font-medium text-gray-900">
                                    {room.dormitory.name} - {room.name}
                                  </span>
                                  <span className="text-sm text-gray-600 ml-2">
                                    (฿{room.price.toLocaleString()}/เดือน)
                                  </span>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      {fieldErrors.roomIds && !fieldErrors.roomIds.isValid && (
                        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                          <span className="text-xs">⚠️</span>
                          <span>{fieldErrors.roomIds.message}</span>
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

                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                        disabled={submitting}
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                          submitting
                            ? "bg-gray-400 text-gray-300 cursor-not-allowed"
                            : isFormValid
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        disabled={submitting || (!isFormValid && hasSubmitted)}
                      >
                        {submitting ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            กำลังบันทึก...
                          </div>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <span>{editTenant ? "✏️" : "💾"}</span>
                            {editTenant ? "อัปเดต" : "บันทึก"}
                          </span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>,
            document.body
          )}

        {/* Confirm Modal */}
        <ConfirmDeleteModal
          open={confirmModalOpen}
          onClose={() => {
            setConfirmModalOpen(false);
            setTenantToDelete(null);
          }}
          onConfirm={handleDelete}
          text={`คุณแน่ใจหรือไม่ที่จะลบผู้เช่า ${tenantToDelete?.name}?`}
        />

        {/* Alert Modal */}
        {alertModalOpen &&
          createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">
                      {alertType === "success" ? "✅" : "❌"}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {alertType === "success" ? "สำเร็จ" : "เกิดข้อผิดพลาด"}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6">{alertMessage}</p>
                  <div className="flex justify-end">
                    <button
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        alertType === "success"
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                      onClick={() => setAlertModalOpen(false)}
                    >
                      ตกลง
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    </ProtectedRoute>
  );
}
