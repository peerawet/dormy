"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ContractPreviewDisplay from "@/app/components/ContractPreviewDisplay";
import Link from "next/link";

export default function TenantContractPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.contractId;
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state: RootState) => state.tenantAuth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const storedToken = localStorage.getItem("tenant_token");
    if (!storedToken) {
      router.push("/tenant-login");
      return;
    }

    if (contractId) {
      fetchContractData(storedToken);
    }
  }, [mounted, contractId, router]);

  async function fetchContractData(authToken: string) {
    try {
      // Fetch contract data with all related information
      const contractRes = await fetch(`/api/tenant-auth/contract/${contractId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const contractData = await contractRes.json();

      if (contractData.success) {
        setContract(contractData.contract);
      } else {
        console.error("Failed to fetch contract:", contractData.message);
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

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-white/50">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            กำลังโหลดสัญญา...
          </h2>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-white/50">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ไม่พบข้อมูลสัญญาเช่า
          </h2>
          <p className="text-gray-600 mb-6">
            ไม่สามารถเข้าถึงสัญญานี้ได้
          </p>
          <Link
            href="/tenant"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <span>🏠</span>
            <span>กลับหน้าหลัก</span>
          </Link>
        </div>
      </div>
    );
  }

  const { tenant, room } = contract;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 print:py-0 print:bg-white">
      <div className="max-w-4xl mx-auto print:max-w-none px-4">
        {/* Header */}
        <div className="mb-6 print:hidden">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/tenant"
              className="inline-flex items-center gap-2 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:shadow-lg backdrop-blur-sm"
            >
              <span>🔙</span>
              <span>กลับหน้าหลัก</span>
            </Link>
            <div className="inline-flex items-center gap-2 bg-blue-100/80 backdrop-blur-sm text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200/50">
              <span>📄</span>
              <span>สัญญาเช่าห้องพัก</span>
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span>🖨️</span>
              <span>พิมพ์สัญญา</span>
            </button>
          </div>
        </div>

        {/* Contract Preview - Read-only for tenants */}
        <ContractPreviewDisplay 
          contract={contract} 
          token={token || ""} 
          readOnly={true}
        />
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
          .print\\:p-4 {
            padding: 1rem !important;
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
          .print\\:text-xl {
            font-size: 1.25rem !important;
          }
          .print\\:mb-4 {
            margin-bottom: 1rem !important;
          }
          .print\\:gap-2 {
            gap: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}


