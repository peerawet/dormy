"use client";
import { useState } from "react";

interface TenantCardProps {
  tenant: {
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
  };
  onEdit: () => void;
  onDelete: () => void;
  onRegenerateLinkCode?: (tenantId: number) => Promise<string | null>;
}

export default function TenantCard({
  tenant,
  onEdit,
  onDelete,
  onRegenerateLinkCode,
}: TenantCardProps) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleCopyLinkCode = async () => {
    if (tenant.linkCode) {
      await navigator.clipboard.writeText(tenant.linkCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerateLinkCode = async () => {
    if (!onRegenerateLinkCode) return;
    if (!confirm("คุณต้องการสร้างรหัสเชื่อมต่อใหม่หรือไม่?\n\nรหัสเดิมจะใช้งานไม่ได้อีกต่อไป")) {
      return;
    }
    setRegenerating(true);
    await onRegenerateLinkCode(tenant.id);
    setRegenerating(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {tenant.name?.charAt(0) || "?"}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{tenant.name}</h4>
            <p className="text-sm text-gray-500">{tenant.phone}</p>
          </div>
        </div>
      </div>

      {/* Tenant Details */}
      <div className="space-y-2 mb-4">
        {tenant.idCard && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">บัตรประชาชน:</span>
            <span className="font-medium">{tenant.idCard}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">ที่อยู่:</span>
          <span
            className="font-medium text-right max-w-[60%] truncate"
            title={tenant.address}
          >
            {tenant.address}
          </span>
        </div>
      </div>

      {/* Link Code */}
      {tenant.linkCode && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-green-700 mb-1">🔗 Link Code</div>
              <code className="text-xs font-mono bg-white px-2 py-1 rounded border border-green-200 block truncate" title={tenant.linkCode}>
                {tenant.linkCode}
              </code>
            </div>
            <div className="flex gap-1">
              <button
                onClick={handleCopyLinkCode}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
                title="คัดลอกรหัส"
              >
                {copied ? "✓" : "📋"}
              </button>
              {onRegenerateLinkCode && (
                <button
                  onClick={handleRegenerateLinkCode}
                  disabled={regenerating}
                  className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs hover:bg-orange-200 disabled:opacity-50"
                  title="สร้างรหัสใหม่"
                >
                  {regenerating ? "⏳" : "🔄"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rooms */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">ห้องที่เช่า:</div>
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
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors flex items-center justify-center gap-1"
          onClick={onEdit}
        >
          ✏️ แก้ไข
        </button>
        <button
          className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
          onClick={onDelete}
        >
          🗑️ ลบ
        </button>
      </div>
    </div>
  );
}
