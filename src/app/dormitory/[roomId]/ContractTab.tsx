"use client";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  fetchContracts,
  addContract,
  updateContract,
  deleteContract,
  clearContracts,
} from "@/store/rentalContractSlice";
import { ContractModal } from "@/app/components/ContractModal";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";

// ฟังก์ชันเปิดหน้า preview สัญญาเช่าใน tab ใหม่
function openContractPreview(contractId: number) {
  const url = `/contract-preview/${contractId}`;
  window.open(url, "_blank");
}

// Modal components have been moved to src/app/components/ContractModal.tsx

export default function ContractTab({ roomId }: { roomId: string }) {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const { contracts, loading, error } = useSelector(
    (state: RootState) => state.rentalContract
  );
  const [tenants, setTenants] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editContract, setEditContract] = useState<any>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<any>(null);

  // fetchContracts is now handled by Redux

  async function fetchTenants() {
    if (!auth.token) return;
    try {
      const res = await fetch(`/api/tenant`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTenants(data.tenants);
      }
    } catch (error) {
      console.error("Error fetching tenants:", error);
    }
  }

  async function handleSave(form: any) {
    if (!auth.token) return;
    try {
      const isEdit = !!form.id;
      const contractData = {
        tenantId: Number(form.tenantId),
        startDate: form.startDate,
        endDate: form.endDate,
        roomId: Number(form.roomId),
      };

      if (isEdit) {
        await dispatch(
          updateContract({
            token: auth.token,
            contractId: form.id,
            contract: contractData,
          })
        ).unwrap();
      } else {
        await dispatch(
          addContract({
            token: auth.token,
            contract: contractData,
          })
        ).unwrap();
      }

      setModalOpen(false);
      setEditContract(null);
    } catch (error: any) {
      console.error("Error saving contract:", error);
      alert(`เกิดข้อผิดพลาด: ${error}`);
    }
  }

  async function handleDelete() {
    if (!auth.token || !contractToDelete) return;
    try {
      await dispatch(
        deleteContract({
          token: auth.token,
          contractId: contractToDelete.id,
          roomId: Number(roomId),
        })
      ).unwrap();

      setConfirmModalOpen(false);
      setContractToDelete(null);
    } catch (error: any) {
      console.error("Error deleting contract:", error);
      alert(`เกิดข้อผิดพลาด: ${error}`);
    }
  }

  useEffect(() => {
    if (auth.token && roomId) {
      dispatch(fetchContracts({ roomId, token: auth.token }));
      fetchTenants();
    }

    // Clean up when component unmounts or roomId changes
    return () => {
      dispatch(clearContracts());
    };
  }, [auth.token, roomId, dispatch]);

  return (
    <div className="bg-white rounded-xl shadow-xl p-0 overflow-hidden">
      <div className="bg-blue-50 px-6 py-4 border-b flex items-center justify-between">
        <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
          <span>📋</span> สัญญาเช่า
        </h3>
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            setEditContract(null);
            setModalOpen(true);
          }}
        >
          + เพิ่มสัญญา
        </button>
      </div>

      <ContractModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditContract(null);
        }}
        onSave={handleSave}
        initial={editContract}
        loading={loading}
        tenants={tenants}
        roomId={roomId}
      />

      <ConfirmDeleteModal
        open={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setContractToDelete(null);
        }}
        onConfirm={handleDelete}
        text={`คุณแน่ใจหรือไม่ที่จะลบสัญญาเช่าของ ${contractToDelete?.tenant?.name}?`}
      />

      <div className="bg-gray-50 px-6 py-6">
        {loading ? (
          <div className="text-center text-gray-500">กำลังโหลด...</div>
        ) : contracts.length === 0 ? (
          <div className="text-center text-gray-500">ยังไม่มีสัญญาเช่า</div>
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
                    วันที่เริ่มสัญญา
                  </th>
                  <th className="p-3 font-semibold whitespace-nowrap">
                    วันที่สิ้นสุดสัญญา
                  </th>
                  <th className="p-3 font-semibold whitespace-nowrap">สถานะ</th>
                  <th className="p-3 font-semibold whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract: any, i: number) => {
                  const startDate = new Date(contract.startDate);
                  const endDate = new Date(contract.endDate);
                  const today = new Date();
                  const isActive = today >= startDate && today <= endDate;
                  const isExpired = today > endDate;

                  return (
                    <tr
                      key={contract.id}
                      className={
                        "border-t border-blue-100 hover:bg-blue-50 transition-colors " +
                        (i % 2 === 0 ? "bg-white" : "bg-blue-25")
                      }
                    >
                      <td className="p-3 whitespace-nowrap font-medium">
                        {contract.tenant?.name || "ไม่ระบุ"}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {contract.tenant?.phone || "-"}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {contract.startDate?.slice(0, 10)}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {contract.endDate?.slice(0, 10)}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isActive
                              ? "bg-green-100 text-green-800"
                              : isExpired
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {isActive
                            ? "✅ กำลังใช้งาน"
                            : isExpired
                            ? "❌ หมดอายุ"
                            : "⏳ ยังไม่เริ่ม"}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                            onClick={() => openContractPreview(contract.id)}
                          >
                            📄 ดู
                          </button>
                          <button
                            className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                            onClick={() => {
                              setEditContract(contract);
                              setModalOpen(true);
                            }}
                          >
                            ✏️ แก้ไข
                          </button>
                          <button
                            className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                            onClick={() => {
                              setContractToDelete(contract);
                              setConfirmModalOpen(true);
                            }}
                          >
                            🗑️ ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
