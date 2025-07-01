"use client";
import { createPortal } from "react-dom";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  text: string;
}

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  text,
}: ConfirmDeleteModalProps) {
  if (!open) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-xl font-semibold text-gray-800">ยืนยันการลบ</h3>
          </div>
          <p className="text-gray-600 mb-6">{text}</p>
          <div className="flex gap-3 justify-end">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              onClick={onClose}
            >
              ยกเลิก
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              onClick={onConfirm}
            >
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
