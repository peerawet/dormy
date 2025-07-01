"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function ContractPreviewPage() {
  const params = useParams();
  const contractId = params.contractId;
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
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

  function handleDoubleClick(field: string, currentValue: string) {
    setEditMode(field);
    setEditValue(currentValue || "");
  }

  function handleEditSave(field: string) {
    // Update the contract data locally
    const fieldParts = field.split(".");
    let updatedContract = { ...contract };

    if (fieldParts.length === 1) {
      updatedContract[fieldParts[0]] = editValue;
    } else if (fieldParts.length === 2) {
      updatedContract[fieldParts[0]] = {
        ...updatedContract[fieldParts[0]],
        [fieldParts[1]]: editValue,
      };
    } else if (fieldParts.length === 3) {
      updatedContract[fieldParts[0]][fieldParts[1]] = {
        ...updatedContract[fieldParts[0]][fieldParts[1]],
        [fieldParts[2]]: editValue,
      };
    }

    setContract(updatedContract);
    setEditMode(null);
    setEditValue("");
  }

  function handleEditCancel() {
    setEditMode(null);
    setEditValue("");
  }

  function renderSectionHeader(title: string, icon: string) {
    return (
      <div className="mb-6 print:mb-4">
        <div className="ml-4 mb-3 print:mb-2">
          <span className="text-gray-700 font-semibold print:text-base">
            {icon} {title}
          </span>
        </div>
        <div className="h-px bg-gradient-to-r from-gray-400 via-gray-300 to-transparent"></div>
      </div>
    );
  }

  function renderEditableField(
    label: string,
    value: string,
    field: string,
    className: string = ""
  ) {
    const isEditing = editMode === field;

    return (
      <p className={`print:text-sm ${className}`}>
        <span className="font-medium">{label}:</span>{" "}
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleEditSave(field)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEditSave(field);
              if (e.key === "Escape") handleEditCancel();
            }}
            className="border-b border-dotted border-gray-400 px-2 py-1 bg-transparent focus:outline-none focus:border-blue-500"
            autoFocus
          />
        ) : (
          <span
            className="border-b border-dotted border-gray-400 px-2 py-1 cursor-pointer hover:bg-gray-100 print:hover:bg-transparent"
            onDoubleClick={() => handleDoubleClick(field, value)}
          >
            {value || "_______________"}
          </span>
        )}
      </p>
    );
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
        <div className="bg-white shadow-xl rounded-lg overflow-hidden print:shadow-none print:rounded-none">
          <div className="bg-blue-600 text-white p-6 text-center print:p-4">
            <h1 className="text-3xl font-bold print:text-xl">
              สัญญาเช่าห้องพัก
            </h1>
          </div>

          <div className="p-8 print:p-4">
            {/* Contract Details */}
            <div className="mb-8 print:mb-4">
              <div className="grid grid-cols-1 gap-4 print:gap-2">
                <div className="text-center">
                  {renderEditableField(
                    "สัญญาเลขที่",
                    contract.id?.toString(),
                    "id"
                  )}
                </div>
                <div className="text-center">
                  {renderEditableField(
                    "เขียนที่",
                    room.dormitory?.name,
                    "room.dormitory.name"
                  )}
                </div>
                <div className="text-center">
                  <p className="print:text-sm">
                    <span className="font-medium">วันที่</span>{" "}
                    <span
                      className="border-b border-dotted border-gray-400 px-2 py-1 cursor-pointer hover:bg-gray-100 print:hover:bg-transparent"
                      onDoubleClick={() =>
                        handleDoubleClick(
                          "contractDate.day",
                          new Date().getDate().toString()
                        )
                      }
                    >
                      {editMode === "contractDate.day" ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleEditSave("contractDate.day")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleEditSave("contractDate.day");
                            if (e.key === "Escape") handleEditCancel();
                          }}
                          className="border-b border-dotted border-gray-400 px-2 py-1 bg-transparent focus:outline-none focus:border-blue-500 w-12"
                          autoFocus
                        />
                      ) : (
                        new Date().getDate()
                      )}
                    </span>{" "}
                    <span className="font-medium">เดือน</span>{" "}
                    <span
                      className="border-b border-dotted border-gray-400 px-2 py-1 cursor-pointer hover:bg-gray-100 print:hover:bg-transparent"
                      onDoubleClick={() =>
                        handleDoubleClick(
                          "contractDate.month",
                          new Date().toLocaleDateString("th-TH", {
                            month: "long",
                          })
                        )
                      }
                    >
                      {editMode === "contractDate.month" ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleEditSave("contractDate.month")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleEditSave("contractDate.month");
                            if (e.key === "Escape") handleEditCancel();
                          }}
                          className="border-b border-dotted border-gray-400 px-2 py-1 bg-transparent focus:outline-none focus:border-blue-500 w-20"
                          autoFocus
                        />
                      ) : (
                        new Date().toLocaleDateString("th-TH", {
                          month: "long",
                        })
                      )}
                    </span>{" "}
                    <span className="font-medium">ปี พ.ศ.</span>{" "}
                    <span
                      className="border-b border-dotted border-gray-400 px-2 py-1 cursor-pointer hover:bg-gray-100 print:hover:bg-transparent"
                      onDoubleClick={() =>
                        handleDoubleClick(
                          "contractDate.year",
                          (new Date().getFullYear() + 543).toString()
                        )
                      }
                    >
                      {editMode === "contractDate.year" ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleEditSave("contractDate.year")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleEditSave("contractDate.year");
                            if (e.key === "Escape") handleEditCancel();
                          }}
                          className="border-b border-dotted border-gray-400 px-2 py-1 bg-transparent focus:outline-none focus:border-blue-500 w-16"
                          autoFocus
                        />
                      ) : (
                        new Date().getFullYear() + 543
                      )}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Room Info */}
            <div className="mb-12 print:mb-6">
              {renderSectionHeader("ข้อมูลห้องพัก", "🏠")}
              <div className="grid grid-cols-2 gap-4 print:gap-2">
                {renderEditableField(
                  "หอพัก",
                  room.dormitory?.name,
                  "room.dormitory.name"
                )}
                {renderEditableField("ชื่อห้อง", room.name, "room.name")}
              </div>
              <div className="mt-4 print:mt-2">
                {renderEditableField(
                  "ที่อยู่หอพัก",
                  room.dormitory?.address,
                  "room.dormitory.address"
                )}
              </div>
            </div>

            {/* Owner Info */}
            <div className="mb-12 print:mb-6">
              {renderSectionHeader("ข้อมูลผู้ให้เช่า", "👤")}
              <div className="grid grid-cols-2 gap-4 print:gap-2">
                {renderEditableField(
                  "ชื่อ",
                  room.dormitory?.owner?.name,
                  "dormitory.owner.name"
                )}
                {renderEditableField(
                  "เบอร์โทรศัพท์",
                  room.dormitory?.owner?.phone,
                  "dormitory.owner.phone"
                )}
                {renderEditableField(
                  "เลขบัตรประชาชน",
                  room.dormitory?.owner?.idCard,
                  "dormitory.owner.idCard"
                )}
                {renderEditableField(
                  "ที่อยู่",
                  room.dormitory?.owner?.address,
                  "dormitory.owner.address"
                )}
              </div>
            </div>

            {/* Tenant Info */}
            <div className="mb-12 print:mb-6">
              {renderSectionHeader("ข้อมูลผู้เช่า", "🏃")}
              <div className="grid grid-cols-2 gap-4 print:gap-2">
                {renderEditableField("ชื่อ", tenant?.name, "tenant.name")}
                {renderEditableField(
                  "เบอร์โทรศัพท์",
                  tenant?.phone,
                  "tenant.phone"
                )}
                {renderEditableField(
                  "เลขบัตรประชาชน",
                  tenant?.idCard,
                  "tenant.idCard"
                )}
                {renderEditableField(
                  "ที่อยู่",
                  tenant?.address,
                  "tenant.address"
                )}
              </div>
            </div>

            {/* Contract Info */}
            <div className="mb-12 print:mb-6">
              {renderSectionHeader("ข้อมูลสัญญา", "📋")}
              <div className="grid grid-cols-2 gap-4 print:gap-2">
                {renderEditableField(
                  "วันที่เริ่มสัญญา",
                  new Date(contract.startDate).toLocaleDateString("th-TH"),
                  "startDate"
                )}
                {renderEditableField(
                  "วันที่สิ้นสุดสัญญา",
                  new Date(contract.endDate).toLocaleDateString("th-TH"),
                  "endDate"
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-12 print:mb-6">
              {renderSectionHeader("ค่าใช้จ่าย", "💰")}
              <div className="grid grid-cols-2 gap-4 print:gap-2">
                {renderEditableField(
                  "🏠 ค่าเช่าห้อง",
                  `${room.price?.toLocaleString() || "0"} บาท/เดือน`,
                  "room.price"
                )}
                {room.waterFlat &&
                  room.waterFlat > 0 &&
                  renderEditableField(
                    "💧 ค่าน้ำ (รายเดือน)",
                    `${room.waterFlat?.toLocaleString() || "0"} บาท`,
                    "room.waterFlat"
                  )}
                {room.waterRate &&
                  room.waterRate > 0 &&
                  renderEditableField(
                    "💧 ค่าน้ำ (ต่อหน่วย)",
                    `${room.waterRate?.toLocaleString() || "0"} บาท/หน่วย`,
                    "room.waterRate"
                  )}
                {room.electricFlat &&
                  room.electricFlat > 0 &&
                  renderEditableField(
                    "⚡ ค่าไฟ (รายเดือน)",
                    `${room.electricFlat?.toLocaleString() || "0"} บาท`,
                    "room.electricFlat"
                  )}
                {room.electricRate &&
                  room.electricRate > 0 &&
                  renderEditableField(
                    "⚡ ค่าไฟ (ต่อหน่วย)",
                    `${room.electricRate?.toLocaleString() || "0"} บาท/หน่วย`,
                    "room.electricRate"
                  )}
                {room.commonFee &&
                  room.commonFee > 0 &&
                  renderEditableField(
                    "🏢 ค่าส่วนกลาง",
                    `${room.commonFee?.toLocaleString() || "0"} บาท/เดือน`,
                    "room.commonFee"
                  )}
                {room.otherFee &&
                  room.otherFee > 0 &&
                  renderEditableField(
                    "📦 ค่าใช้จ่ายอื่นๆ",
                    `${room.otherFee?.toLocaleString() || "0"} บาท/เดือน`,
                    "room.otherFee"
                  )}
              </div>
            </div>

            {/* Signature */}
            <div className="relative mt-8 print:mt-4">
              <div className="flex items-center justify-center mb-6 print:mb-4">
                <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
                <div className="px-4 bg-white">
                  <span className="text-gray-600 font-medium print:text-sm">
                    ✍️ ลายมือชื่อ
                  </span>
                </div>
                <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
              </div>

              <div className="grid grid-cols-4 gap-4 print:gap-2">
                <div className="text-center">
                  <div className="mb-10 print:mb-8">
                    <span className="text-gray-600 print:text-sm font-medium">
                      ผู้ให้เช่า:
                    </span>
                  </div>
                  <div className="border-b border-gray-400 w-32 mx-auto mb-3 print:w-24 print:mb-2"></div>
                  <div className="text-xs text-gray-600 print:text-xs">
                    (
                    <span
                      className="border-b border-dotted border-gray-400 px-1 cursor-pointer hover:bg-gray-100 print:hover:bg-transparent"
                      onDoubleClick={() =>
                        handleDoubleClick(
                          "signature.lessor",
                          room.dormitory?.owner?.name || ""
                        )
                      }
                    >
                      {editMode === "signature.lessor" ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleEditSave("signature.lessor")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleEditSave("signature.lessor");
                            if (e.key === "Escape") handleEditCancel();
                          }}
                          className="border-none bg-transparent focus:outline-none text-xs"
                          autoFocus
                        />
                      ) : (
                        room.dormitory?.owner?.name || "_______________"
                      )}
                    </span>
                    )
                  </div>
                </div>

                <div className="text-center">
                  <div className="mb-10 print:mb-8">
                    <span className="text-gray-600 print:text-sm font-medium">
                      ผู้เช่า:
                    </span>
                  </div>
                  <div className="border-b border-gray-400 w-32 mx-auto mb-3 print:w-24 print:mb-2"></div>
                  <div className="text-xs text-gray-600 print:text-xs">
                    (
                    <span
                      className="border-b border-dotted border-gray-400 px-1 cursor-pointer hover:bg-gray-100 print:hover:bg-transparent"
                      onDoubleClick={() =>
                        handleDoubleClick(
                          "signature.lessee",
                          tenant?.name || ""
                        )
                      }
                    >
                      {editMode === "signature.lessee" ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleEditSave("signature.lessee")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleEditSave("signature.lessee");
                            if (e.key === "Escape") handleEditCancel();
                          }}
                          className="border-none bg-transparent focus:outline-none text-xs"
                          autoFocus
                        />
                      ) : (
                        tenant?.name || "_______________"
                      )}
                    </span>
                    )
                  </div>
                </div>

                <div className="text-center">
                  <div className="mb-10 print:mb-8">
                    <span className="text-gray-600 print:text-sm font-medium">
                      พยาน 1:
                    </span>
                  </div>
                  <div className="border-b border-gray-400 w-32 mx-auto mb-3 print:w-24 print:mb-2"></div>
                  <div className="text-xs text-gray-600 print:text-xs">
                    (
                    <span
                      className="border-b border-dotted border-gray-400 px-1 cursor-pointer hover:bg-gray-100 print:hover:bg-transparent"
                      onDoubleClick={() =>
                        handleDoubleClick("signature.witness1", "")
                      }
                    >
                      {editMode === "signature.witness1" ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleEditSave("signature.witness1")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleEditSave("signature.witness1");
                            if (e.key === "Escape") handleEditCancel();
                          }}
                          className="border-none bg-transparent focus:outline-none text-xs"
                          autoFocus
                        />
                      ) : (
                        "_______________"
                      )}
                    </span>
                    )
                  </div>
                </div>

                <div className="text-center">
                  <div className="mb-10 print:mb-8">
                    <span className="text-gray-600 print:text-sm font-medium">
                      พยาน 2:
                    </span>
                  </div>
                  <div className="border-b border-gray-400 w-32 mx-auto mb-3 print:w-24 print:mb-2"></div>
                  <div className="text-xs text-gray-600 print:text-xs">
                    (
                    <span
                      className="border-b border-dotted border-gray-400 px-1 cursor-pointer hover:bg-gray-100 print:hover:bg-transparent"
                      onDoubleClick={() =>
                        handleDoubleClick("signature.witness2", "")
                      }
                    >
                      {editMode === "signature.witness2" ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleEditSave("signature.witness2")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleEditSave("signature.witness2");
                            if (e.key === "Escape") handleEditCancel();
                          }}
                          className="border-none bg-transparent focus:outline-none text-xs"
                          autoFocus
                        />
                      ) : (
                        "_______________"
                      )}
                    </span>
                    )
                  </div>
                </div>
              </div>
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
