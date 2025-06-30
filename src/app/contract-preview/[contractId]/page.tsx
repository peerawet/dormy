"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import jsPDF from "jspdf";

export default function ContractPreviewPage() {
  const params = useParams();
  const contractId = params.contractId;
  const [contract, setContract] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (auth.token && contractId) {
      fetchContractData();
    }
  }, [auth.token, contractId]);

  async function fetchContractData() {
    try {
      // Fetch contract data
      const contractRes = await fetch(`/api/rental-contract/${contractId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const contractData = await contractRes.json();

      if (contractData.success) {
        setContract(contractData.contract);
        // ใช้ข้อมูล room ที่มากับ contract แล้ว
        setRoom(contractData.contract.room);
      }
    } catch (error) {
      console.error("Error fetching contract data:", error);
    } finally {
      setLoading(false);
    }
  }

  function exportToPDF() {
    if (!contract || !room) return;

    const pdf = new jsPDF();

    // เพิ่ม font สำหรับภาษาไทย
    pdf.setFont("helvetica", "normal");

    // หัวข้อสัญญา
    pdf.setFontSize(20);
    pdf.text("สัญญาเช่าห้องพัก", 105, 20, { align: "center" });

    // ข้อมูลสัญญา
    pdf.setFontSize(12);
    let yPos = 40;

    pdf.text(`หอพัก: ${room?.dormitory?.name || "N/A"}`, 20, yPos);
    yPos += 10;
    pdf.text(`ชื่อห้อง: ${room?.name || "N/A"}`, 20, yPos);
    yPos += 10;
    pdf.text(`ที่อยู่หอพัก: ${room?.dormitory?.address || "N/A"}`, 20, yPos);
    yPos += 20;

    // ข้อมูลผู้ให้เช่า
    pdf.text("ข้อมูลผู้ให้เช่า:", 20, yPos);
    yPos += 10;
    pdf.text(`ชื่อ: ${room?.dormitory?.owner?.name || "-"}`, 20, yPos);
    yPos += 10;
    pdf.text(
      `เลขบัตรประชาชน: ${room?.dormitory?.owner?.idCard || "-"}`,
      20,
      yPos
    );
    yPos += 10;
    pdf.text(
      `เบอร์โทรศัพท์: ${room?.dormitory?.owner?.phone || "-"}`,
      20,
      yPos
    );
    yPos += 10;
    pdf.text(`ที่อยู่: ${room?.dormitory?.owner?.address || "-"}`, 20, yPos);
    yPos += 20;

    // ข้อมูลผู้เช่า
    pdf.text("ข้อมูลผู้เช่า:", 20, yPos);
    yPos += 10;
    pdf.text(`ชื่อ: ${contract.tenantName}`, 20, yPos);
    yPos += 10;
    pdf.text(`เลขบัตรประชาชน: ${contract.tenantIdCard || "-"}`, 20, yPos);
    yPos += 10;
    pdf.text(`เบอร์โทรศัพท์: ${contract.tenantPhone}`, 20, yPos);
    yPos += 10;
    pdf.text(`ที่อยู่: ${contract.tenantAddress}`, 20, yPos);
    yPos += 20;

    // ข้อมูลสัญญา
    pdf.text("ข้อมูลสัญญา:", 20, yPos);
    yPos += 10;
    pdf.text(
      `วันที่เริ่มสัญญา: ${new Date(contract.startDate).toLocaleDateString(
        "th-TH"
      )}`,
      20,
      yPos
    );
    yPos += 10;
    pdf.text(
      `วันที่สิ้นสุดสัญญา: ${new Date(contract.endDate).toLocaleDateString(
        "th-TH"
      )}`,
      20,
      yPos
    );
    yPos += 20;

    // ค่าใช้จ่าย
    if (room) {
      pdf.text("ค่าใช้จ่าย:", 20, yPos);
      yPos += 10;
      pdf.text(
        `ค่าเช่าห้อง: ${room.price?.toLocaleString() || "0"} บาท/เดือน`,
        20,
        yPos
      );
      yPos += 10;
      if (room.waterFlat && room.waterFlat > 0) {
        pdf.text(
          `ค่าน้ำ (รายเดือน): ${room.waterFlat?.toLocaleString() || "0"} บาท`,
          20,
          yPos
        );
        yPos += 10;
      }
      if (room.waterRate && room.waterRate > 0) {
        pdf.text(
          `ค่าน้ำ (ต่อหน่วย): ${
            room.waterRate?.toLocaleString() || "0"
          } บาท/หน่วย`,
          20,
          yPos
        );
        yPos += 10;
      }
      if (room.electricFlat && room.electricFlat > 0) {
        pdf.text(
          `ค่าไฟ (รายเดือน): ${room.electricFlat?.toLocaleString() || "0"} บาท`,
          20,
          yPos
        );
        yPos += 10;
      }
      if (room.electricRate && room.electricRate > 0) {
        pdf.text(
          `ค่าไฟ (ต่อหน่วย): ${
            room.electricRate?.toLocaleString() || "0"
          } บาท/หน่วย`,
          20,
          yPos
        );
        yPos += 10;
      }
      if (room.commonFee && room.commonFee > 0) {
        pdf.text(
          `ค่าส่วนกลาง: ${room.commonFee?.toLocaleString() || "0"} บาท/เดือน`,
          20,
          yPos
        );
        yPos += 10;
      }
      if (room.otherFee && room.otherFee > 0) {
        pdf.text(
          `ค่าใช้จ่ายอื่นๆ: ${
            room.otherFee?.toLocaleString() || "0"
          } บาท/เดือน`,
          20,
          yPos
        );
        yPos += 10;
      }
    }

    yPos += 20;
    pdf.text("ผู้ให้เช่า: ____________________", 20, yPos);
    pdf.text("ผู้เช่า: ____________________", 120, yPos);

    yPos += 20;
    pdf.text(`วันที่: ${new Date().toLocaleDateString("th-TH")}`, 20, yPos);

    // ดาวน์โหลด PDF
    pdf.save(`สัญญาเช่า_${contract.tenantName}_${room?.id || "N/A"}.pdf`);
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

  if (!contract || !room) {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              📋 ตัวอย่างสัญญาเช่า
            </h1>
            <div className="flex gap-3">
              <button
                onClick={exportToPDF}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                📄 Export PDF
              </button>
              <button
                onClick={() => window.close()}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>

        {/* Contract Preview */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              สัญญาเช่าห้องพัก
            </h2>
          </div>

          {/* Room Info */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              ข้อมูลห้องพัก
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-600">หอพัก:</span>
                <span className="ml-2 text-gray-800">
                  {room.dormitory?.name}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">ชื่อห้อง:</span>
                <span className="ml-2 text-gray-800">{room.name}</span>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-600">ที่อยู่หอพัก:</span>
                <span className="ml-2 text-gray-800">
                  {room.dormitory?.address}
                </span>
              </div>
            </div>
          </div>

          {/* Owner Info */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              ข้อมูลผู้ให้เช่า
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-600">ชื่อ:</span>
                <span className="ml-2 text-gray-800">
                  {room.dormitory?.owner?.name || "-"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  เบอร์โทรศัพท์:
                </span>
                <span className="ml-2 text-gray-800">
                  {room.dormitory?.owner?.phone || "-"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  เลขบัตรประชาชน:
                </span>
                <span className="ml-2 text-gray-800">
                  {room.dormitory?.owner?.idCard || "-"}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-600">ที่อยู่:</span>
                <span className="ml-2 text-gray-800">
                  {room.dormitory?.owner?.address || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Tenant Info */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              ข้อมูลผู้เช่า
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-600">ชื่อ:</span>
                <span className="ml-2 text-gray-800">
                  {contract.tenantName}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  เบอร์โทรศัพท์:
                </span>
                <span className="ml-2 text-gray-800">
                  {contract.tenantPhone}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  เลขบัตรประชาชน:
                </span>
                <span className="ml-2 text-gray-800">
                  {contract.tenantIdCard || "-"}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-600">ที่อยู่:</span>
                <span className="ml-2 text-gray-800">
                  {contract.tenantAddress}
                </span>
              </div>
            </div>
          </div>

          {/* Contract Info */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              ข้อมูลสัญญา
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-600">
                  วันที่เริ่มสัญญา:
                </span>
                <span className="ml-2 text-gray-800">
                  {new Date(contract.startDate).toLocaleDateString("th-TH")}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  วันที่สิ้นสุดสัญญา:
                </span>
                <span className="ml-2 text-gray-800">
                  {new Date(contract.endDate).toLocaleDateString("th-TH")}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              ค่าใช้จ่าย
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-600">ค่าเช่าห้อง:</span>
                <span className="ml-2 text-gray-800">
                  {room.price?.toLocaleString() || "0"} บาท/เดือน
                </span>
              </div>
              {room.waterFlat && room.waterFlat > 0 && (
                <div>
                  <span className="font-medium text-gray-600">
                    ค่าน้ำ (รายเดือน):
                  </span>
                  <span className="ml-2 text-gray-800">
                    {room.waterFlat?.toLocaleString() || "0"} บาท
                  </span>
                </div>
              )}
              {room.waterRate && room.waterRate > 0 && (
                <div>
                  <span className="font-medium text-gray-600">
                    ค่าน้ำ (ต่อหน่วย):
                  </span>
                  <span className="ml-2 text-gray-800">
                    {room.waterRate?.toLocaleString() || "0"} บาท/หน่วย
                  </span>
                </div>
              )}
              {room.electricFlat && room.electricFlat > 0 && (
                <div>
                  <span className="font-medium text-gray-600">
                    ค่าไฟ (รายเดือน):
                  </span>
                  <span className="ml-2 text-gray-800">
                    {room.electricFlat?.toLocaleString() || "0"} บาท
                  </span>
                </div>
              )}
              {room.electricRate && room.electricRate > 0 && (
                <div>
                  <span className="font-medium text-gray-600">
                    ค่าไฟ (ต่อหน่วย):
                  </span>
                  <span className="ml-2 text-gray-800">
                    {room.electricRate?.toLocaleString() || "0"} บาท/หน่วย
                  </span>
                </div>
              )}
              {room.commonFee && room.commonFee > 0 && (
                <div>
                  <span className="font-medium text-gray-600">
                    ค่าส่วนกลาง:
                  </span>
                  <span className="ml-2 text-gray-800">
                    {room.commonFee?.toLocaleString() || "0"} บาท/เดือน
                  </span>
                </div>
              )}
              {room.otherFee && room.otherFee > 0 && (
                <div>
                  <span className="font-medium text-gray-600">
                    ค่าใช้จ่ายอื่นๆ:
                  </span>
                  <span className="ml-2 text-gray-800">
                    {room.otherFee?.toLocaleString() || "0"} บาท/เดือน
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Signature */}
          <div className="mt-12 grid grid-cols-2 gap-8 text-center">
            <div>
              <div className="border-b border-gray-400 pb-2 mb-2 mx-8"></div>
              <p className="text-gray-600">ผู้ให้เช่า</p>
            </div>
            <div>
              <div className="border-b border-gray-400 pb-2 mb-2 mx-8"></div>
              <p className="text-gray-600">ผู้เช่า</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              วันที่: {new Date().toLocaleDateString("th-TH")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
