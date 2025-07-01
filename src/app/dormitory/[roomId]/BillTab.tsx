"use client";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import BillModal from "@/app/components/BillModal";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";
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
  const [editBill, setEditBill] = useState<any | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<any>(null);
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
    <div className="bg-white rounded-xl shadow-xl p-0 overflow-hidden">
      <div className="bg-blue-50 px-6 py-4 border-b flex items-center justify-between">
        <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
          <span>💸</span> บิลค่าเช่า
        </h3>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            setEditBill(null);
            setModalOpen(true);
          }}
        >
          + เพิ่มบิล
        </button>
      </div>
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left border border-blue-100 rounded-xl overflow-hidden text-sm">
              <thead>
                <tr className="bg-blue-100 text-blue-900">
                  <th className="p-3 font-semibold whitespace-nowrap">
                    วันที่บิล
                  </th>
                  <th className="p-3 font-semibold whitespace-nowrap">
                    ชื่อผู้เช่า
                  </th>
                  <th className="p-3 font-semibold whitespace-nowrap">
                    ค่าน้ำ
                  </th>
                  <th className="p-3 font-semibold whitespace-nowrap">ค่าไฟ</th>
                  <th className="p-3 font-semibold whitespace-nowrap">
                    ค่าส่วนกลาง
                  </th>
                  <th className="p-3 font-semibold whitespace-nowrap">อื่นๆ</th>
                  <th className="p-3 font-semibold whitespace-nowrap">
                    ค่าเช่า
                  </th>
                  <th className="p-3 font-semibold whitespace-nowrap">
                    ส่วนลด
                  </th>
                  <th className="p-3 font-semibold whitespace-nowrap bg-blue-200">
                    รวม
                  </th>
                  <th className="p-3 font-semibold whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b: any, i: number) => (
                  <tr
                    key={b.id}
                    className={
                      "border-t border-blue-100 hover:bg-blue-50 transition-colors " +
                      (i % 2 === 0 ? "bg-white" : "bg-blue-25")
                    }
                  >
                    <td className="p-3 whitespace-nowrap">
                      {b.billDate?.slice(0, 10)}
                    </td>
                    <td className="p-3 whitespace-nowrap font-medium">
                      {b.tenant?.name || "ไม่ระบุ"}
                    </td>
                    <td className="p-3 text-right">
                      {b.water?.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      {b.electric?.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      {b.common?.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      {(b.other || 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      {b.rent?.toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-green-600 font-medium">
                      {(b.discount || 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-bold text-blue-700 bg-blue-50">
                      {b.total?.toLocaleString()}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                          onClick={() => handleEditBill(b)}
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                          onClick={() => {
                            setBillToDelete(b);
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
  );
}
