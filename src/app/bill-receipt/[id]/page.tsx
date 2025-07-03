"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import BillReceiptDisplay from "@/app/components/BillReceiptDisplay";

interface BillDetail {
  id: number;
  billDate: string;
  tenant: {
    id: number;
    name: string;
    phone: string;
    idCard?: string;
  };
  room: {
    id: number;
    name: string;
    dormitory: {
      id: number;
      name: string;
      address: string;
      owner: {
        name: string;
        phone: string;
        promptpay?: string;
      };
    };
  };
  water: number;
  electric: number;
  common: number;
  other: number;
  rent: number;
  discount: number;
  total: number;
  meterWaterStart?: number;
  meterWaterEnd?: number;
  meterElectricStart?: number;
  meterElectricEnd?: number;
}

function BillReceiptContent() {
  const params = useParams();
  const billId = params.id as string;
  const auth = useSelector((state: RootState) => state.auth);
  const [bill, setBill] = useState<BillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBillDetail = async () => {
      if (!auth.token) return;

      try {
        const response = await fetch(`/api/bill/${billId}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          setBill(data.bill);
        } else {
          setError(data.message || "ไม่พบข้อมูลบิล");
        }
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchBillDetail();
  }, [billId, auth.token]);

  const handlePrint = () => {
    // Save the original title
    const originalTitle = document.title;

    // Format the date as dd-mm-yyyy
    const billDateFormatted = new Date(bill!.billDate)
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

    // Set the document title for the filename
    document.title = `${bill!.room.dormitory.name}-${
      bill!.room.name
    }-${billDateFormatted}`;

    // Print the document
    window.print();

    // Restore the original title after printing
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดใบเสร็จ...</p>
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ไม่พบข้อมูลบิล
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.close()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatNumber = (number: number) => {
    return number.toLocaleString("th-TH");
  };

  const waterUnits =
    bill.meterWaterEnd && bill.meterWaterStart
      ? bill.meterWaterEnd - bill.meterWaterStart
      : null;

  const electricUnits =
    bill.meterElectricEnd && bill.meterElectricStart
      ? bill.meterElectricEnd - bill.meterElectricStart
      : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:py-0 print:bg-white">
      <div className="max-w-4xl mx-auto print:max-w-none">
        <div className="mb-6 text-center print:hidden">
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            🖨️ พิมพ์ใบเสร็จ
          </button>
        </div>

        <BillReceiptDisplay bill={bill} />
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
          .print\\:p-3 {
            padding: 0.375rem !important;
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
          .print\\:text-xs {
            font-size: 0.4rem !important;
          }
          .print\\:mb-4 {
            margin-bottom: 0.25rem !important;
          }
          .print\\:mb-2 {
            margin-bottom: 0.125rem !important;
          }
          .print\\:mb-1 {
            margin-bottom: 0.0625rem !important;
          }
          .print\\:mb-0 {
            margin-bottom: 0 !important;
          }
          .print\\:gap-4 {
            gap: 0.25rem !important;
          }
          .print\\:gap-2 {
            gap: 0.125rem !important;
          }
          .print\\:space-y-2 > * + * {
            margin-top: 0.125rem !important;
          }
          .print\\:space-y-1 > * + * {
            margin-top: 0.0625rem !important;
          }
          .print\\:space-y-0 > * + * {
            margin-top: 0 !important;
          }
          .print\\:pb-1 {
            padding-bottom: 0.0625rem !important;
          }
          .print\\:pt-3 {
            padding-top: 0.25rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function BillReceiptPage() {
  return (
    <ProtectedRoute>
      <BillReceiptContent />
    </ProtectedRoute>
  );
}
