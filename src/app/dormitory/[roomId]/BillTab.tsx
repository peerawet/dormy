"use client";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { createPortal } from "react-dom";
import BillModal from "@/app/components/BillModal";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";
import ImportExcelModal from "@/app/components/ImportExcelModal";
import BillHeader from "@/app/components/BillHeader";
import BillCardList from "@/app/components/BillCardList";
import BillTable from "@/app/components/BillTable";
import {
  fetchBills,
  addBill,
  updateBill,
  deleteBill,
  toggleBillPaid,
  clearError,
  clearBills,
} from "@/store/billSlice";

export default function BillTab({
  roomId,
  room,
}: {
  roomId: string;
  room: any;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [editBill, setEditBill] = useState<any | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">(
    typeof window !== "undefined" && window.innerWidth < 768 ? "card" : "table"
  );
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  const showAlert = (message: string, type: "success" | "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertModalOpen(true);
  };

  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const { bills, loading, error } = useSelector(
    (state: RootState) => state.bill
  );

  const tenants = (room?.tenantRooms || [])
    .map((tenantRoom: any) => ({
      id: tenantRoom.tenant?.id,
      name: tenantRoom.tenant?.name,
      phone: tenantRoom.tenant?.phone,
      address: tenantRoom.tenant?.address,
    }))
    .filter((t: any) => !!t.name && !!t.id);

  async function handleAddBill(form: any) {
    const isEdit = form.id !== null;

    // ตรวจสอบว่าเลือกผู้เช่าแล้ว
    if (!form.tenantId || form.tenantId === "") {
      showAlert("กรุณาเลือกผู้เช่า", "error");
      return;
    }

    const payload = {
      billDate: form.billDate,
      tenantId: Number(form.tenantId),
      water: Number(form.water),
      electric: Number(form.electric),
      common: Number(form.common),
      other: Number(form.other),
      rent: Number(form.rent),
      discount: Number(form.discount) || 0,
      total: Number(form.total),
      meterWaterStart: form.meterWaterStart
        ? Number(form.meterWaterStart)
        : null,
      meterWaterEnd: form.meterWaterEnd ? Number(form.meterWaterEnd) : null,
      meterElectricStart: form.meterElectricStart
        ? Number(form.meterElectricStart)
        : null,
      meterElectricEnd: form.meterElectricEnd
        ? Number(form.meterElectricEnd)
        : null,
      roomId: Number(roomId),
    };

    try {
      if (isEdit) {
        await dispatch(
          updateBill({
            token: auth.token!,
            billId: form.id,
            bill: payload,
          })
        ).unwrap();
        showAlert("อัปเดตบิลสำเร็จ", "success");
      } else {
        await dispatch(
          addBill({
            token: auth.token!,
            bill: payload,
          })
        ).unwrap();
        showAlert("เพิ่มบิลสำเร็จ", "success");
      }

      setModalOpen(false);
      setEditBill(null);
    } catch (error: any) {
      console.error(`Error ${isEdit ? "updating" : "adding"} bill:`, error);
      showAlert(`เกิดข้อผิดพลาด: ${error}`, "error");
    }
  }

  async function handleBulkImport(bills: any[]) {
    if (!auth.token) return;

    try {
      const response = await fetch("/api/bill/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ bills }),
      });

      const result = await response.json();

      setImportModalOpen(false);

      if (result.success) {
        showAlert(result.message, "success");
        // Refresh bills data
        dispatch(fetchBills({ roomId, token: auth.token }));
      } else {
        showAlert(`เกิดข้อผิดพลาด: ${result.message}`, "error");
      }
    } catch (error: any) {
      console.error("Error in bulk import:", error);
      showAlert(`เกิดข้อผิดพลาดในการ Import: ${error.message || error}`, "error");
      setImportModalOpen(false);
    }
  }

  const handleEditBill = (bill: any) => {
    setEditBill(bill);
    setModalOpen(true);
  };

  const handleDeleteBill = async () => {
    if (!auth.token || !billToDelete) return;
    try {
      await dispatch(
        deleteBill({
          token: auth.token!,
          billId: billToDelete.id,
        })
      ).unwrap();

      setConfirmModalOpen(false);
      setBillToDelete(null);
      showAlert("ลบบิลสำเร็จ", "success");
    } catch (error: any) {
      console.error("Error deleting bill:", error);
      showAlert(`เกิดข้อผิดพลาด: ${error}`, "error");
    }
  };

  const handleDeleteClick = (bill: any) => {
    setBillToDelete(bill);
    setConfirmModalOpen(true);
  };

  const handleTogglePaid = async (bill: any) => {
    if (!auth.token) return;
    try {
      await dispatch(
        toggleBillPaid({
          token: auth.token,
          billId: bill.id,
          isPaid: !bill.isPaid,
        })
      ).unwrap();
      showAlert(bill.isPaid ? "เปลี่ยนเป็นยังไม่ชำระ" : "บันทึกการชำระเงินสำเร็จ", "success");
    } catch (error: any) {
      console.error("Error toggling bill paid status:", error);
      showAlert(`เกิดข้อผิดพลาด: ${error}`, "error");
    }
  };

  const handleUploadSlip = async (bill: any, file: File) => {
    if (!auth.token) return;
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/bill/${bill.id}/upload-slip`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to upload slip");
      }

      // Refresh bills to get updated data
      dispatch(fetchBills({ roomId, token: auth.token }));
      showAlert("อัปโหลดสลิปสำเร็จ", "success");
    } catch (error: any) {
      console.error("Error uploading slip:", error);
      showAlert(`เกิดข้อผิดพลาด: ${error.message || error}`, "error");
    }
  };

  useEffect(() => {
    if (auth.token && roomId) {
      dispatch(fetchBills({ roomId, token: auth.token }));
    }

    // Clean up when component unmounts or roomId changes
    return () => {
      dispatch(clearBills());
    };
  }, [auth.token, roomId, dispatch]);

  return (
    <div className="bg-white rounded-xl lg:shadow-xl p-0 overflow-visible">
      <BillHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddBill={() => {
          setEditBill(null);
          setModalOpen(true);
        }}
        onImportExcel={() => setImportModalOpen(true)}
      />

      <BillModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditBill(null);
        }}
        onSave={handleAddBill}
        loading={loading}
        room={room}
        tenants={tenants}
        bills={bills}
        editBill={editBill}
        autoSelectTenant={tenants.length === 1}
      />

      <ImportExcelModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleBulkImport}
        loading={loading}
        tenants={tenants}
        roomId={roomId}
      />

      <ConfirmDeleteModal
        open={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setBillToDelete(null);
        }}
        onConfirm={handleDeleteBill}
        text={`คุณแน่ใจหรือไม่ที่จะลบบิลของ ${
          billToDelete?.tenant?.name || "ผู้เช่าคนนี้"
        }?`}
      />

      <div className="bg-gray-50 px-2 py-3 lg:px-6 lg:py-6">
        {loading ? (
          <div className="text-center text-gray-500">กำลังโหลด...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : bills.length === 0 ? (
          <div className="text-center text-gray-500">ยังไม่มีบิล</div>
        ) : (
          <>
            {/* Mobile: Always show cards */}
            <div className="lg:hidden">
              <BillCardList
                bills={bills}
                onEdit={handleEditBill}
                onDelete={handleDeleteClick}
                onTogglePaid={handleTogglePaid}
                onUploadSlip={handleUploadSlip}
              />
            </div>
            {/* Desktop: Use viewMode toggle */}
            <div className="hidden lg:block">
              {viewMode === "card" ? (
                <BillCardList
                  bills={bills}
                  onEdit={handleEditBill}
                  onDelete={handleDeleteClick}
                  onTogglePaid={handleTogglePaid}
                  onUploadSlip={handleUploadSlip}
                />
              ) : (
                <BillTable
                  bills={bills}
                  onEdit={handleEditBill}
                  onDelete={handleDeleteClick}
                  onTogglePaid={handleTogglePaid}
                  onUploadSlip={handleUploadSlip}
                />
              )}
            </div>
          </>
        )}
      </div>

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
  );
}
