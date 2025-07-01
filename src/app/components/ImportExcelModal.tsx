"use client";
import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { createPortal } from "react-dom";

interface ImportExcelModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (bills: any[]) => void;
  loading?: boolean;
  tenants: { id: number; name: string; phone: string; address: string }[];
  roomId: string;
}

interface ParsedBill {
  billDate?: string;
  tenantName?: string;
  tenantId?: number;
  water?: number;
  electric?: number;
  common?: number;
  other?: number;
  rent?: number;
  discount?: number;
  total?: number;
  meterWaterStart?: number;
  meterWaterEnd?: number;
  meterElectricStart?: number;
  meterElectricEnd?: number;
  errors?: string[];
  rowIndex?: number;
}

export default function ImportExcelModal({
  open,
  onClose,
  onImport,
  loading = false,
  tenants,
  roomId,
}: ImportExcelModalProps) {
  const [excelData, setExcelData] = useState<ParsedBill[]>([]);
  const [isValidData, setIsValidData] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row and process data
        const rows = jsonData.slice(1) as any[][];
        const parsedBills = parseExcelData(rows);
        setExcelData(parsedBills);
        setIsValidData(
          parsedBills.every((bill) => !bill.errors || bill.errors.length === 0)
        );
      } catch (error) {
        console.error("Error reading Excel file:", error);
        alert("เกิดข้อผิดพลาดในการอ่านไฟล์ Excel");
      }
    };

    reader.readAsBinaryString(file);
  };

  const parseExcelData = (rows: any[][]): ParsedBill[] => {
    return rows
      .map((row, index) => {
        const bill: ParsedBill = {
          billDate: row[0] ? formatDate(row[0]) : "",
          tenantName: row[1] || "",
          water: parseFloat(row[2]) || 0,
          electric: parseFloat(row[3]) || 0,
          common: parseFloat(row[4]) || 0,
          other: parseFloat(row[5]) || 0,
          rent: parseFloat(row[6]) || 0,
          discount: parseFloat(row[7]) || 0,
          meterWaterStart: row[8] ? parseFloat(row[8]) : null,
          meterWaterEnd: row[9] ? parseFloat(row[9]) : null,
          meterElectricStart: row[10] ? parseFloat(row[10]) : null,
          meterElectricEnd: row[11] ? parseFloat(row[11]) : null,
          rowIndex: index + 2,
          errors: [],
        };

        validateBill(bill);
        return bill;
      })
      .filter((bill) => bill.tenantName);
  };

  const validateBill = (bill: ParsedBill) => {
    bill.errors = [];

    if (!bill.billDate) {
      bill.errors.push("วันที่บิลไม่ถูกต้อง");
    }

    if (!bill.tenantName) {
      bill.errors.push("ต้องระบุชื่อผู้เช่า");
    } else {
      const tenant = tenants.find(
        (t) =>
          t.name.toLowerCase().trim() === bill.tenantName?.toLowerCase().trim()
      );
      if (tenant) {
        bill.tenantId = tenant.id;
      } else {
        bill.errors.push(`ไม่พบผู้เช่าชื่อ "${bill.tenantName}"`);
      }
    }

    if (!bill.rent || bill.rent <= 0) {
      bill.errors.push("ค่าเช่าต้องมากกว่า 0");
    }

    bill.total =
      (bill.water || 0) +
      (bill.electric || 0) +
      (bill.common || 0) +
      (bill.other || 0) +
      (bill.rent || 0) -
      (bill.discount || 0);
  };

  const formatDate = (excelDate: any): string => {
    if (typeof excelDate === "number") {
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date.toISOString().split("T")[0];
    } else if (typeof excelDate === "string") {
      const date = new Date(excelDate);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
    }
    return "";
  };

  const handleImport = () => {
    const validBills = excelData.filter(
      (bill) => !bill.errors || bill.errors.length === 0
    );

    const billsToImport = validBills.map((bill) => ({
      billDate: bill.billDate,
      tenantId: bill.tenantId,
      water: bill.water || 0,
      electric: bill.electric || 0,
      common: bill.common || 0,
      other: bill.other || 0,
      rent: bill.rent || 0,
      discount: bill.discount || 0,
      total: bill.total || 0,
      meterWaterStart: bill.meterWaterStart,
      meterWaterEnd: bill.meterWaterEnd,
      meterElectricStart: bill.meterElectricStart,
      meterElectricEnd: bill.meterElectricEnd,
      roomId: Number(roomId),
    }));

    onImport(billsToImport);
  };

  const downloadTemplate = () => {
    const template = [
      [
        "วันที่บิล",
        "ชื่อผู้เช่า",
        "ค่าน้ำ",
        "ค่าไฟ",
        "ค่าส่วนกลาง",
        "ค่าอื่นๆ",
        "ค่าเช่า",
        "ส่วนลด",
        "มิเตอร์น้ำเริ่ม",
        "มิเตอร์น้ำสิ้น",
        "มิเตอร์ไฟเริ่ม",
        "มิเตอร์ไฟสิ้น",
      ],
      ["2024-01-01", "นาย ก", 300, 500, 100, 0, 5000, 0, 100, 120, 200, 250],
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "bill_import_template.xlsx");
  };

  if (!open) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      style={{ zIndex: 9999 }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-2xl">📊</span>
            Import บิลจาก Excel
          </h2>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                📁 เลือกไฟล์ Excel
              </button>
              <button
                onClick={downloadTemplate}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                📝 ดาวน์โหลด Template
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />

            {fileName && (
              <div className="p-3 bg-blue-50 rounded-lg text-blue-700">
                📄 ไฟล์: {fileName}
              </div>
            )}
          </div>

          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">
              💡 วิธีใช้งาน:
            </h4>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. ดาวน์โหลด Template Excel</li>
              <li>
                2. กรอกข้อมูลตาม Template (ชื่อผู้เช่าต้องตรงกับชื่อในระบบ)
              </li>
              <li>3. เลือกไฟล์ Excel ที่กรอกข้อมูลแล้ว</li>
              <li>4. ตรวจสอบข้อมูลใน Preview</li>
              <li>5. กด Import เพื่อนำเข้าข้อมูล</li>
            </ol>
          </div>

          {tenants.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">
                👥 ผู้เช่าในห้องนี้:
              </h4>
              <div className="flex flex-wrap gap-2">
                {tenants.map((tenant) => (
                  <span
                    key={tenant.id}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                  >
                    {tenant.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {excelData.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-4">
                📋 Preview ข้อมูล:
              </h4>
              <div className="overflow-x-auto max-h-96 border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">แถว</th>
                      <th className="p-2 text-left">วันที่</th>
                      <th className="p-2 text-left">ผู้เช่า</th>
                      <th className="p-2 text-right">ค่าน้ำ</th>
                      <th className="p-2 text-right">ค่าไฟ</th>
                      <th className="p-2 text-right">ค่าเช่า</th>
                      <th className="p-2 text-right">รวม</th>
                      <th className="p-2 text-left">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.map((bill, index) => (
                      <tr
                        key={index}
                        className={
                          bill.errors && bill.errors.length > 0
                            ? "bg-red-50"
                            : "bg-white"
                        }
                      >
                        <td className="p-2">{bill.rowIndex}</td>
                        <td className="p-2">{bill.billDate}</td>
                        <td className="p-2">{bill.tenantName}</td>
                        <td className="p-2 text-right">
                          {bill.water?.toLocaleString()}
                        </td>
                        <td className="p-2 text-right">
                          {bill.electric?.toLocaleString()}
                        </td>
                        <td className="p-2 text-right">
                          {bill.rent?.toLocaleString()}
                        </td>
                        <td className="p-2 text-right font-bold">
                          {bill.total?.toLocaleString()}
                        </td>
                        <td className="p-2">
                          {bill.errors && bill.errors.length > 0 ? (
                            <div className="text-red-600 text-xs">
                              {bill.errors.map((error, i) => (
                                <div key={i}>❌ {error}</div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-green-600 text-xs">
                              ✅ ถูกต้อง
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {excelData.length > 0 && (
              <>
                <span className="text-green-600">
                  ✅ ถูกต้อง:{" "}
                  {
                    excelData.filter((b) => !b.errors || b.errors.length === 0)
                      .length
                  }
                </span>
                {" | "}
                <span className="text-red-600">
                  ❌ ผิดพลาด:{" "}
                  {
                    excelData.filter((b) => b.errors && b.errors.length > 0)
                      .length
                  }
                </span>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleImport}
              disabled={!isValidData || excelData.length === 0 || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading
                ? "กำลัง Import..."
                : `Import ${
                    excelData.filter((b) => !b.errors || b.errors.length === 0)
                      .length
                  } รายการ`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ใช้ Portal เพื่อให้ modal แสดงนอกสุดของ DOM tree
  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
