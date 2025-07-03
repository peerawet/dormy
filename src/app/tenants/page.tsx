"use client";
import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import Navbar from "@/app/components/Navbar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";
import TenantCard from "@/app/components/TenantCard";
import TenantTable from "@/app/components/TenantTable";
import TenantModal from "@/app/components/TenantModal";
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
  const [viewMode, setViewMode] = useState<"table" | "card">(
    typeof window !== "undefined" && window.innerWidth < 768 ? "card" : "table"
  );

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
    setEditTenant(tenant || null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditTenant(null);
  };

  const showAlert = (message: string, type: "success" | "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertModalOpen(true);
  };

  const handleSubmit = async (formData: TenantFormData) => {
    if (!auth.token || submitting) return;

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

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tenants.map((tenant) => (
        <TenantCard
          key={tenant.id}
          tenant={tenant}
          onEdit={() => handleOpenModal(tenant)}
          onDelete={() => {
            setTenantToDelete(tenant);
            setConfirmModalOpen(true);
          }}
        />
      ))}
    </div>
  );

  const renderTableView = () => (
    <TenantTable
      tenants={tenants}
      onEdit={handleOpenModal}
      onDelete={(tenant) => {
        setTenantToDelete(tenant);
        setConfirmModalOpen(true);
      }}
    />
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-xl overflow-visible">
            {/* Desktop Header */}
            <div className="hidden md:flex bg-blue-50 px-6 py-4 border-b items-center justify-between">
              <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
                <span>👥</span> จัดการผู้เช่า
              </h3>
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      viewMode === "table"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    ตาราง
                  </button>
                  <button
                    onClick={() => setViewMode("card")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      viewMode === "card"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    การ์ด
                  </button>
                </div>

                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  onClick={() => handleOpenModal()}
                >
                  + เพิ่มผู้เช่า
                </button>
              </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden bg-blue-50 px-4 py-3 border-b">
              {/* Top Row: Title + Toggle */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base text-blue-900 flex items-center gap-2">
                  <span>👥</span> จัดการผู้เช่า
                </h3>
                {/* Compact View Toggle */}
                <div className="flex bg-white rounded-lg p-0.5 shadow-sm border">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                      viewMode === "table"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    <span className="hidden xs:inline">ตาราง</span>
                  </button>
                  <button
                    onClick={() => setViewMode("card")}
                    className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                      viewMode === "card"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                    <span className="hidden xs:inline">การ์ด</span>
                  </button>
                </div>
              </div>

              {/* Bottom Row: Action Buttons */}
              <div className="flex justify-center">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium w-full max-w-48 touch-manipulation"
                  onClick={() => handleOpenModal()}
                >
                  + เพิ่มผู้เช่า
                </button>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-6">
              {loading ? (
                <div className="text-center text-gray-500">กำลังโหลด...</div>
              ) : tenants.length === 0 ? (
                <div className="text-center text-gray-500">ยังไม่มีผู้เช่า</div>
              ) : viewMode === "card" ? (
                renderCardView()
              ) : (
                renderTableView()
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        <TenantModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          editTenant={editTenant}
          rooms={rooms}
          loading={submitting}
        />

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
