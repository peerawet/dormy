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
import ContractHeader from "@/app/components/ContractHeader";
import ContractCardList from "@/app/components/ContractCardList";
import ContractTable from "@/app/components/ContractTable";

// ฟังก์ชันเปิดหน้า preview สัญญาเช่าใน tab ใหม่
function openContractPreview(contractId: number) {
  const url = `/contract-preview/${contractId}`;
  window.open(url, "_blank");
}

// ฟังก์ชันเปิดหน้าใบเสร็จสัญญาเช่าใน tab ใหม่
function openContractReceipt(contractId: number) {
  const url = `/contract-receipt/${contractId}`;
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
  const [viewMode, setViewMode] = useState<"table" | "card">(
    typeof window !== "undefined" && window.innerWidth < 768 ? "card" : "table"
  );

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
      console.log("🔍 DEBUG - Raw form data:", {
        deposit: form.deposit,
        depositType: typeof form.deposit,
        insurance: form.insurance,
        insuranceType: typeof form.insurance,
      });

      const contractData = {
        tenantId: Number(form.tenantId),
        startDate: form.startDate,
        endDate: form.endDate,
        roomId: Number(form.roomId),
        deposit:
          form.deposit && String(form.deposit).trim() !== ""
            ? Number(form.deposit)
            : null,
        insurance:
          form.insurance && String(form.insurance).trim() !== ""
            ? Number(form.insurance)
            : null,
      };

      console.log("🔄 ContractTab - Prepared contract data:", contractData);

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

  const handlePreview = (id: number) => openContractPreview(id);
  const handleReceipt = (id: number) => openContractReceipt(id);
  const handleDeleteClick = (contract: any) => {
    setContractToDelete(contract);
    setConfirmModalOpen(true);
  };

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
    <div className="bg-white rounded-xl lg:shadow-xl p-0 overflow-visible">
      <ContractHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddContract={() => {
          setEditContract(null);
          setModalOpen(true);
        }}
      />

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

      <div className="bg-gray-50 px-2 py-3 lg:px-6 lg:py-6">
        {loading ? (
          <div className="text-center text-gray-500">กำลังโหลด...</div>
        ) : contracts.length === 0 ? (
          <div className="text-center text-gray-500">ยังไม่มีสัญญาเช่า</div>
        ) : (
          <>
            {/* Mobile: Always show cards */}
            <div className="lg:hidden">
              <ContractCardList
                contracts={contracts}
                onEdit={(c) => {
                  setEditContract(c);
                  setModalOpen(true);
                }}
                onDelete={handleDeleteClick}
                onPreview={handlePreview}
                onReceipt={handleReceipt}
              />
            </div>
            {/* Desktop: Use viewMode toggle */}
            <div className="hidden lg:block">
              {viewMode === "card" ? (
                <ContractCardList
                  contracts={contracts}
                  onEdit={(c) => {
                    setEditContract(c);
                    setModalOpen(true);
                  }}
                  onDelete={handleDeleteClick}
                  onPreview={handlePreview}
                  onReceipt={handleReceipt}
                />
              ) : (
                <ContractTable
                  contracts={contracts}
                  onEdit={(c) => {
                    setEditContract(c);
                    setModalOpen(true);
                  }}
                  onDelete={handleDeleteClick}
                  onPreview={handlePreview}
                  onReceipt={handleReceipt}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
