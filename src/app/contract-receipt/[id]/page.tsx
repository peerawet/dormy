"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ProtectedRoute from "@/app/components/ProtectedRoute";

interface ContractDetail {
  id: number;
  startDate: string;
  endDate: string;
  deposit?: number;
  insurance?: number;
  tenant: {
    id: number;
    name: string;
    phone: string;
    idCard?: string;
    address: string;
  };
  room: {
    id: number;
    name: string;
    price: number;
    waterRate?: number;
    electricRate?: number;
    waterFlat?: number;
    electricFlat?: number;
    commonFee?: number;
    otherFee?: number;
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
}

function ContractReceiptContent() {
  const params = useParams();
  const contractId = params.id as string;
  const auth = useSelector((state: RootState) => state.auth);
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContractDetail = async () => {
      if (!auth.token) return;

      try {
        const response = await fetch(`/api/rental-contract/${contractId}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          setContract(data.contract);
        } else {
          setError(data.message || "ไม่พบข้อมูลสัญญา");
        }
      } catch (err) {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchContractDetail();
  }, [contractId, auth.token]);

  const handlePrint = () => {
    // Save the original title
    const originalTitle = document.title;

    // Format the date as dd-mm-yyyy
    const contractDateFormatted = new Date(contract!.startDate)
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

    // Set the document title for the filename
    document.title = `สัญญาเช่า-${contract!.room.dormitory.name}-${
      contract!.room.name
    }-${contractDateFormatted}`;

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
          <p className="text-gray-600">กำลังโหลดใบเสร็จสัญญา...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ไม่พบข้อมูลสัญญา
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

  // Calculate total for deposit and insurance only
  const calculateTotal = () => {
    let total = 0;
    if (contract.deposit) total += contract.deposit;
    if (contract.insurance) total += contract.insurance;
    return total;
  };

  const totalAmount = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:py-0 print:bg-white">
      <div className="max-w-4xl mx-auto print:max-w-none">
        <div className="mb-6 text-center print:hidden">
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            🖨️ พิมพ์ใบเสร็จสัญญา
          </button>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden print:shadow-none print:rounded-none">
          <div className="bg-blue-600 text-white p-6 text-center print:p-4">
            <h1 className="text-3xl font-bold print:text-xl">
              ใบเสร็จสัญญาเช่า
            </h1>
          </div>

          <div className="p-8 print:p-4">
            <div className="text-center mb-8 print:mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 print:text-lg print:mb-1">
                {contract.room.dormitory.name}
              </h2>
              <p className="text-gray-600 mb-1 print:text-sm print:mb-0">
                {contract.room.dormitory.address}
              </p>
              <p className="text-gray-600 print:text-sm">
                โทรศัพท์: {contract.room.dormitory.owner.phone}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:gap-4 print:mb-4">
              <div className="space-y-3 print:space-y-2">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 print:text-base print:pb-1">
                  📋 ข้อมูลสัญญา
                </h3>
                <div className="space-y-2 print:space-y-1">
                  <p className="print:text-sm">
                    <span className="font-medium">เลขที่สัญญา:</span>{" "}
                    {contract.id.toString().padStart(6, "0")}
                  </p>
                  <p className="print:text-sm">
                    <span className="font-medium">วันที่เริ่มสัญญา:</span>{" "}
                    {formatDate(contract.startDate)}
                  </p>
                  <p className="print:text-sm">
                    <span className="font-medium">วันที่สิ้นสุดสัญญา:</span>{" "}
                    {formatDate(contract.endDate)}
                  </p>
                  <p className="print:text-sm">
                    <span className="font-medium">ห้อง:</span>{" "}
                    {contract.room.name}
                  </p>
                </div>
              </div>

              <div className="space-y-3 print:space-y-2">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 print:text-base print:pb-1">
                  👤 ข้อมูลผู้เช่า
                </h3>
                <div className="space-y-2 print:space-y-1">
                  <p className="print:text-sm">
                    <span className="font-medium">ชื่อ:</span>{" "}
                    {contract.tenant.name}
                  </p>
                  <p className="print:text-sm">
                    <span className="font-medium">โทรศัพท์:</span>{" "}
                    {contract.tenant.phone}
                  </p>
                  {contract.tenant.idCard && (
                    <p className="print:text-sm">
                      <span className="font-medium">เลขบัตรประชาชน:</span>{" "}
                      {contract.tenant.idCard}
                    </p>
                  )}
                  <p className="print:text-sm">
                    <span className="font-medium">ที่อยู่:</span>{" "}
                    {contract.tenant.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8 print:mb-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 print:text-base print:pb-1 print:mb-2">
                💰 รายการค่าใช้จ่าย
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg overflow-hidden print:text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-4 font-semibold print:p-2">
                        รายการ
                      </th>
                      <th className="text-right p-4 font-semibold print:p-2">
                        จำนวนเงิน (บาท)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.deposit && contract.deposit > 0 && (
                      <tr className="border-t">
                        <td className="p-4 print:p-2">💰 เงินมัดจำ</td>
                        <td className="p-4 text-right print:p-2">
                          {formatNumber(contract.deposit)}
                        </td>
                      </tr>
                    )}
                    {contract.insurance && contract.insurance > 0 && (
                      <tr className="border-t">
                        <td className="p-4 print:p-2">🛡️ ค่าประกัน</td>
                        <td className="p-4 text-right print:p-2">
                          {formatNumber(contract.insurance)}
                        </td>
                      </tr>
                    )}
                    {/* Show message if no deposit or insurance */}
                    {totalAmount === 0 && (
                      <tr className="border-t">
                        <td
                          className="p-4 text-center text-gray-500 print:p-2"
                          colSpan={2}
                        >
                          ไม่มีเงินมัดจำหรือค่าประกันในสัญญานี้
                        </td>
                      </tr>
                    )}
                    {/* Show total only if there are deposit or insurance */}
                    {totalAmount > 0 && (
                      <tr className="border-t-2 border-gray-400 bg-blue-50">
                        <td className="p-4 font-bold text-lg print:p-2 print:text-base">
                          รวมเป็นเงิน
                        </td>
                        <td className="p-4 text-right font-bold text-lg text-blue-700 print:p-2 print:text-base">
                          {formatNumber(totalAmount)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {contract.room.dormitory.owner.promptpay && (
              <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6 print:mb-4 print:p-3">
                <h3 className="text-lg font-semibold text-green-800 mb-3 print:text-base print:mb-2">
                  💳 ช่องทางการชำระเงิน
                </h3>
                <div className="flex items-center gap-3 print:gap-2">
                  <span className="text-2xl print:text-lg">💰</span>
                  <p className="font-medium print:text-sm">
                    PromptPay - {contract.room.dormitory.owner.name}:{" "}
                    <span className="text-green-700 font-mono">
                      {contract.room.dormitory.owner.promptpay}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="text-center text-gray-500 text-sm pt-6 border-t print:pt-3 print:text-xs">
              <p>
                วันที่พิมพ์:{" "}
                {new Date().toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
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

export default function ContractReceiptPage() {
  return (
    <ProtectedRoute>
      <ContractReceiptContent />
    </ProtectedRoute>
  );
}
