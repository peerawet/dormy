"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ContractPreviewDisplay from "@/app/components/ContractPreviewDisplay";

export default function ContractPreviewPage() {
  const params = useParams();
  const contractId = params.contractId;
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (auth.token && contractId) {
      fetchContractData();
    }
  }, [auth.token, contractId]);

  async function fetchContractData() {
    try {
      // Fetch contract data with all related information
      const contractRes = await fetch(`/api/rental-contract/${contractId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const contractData = await contractRes.json();

      if (contractData.success) {
        setContract(contractData.contract);
      }
    } catch (error) {
      console.error("Error fetching contract data:", error);
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลสัญญา...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">ไม่พบข้อมูลสัญญาเช่า</p>
          <button
            onClick={() => window.close()}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    );
  }

  const { tenant, room } = contract;

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:py-0 print:bg-white">
      <div className="max-w-4xl mx-auto print:max-w-none">
        {/* Header */}
        <div className="mb-6 text-center print:hidden">
          <div className="flex gap-3 justify-center">
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              🖨️ ปริ้น
            </button>
            <button
              onClick={() => window.close()}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ปิด
            </button>
          </div>
        </div>

        {/* Contract Preview */}
        <ContractPreviewDisplay contract={contract} token={auth.token} />
      </div>

      <style jsx global>{`
        @media print {
          body {
            margin: 0 !important;
            padding: 0 !important;
            font-size: 7px !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:p-4 {
            padding: 0.5rem !important;
          }
          .print\\:p-2 {
            padding: 0.125rem !important;
          }
          .print\\:text-xl {
            font-size: 0.875rem !important;
          }
          .print\\:text-lg {
            font-size: 0.75rem !important;
          }
          .print\\:text-base {
            font-size: 0.625rem !important;
          }
          .print\\:text-sm {
            font-size: 0.5rem !important;
          }
          .print\\:mb-4 {
            margin-bottom: 0.5rem !important;
          }
          .print\\:mb-2 {
            margin-bottom: 0.25rem !important;
          }
          .print\\:mb-1 {
            margin-bottom: 0.125rem !important;
          }
          .print\\:pb-1 {
            padding-bottom: 0.125rem !important;
          }
          .print\\:space-y-2 > * + * {
            margin-top: 0.25rem !important;
          }
          .print\\:space-y-1 > * + * {
            margin-top: 0.125rem !important;
          }
          .print\\:gap-4 {
            gap: 0.5rem !important;
          }
          .print\\:gap-2 {
            gap: 0.25rem !important;
          }
        }
      `}</style>
    </div>
  );
}
