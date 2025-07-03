"use client";

interface BillReceiptDisplayProps {
  bill: any;
}

export default function BillReceiptDisplay({ bill }: BillReceiptDisplayProps) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const formatNumber = (num: number) => num.toLocaleString("th-TH");

  const waterUnits =
    bill.meterWaterEnd && bill.meterWaterStart
      ? bill.meterWaterEnd - bill.meterWaterStart
      : null;
  const electricUnits =
    bill.meterElectricEnd && bill.meterElectricStart
      ? bill.meterElectricEnd - bill.meterElectricStart
      : null;

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden print:shadow-none print:rounded-none">
      <div className="bg-blue-600 text-white p-6 text-center print:p-4">
        <h1 className="text-3xl font-bold print:text-xl">ใบเสร็จรับเงิน</h1>
      </div>

      <div className="p-8 print:p-4">
        {/* Dormitory Header */}
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

        {/* Bill & Tenant Info */}
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
                <span className="font-medium">ชื่อ:</span> {bill.tenant.name}
              </p>
              <p className="print:text-sm">
                <span className="font-medium">โทรศัพท์:</span>{" "}
                {bill.tenant.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Charges Table */}
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
                      {waterUnits !== null && ` (${waterUnits} หน่วย)`}
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
                      {electricUnits !== null && ` (${electricUnits} หน่วย)`}
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
                    <td className="p-4 print:p-2">📦 ค่าใช้จ่ายอื่นๆ</td>
                    <td className="p-4 text-right print:p-2">
                      {formatNumber(bill.other)}
                    </td>
                  </tr>
                )}
                {bill.discount > 0 && (
                  <tr className="border-t">
                    <td className="p-4 print:p-2">💸 ส่วนลด</td>
                    <td className="p-4 text-right print:p-2">
                      -{formatNumber(bill.discount)}
                    </td>
                  </tr>
                )}
                {/* Total */}
                <tr className="border-t bg-gray-50">
                  <td className="p-4 font-semibold print:p-2">รวมทั้งหมด</td>
                  <td className="p-4 text-right font-semibold print:p-2">
                    {formatNumber(bill.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 print:mt-6">
          <p className="text-gray-600 print:text-sm">
            ขอขอบคุณที่ชำระเงินตรงเวลา 🙏
          </p>
          {bill.room.dormitory.owner.promptpay && (
            <p className="text-gray-600 print:text-sm">
              พร้อมเพย์: {bill.room.dormitory.owner.promptpay}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
