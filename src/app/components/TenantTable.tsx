"use client";
import { useState } from "react";

interface TenantTableProps {
  tenants: {
    id: number;
    name: string;
    phone: string;
    idCard?: string;
    address: string;
    linkCode?: string;
    rooms: {
      room: {
        id: number;
        name: string;
        dormitory: {
          id: number;
          name: string;
        };
      };
    }[];
  }[];
  onEdit: (tenant: TenantTableProps["tenants"][0]) => void;
  onDelete: (tenant: TenantTableProps["tenants"][0]) => void;
  onRegenerateLinkCode?: (tenantId: number) => Promise<string | null>;
}

export default function TenantTable({
  tenants,
  onEdit,
  onDelete,
  onRegenerateLinkCode,
}: TenantTableProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);

  const handleCopyLinkCode = async (tenantId: number, linkCode: string) => {
    await navigator.clipboard.writeText(linkCode);
    setCopiedId(tenantId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerateLinkCode = async (tenantId: number) => {
    if (!onRegenerateLinkCode) return;
    if (!confirm("คุณต้องการสร้างรหัสเชื่อมต่อใหม่หรือไม่?\n\nรหัสเดิมจะใช้งานไม่ได้อีกต่อไป")) {
      return;
    }
    setRegeneratingId(tenantId);
    await onRegenerateLinkCode(tenantId);
    setRegeneratingId(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-left border border-blue-100 rounded-xl overflow-hidden text-sm">
        <thead>
          <tr className="bg-blue-100 text-blue-900">
            <th className="p-3 font-semibold whitespace-nowrap">ชื่อ</th>
            <th className="p-3 font-semibold whitespace-nowrap">เบอร์โทร</th>
            <th className="p-3 font-semibold whitespace-nowrap">
              เลขบัตรประชาชน
            </th>
            <th className="p-3 font-semibold whitespace-nowrap">ห้องที่เช่า</th>
            <th className="p-3 font-semibold whitespace-nowrap">🔗 Link Code</th>
            <th className="p-3 font-semibold whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant, i) => (
            <tr
              key={tenant.id}
              className={
                "border-t border-blue-100 hover:bg-blue-50 transition-colors " +
                (i % 2 === 0 ? "bg-white" : "bg-blue-25")
              }
            >
              <td className="p-3 whitespace-nowrap font-medium">
                {tenant.name}
              </td>
              <td className="p-3 whitespace-nowrap">{tenant.phone}</td>
              <td className="p-3 whitespace-nowrap">{tenant.idCard || "-"}</td>
              <td className="p-3">
                <div className="flex flex-wrap gap-1">
                  {tenant.rooms.map((tr, index) => (
                    <span
                      key={index}
                      className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium"
                    >
                      {tr.room.dormitory.name} - {tr.room.name}
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-3">
                {tenant.linkCode ? (
                  <div className="flex items-center gap-1">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono max-w-[120px] truncate" title={tenant.linkCode}>
                      {tenant.linkCode.substring(0, 8)}...
                    </code>
                    <button
                      onClick={() => handleCopyLinkCode(tenant.id, tenant.linkCode!)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        copiedId === tenant.id
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                      title="คัดลอกรหัส"
                    >
                      {copiedId === tenant.id ? "✓" : "📋"}
                    </button>
                    {onRegenerateLinkCode && (
                      <button
                        onClick={() => handleRegenerateLinkCode(tenant.id)}
                        disabled={regeneratingId === tenant.id}
                        className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs hover:bg-orange-200 disabled:opacity-50"
                        title="สร้างรหัสใหม่"
                      >
                        {regeneratingId === tenant.id ? "⏳" : "🔄"}
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">-</span>
                )}
              </td>
              <td className="p-3 whitespace-nowrap">
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                    onClick={() => onEdit(tenant)}
                  >
                    ✏️ แก้ไข
                  </button>
                  <button
                    className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                    onClick={() => onDelete(tenant)}
                  >
                    🗑️ ลบ
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
