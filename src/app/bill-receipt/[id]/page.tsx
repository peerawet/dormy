"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ProtectedRoute from "@/app/components/ProtectedRoute";

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
    window.print();
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

        <div className="bg-white shadow-xl rounded-lg overflow-hidden print:shadow-none print:rounded-none">
          <div className="bg-blue-600 text-white p-6 text-center print:p-4">
            <h1 className="text-3xl font-bold print:text-xl">ใบเสร็จรับเงิน</h1>
          </div>

          <div className="p-8 print:p-4">
            <div className="text-center mb-8 print:mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 print:text-lg print:mb-1">
                {bill.room.dormitory.name}
              </h2>
              <p className="text-gray-600 mb-1 print:text-sm print:mb-0">
                {bill.room.dormitory.address}
              </p>
              <p className="text-gray-600 print:text-sm">
                โทรศัพท์: {bill.room.dormitory.owner.phone}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:gap-4 print:mb-4">
              <div className="space-y-3 print:space-y-2">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 print:text-base print:pb-1">
                  📋 ข้อมูลใบเสร็จ
                </h3>
                <div className="space-y-2 print:space-y-1">
                  <p className="print:text-sm">
                    <span className="font-medium">เลขที่ใบเสร็จ:</span>{" "}
                    {bill.id.toString().padStart(6, "0")}
                  </p>
                  <p className="print:text-sm">
                    <span className="font-medium">วันที่:</span>{" "}
                    {formatDate(bill.billDate)}
                  </p>
                  <p className="print:text-sm">
                    <span className="font-medium">ห้อง:</span> {bill.room.name}
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
                    {bill.tenant.name}
                  </p>
                  <p className="print:text-sm">
                    <span className="font-medium">โทรศัพท์:</span>{" "}
                    {bill.tenant.phone}
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
                    <tr className="border-t">
                      <td className="p-4 print:p-2">🏠 ค่าเช่าห้อง</td>
                      <td className="p-4 text-right print:p-2">
                        {formatNumber(bill.rent)}
                      </td>
                    </tr>
                    {bill.water > 0 && (
                      <tr className="border-t">
                        <td className="p-4 print:p-2">
                          💧 ค่าน้ำประปา
                          {bill.meterWaterStart !== null &&
                            bill.meterWaterEnd !== null && (
                              <span className="text-sm text-gray-600 print:text-xs">
                                {" "}
                                ({formatNumber(bill.meterWaterStart)} -{" "}
                                {formatNumber(bill.meterWaterEnd)} ={" "}
                                {formatNumber(waterUnits!)} หน่วย)
                              </span>
                            )}
                        </td>
                        <td className="p-4 text-right print:p-2">
                          {formatNumber(bill.water)}
                        </td>
                      </tr>
                    )}
                    {bill.electric > 0 && (
                      <tr className="border-t">
                        <td className="p-4 print:p-2">
                          ⚡ ค่าไฟฟ้า
                          {bill.meterElectricStart !== null &&
                            bill.meterElectricEnd !== null && (
                              <span className="text-sm text-gray-600 print:text-xs">
                                {" "}
                                ({formatNumber(bill.meterElectricStart)} -{" "}
                                {formatNumber(bill.meterElectricEnd)} ={" "}
                                {formatNumber(electricUnits!)} หน่วย)
                              </span>
                            )}
                        </td>
                        <td className="p-4 text-right print:p-2">
                          {formatNumber(bill.electric)}
                        </td>
                      </tr>
                    )}
                    {bill.common > 0 && (
                      <tr className="border-t">
                        <td className="p-4 print:p-2">🏢 ค่าส่วนกลาง</td>
                        <td className="p-4 text-right print:p-2">
                          {formatNumber(bill.common)}
                        </td>
                      </tr>
                    )}
                    {bill.other > 0 && (
                      <tr className="border-t">
                        <td className="p-4 print:p-2">📦 อื่นๆ</td>
                        <td className="p-4 text-right print:p-2">
                          {formatNumber(bill.other)}
                        </td>
                      </tr>
                    )}
                    {bill.discount > 0 && (
                      <tr className="border-t">
                        <td className="p-4 text-green-600 print:p-2">
                          🎁 ส่วนลด
                        </td>
                        <td className="p-4 text-right text-green-600 print:p-2">
                          -{formatNumber(bill.discount)}
                        </td>
                      </tr>
                    )}
                    <tr className="border-t-2 border-gray-400 bg-blue-50">
                      <td className="p-4 font-bold text-lg print:p-2 print:text-base">
                        รวมเป็นเงิน
                      </td>
                      <td className="p-4 text-right font-bold text-lg text-blue-700 print:p-2 print:text-base">
                        {formatNumber(bill.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {bill.room.dormitory.owner.promptpay && (
              <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6 print:mb-4 print:p-3">
                <h3 className="text-lg font-semibold text-green-800 mb-3 print:text-base print:mb-2">
                  💳 ช่องทางการชำระเงิน
                </h3>
                <div className="flex items-center gap-3 print:gap-2">
                  <span className="text-2xl print:text-lg">💰</span>
                  <p className="font-medium print:text-sm">
                    PromptPay - {bill.room.dormitory.owner.name}:{" "}
                    <span className="text-green-700 font-mono">
                      {bill.room.dormitory.owner.promptpay}
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

export default function BillReceiptPage() {
  return (
    <ProtectedRoute>
      <BillReceiptContent />
    </ProtectedRoute>
  );
}
