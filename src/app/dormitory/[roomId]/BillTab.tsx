"use client";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
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
      alert("กรุณาเลือกผู้เช่า");
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
      } else {
        await dispatch(
          addBill({
            token: auth.token!,
            bill: payload,
          })
        ).unwrap();
      }

      setModalOpen(false);
      setEditBill(null);
    } catch (error: any) {
      console.error(`Error ${isEdit ? "updating" : "adding"} bill:`, error);
      alert(`เกิดข้อผิดพลาด: ${error}`);
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
        alert(result.message);
        // Refresh bills data
        dispatch(fetchBills({ roomId, token: auth.token }));
      } else {
        alert(`เกิดข้อผิดพลาด: ${result.message}`);
      }
    } catch (error: any) {
      console.error("Error in bulk import:", error);
      alert(`เกิดข้อผิดพลาดในการ Import: ${error.message || error}`);
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
    } catch (error: any) {
      console.error("Error deleting bill:", error);
      alert(`เกิดข้อผิดพลาด: ${error}`);
    }
  };

  const handleDeleteClick = (bill: any) => {
    setBillToDelete(bill);
    setConfirmModalOpen(true);
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
    <div className="bg-white rounded-xl shadow-xl p-0 overflow-visible">
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

      <div className="bg-gray-50 px-6 py-6">
        {loading ? (
          <div className="text-center text-gray-500">กำลังโหลด...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : bills.length === 0 ? (
          <div className="text-center text-gray-500">ยังไม่มีบิล</div>
        ) : viewMode === "card" ? (
          <BillCardList
            bills={bills}
            onEdit={handleEditBill}
            onDelete={handleDeleteClick}
          />
        ) : (
          <BillTable
            bills={bills}
            onEdit={handleEditBill}
            onDelete={handleDeleteClick}
          />
        )}
      </div>
    </div>
  );
}
