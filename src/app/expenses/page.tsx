"use client";
import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import Navbar from "@/app/components/Navbar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";
import ExpenseCard from "@/app/components/ExpenseCard";
import ExpenseTable from "@/app/components/ExpenseTable";
import ExpenseModal from "@/app/components/ExpenseModal";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  fetchExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  clearError,
  clearExpenses,
  Expense,
  ExpenseFormData,
} from "@/store/expenseSlice";
import { fetchDorms } from "@/store/dormSlice";

export default function ExpensesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [viewMode, setViewMode] = useState<"table" | "card">(
    typeof window !== "undefined" && window.innerWidth < 768 ? "card" : "table"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDormId, setSelectedDormId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(
    new Date().getFullYear()
  );

  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const { expenses, stats, expensesByType, loading, submitting, error } =
    useSelector((state: RootState) => state.expense);
  const { dorms: dormitories } = useSelector((state: RootState) => state.dorm);

  // Expense types
  const expenseTypes = [
    { value: "water", label: "ค่าน้ำ", color: "blue", icon: "💧" },
    { value: "electric", label: "ค่าไฟ", color: "yellow", icon: "⚡" },
    { value: "maintenance", label: "ซ่อมบำรุง", color: "orange", icon: "🔧" },
    { value: "cleaning", label: "ทำความสะอาด", color: "green", icon: "🧹" },
    { value: "repair", label: "ซ่อมแซม", color: "red", icon: "🔨" },
    {
      value: "security",
      label: "รักษาความปลอดภัย",
      color: "purple",
      icon: "🛡️",
    },
    { value: "insurance", label: "ประกันภัย", color: "indigo", icon: "🛡️" },
    { value: "internet", label: "อินเทอร์เน็ต", color: "cyan", icon: "🌐" },

    {
      value: "furniture",
      label: "ของใช้เฟอร์นิเจอร์",
      color: "teal",
      icon: "🛋️",
    },
    { value: "tools", label: "เครื่องมือ", color: "lime", icon: "🛠️" },
    { value: "other", label: "อื่นๆ", color: "gray", icon: "📝" },
  ];

  // Month/Year Picker helpers
  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 3 + i);

  useEffect(() => {
    if (auth.token) {
      dispatch(fetchDorms(auth.token));
      dispatch(
        fetchExpenses({
          token: auth.token,
          ...(selectedDormId && { dormitoryId: selectedDormId }),
          ...(selectedType !== "all" && { type: selectedType }),
          ...(selectedMonth && { month: selectedMonth }),
          ...(selectedYear && { year: selectedYear }),
        })
      );
    }

    return () => {
      dispatch(clearExpenses());
    };
  }, [
    auth.token,
    dispatch,
    selectedDormId,
    selectedType,
    selectedMonth,
    selectedYear,
  ]);

  // Filter expenses based on search term
  const filteredExpenses = useMemo(() => {
    return expenses.filter(
      (expense) =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.dormitory.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (expense.room?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [expenses, searchTerm]);

  const handleOpenModal = (expense?: Expense) => {
    setEditExpense(expense || null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditExpense(null);
  };

  const showAlert = (message: string, type: "success" | "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertModalOpen(true);
  };

  const handleSubmit = async (formData: ExpenseFormData) => {
    try {
      if (editExpense) {
        await dispatch(
          updateExpense({ token: auth.token!, expenseData: formData })
        ).unwrap();
        showAlert("อัปเดตค่าใช้จ่ายสำเร็จ", "success");
      } else {
        await dispatch(
          addExpense({ token: auth.token!, expenseData: formData })
        ).unwrap();
        showAlert("เพิ่มค่าใช้จ่ายสำเร็จ", "success");
      }
      handleCloseModal();
      // Refresh data
      dispatch(
        fetchExpenses({
          token: auth.token!,
          ...(selectedDormId && { dormitoryId: selectedDormId }),
          ...(selectedType !== "all" && { type: selectedType }),
          ...(selectedMonth && { month: selectedMonth }),
          ...(selectedYear && { year: selectedYear }),
        })
      );
    } catch (error: any) {
      showAlert(error.message || "เกิดข้อผิดพลาด", "error");
    }
  };

  const handleDelete = async () => {
    if (!expenseToDelete) return;

    try {
      await dispatch(
        deleteExpense({
          token: auth.token!,
          id: expenseToDelete.id,
        })
      ).unwrap();
      showAlert("ลบค่าใช้จ่ายสำเร็จ", "success");
      setConfirmModalOpen(false);
      setExpenseToDelete(null);
      // Refresh data
      dispatch(
        fetchExpenses({
          token: auth.token!,
          ...(selectedDormId && { dormitoryId: selectedDormId }),
          ...(selectedType !== "all" && { type: selectedType }),
          ...(selectedMonth && { month: selectedMonth }),
          ...(selectedYear && { year: selectedYear }),
        })
      );
    } catch (error: any) {
      showAlert(error.message || "เกิดข้อผิดพลาดในการลบ", "error");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredExpenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onEdit={() => handleOpenModal(expense)}
          onDelete={() => {
            setExpenseToDelete(expense);
            setConfirmModalOpen(true);
          }}
        />
      ))}
    </div>
  );

  const renderTableView = () => (
    <ExpenseTable
      expenses={filteredExpenses}
      onEdit={handleOpenModal}
      onDelete={(expense) => {
        setExpenseToDelete(expense);
        setConfirmModalOpen(true);
      }}
    />
  );

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Month/Year Picker */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <label className="font-medium text-gray-700">เดือน:</label>
          <select
            className="border rounded px-2 py-1 focus:outline-none focus:ring"
            value={selectedMonth ?? ""}
            onChange={(e) =>
              setSelectedMonth(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">ทั้งหมด</option>
            {monthNames.map((name, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>
          <label className="font-medium text-gray-700 ml-4">ปี:</label>
          <select
            className="border rounded px-2 py-1 focus:outline-none focus:ring"
            value={selectedYear ?? currentYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y + 543}
              </option>
            ))}
          </select>
          <button
            className="ml-4 flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => {
              setSelectedMonth(new Date().getMonth() + 1);
              setSelectedYear(currentYear);
            }}
          >
            วันนี้
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-xl overflow-visible">
          {/* Desktop Header */}
          <div className="hidden md:flex bg-orange-50 px-6 py-4 border-b items-center justify-between">
            <h3 className="font-bold text-lg text-orange-900 flex items-center gap-2">
              <span>💰</span> จัดการค่าใช้จ่าย
            </h3>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    viewMode === "table"
                      ? "bg-orange-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  ตาราง
                </button>
                <button
                  onClick={() => setViewMode("card")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    viewMode === "card"
                      ? "bg-orange-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  การ์ด
                </button>
              </div>

              <button
                className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                onClick={() => handleOpenModal()}
              >
                + เพิ่มค่าใช้จ่าย
              </button>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden bg-orange-50 px-4 py-3 border-b">
            {/* Top Row: Title + Toggle */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-orange-900 flex items-center gap-2">
                <span>💰</span> จัดการค่าใช้จ่าย
              </h3>
              {/* Compact View Toggle */}
              <div className="flex bg-white rounded-lg p-0.5 shadow-sm border">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                    viewMode === "table"
                      ? "bg-orange-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  <span className="hidden xs:inline">ตาราง</span>
                </button>
                <button
                  onClick={() => setViewMode("card")}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1 ${
                    viewMode === "card"
                      ? "bg-orange-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  <span className="hidden xs:inline">การ์ด</span>
                </button>
              </div>
            </div>

            {/* Bottom Row: Action Buttons */}
            <div className="flex justify-center">
              <button
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium w-full max-w-48 touch-manipulation"
                onClick={() => handleOpenModal()}
              >
                + เพิ่มค่าใช้จ่าย
              </button>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 border-b">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-800">
                  {expenses.length}
                </div>
                <div className="text-xs text-gray-600">จำนวนรายการ</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-orange-600">
                  {new Intl.NumberFormat("th-TH", {
                    style: "currency",
                    currency: "THB",
                  }).format(stats?.totalAmount || 0)}
                </div>
                <div className="text-xs text-gray-600">รวมทั้งหมด</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">
                  {dormitories.length}
                </div>
                <div className="text-xs text-gray-600">หอพัก</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">
                  {expensesByType.length}
                </div>
                <div className="text-xs text-gray-600">ประเภท</div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="ค้นหาค่าใช้จ่าย..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={selectedDormId || ""}
                  onChange={(e) =>
                    setSelectedDormId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                >
                  <option value="">ทุกหอพัก</option>
                  {dormitories.map((dorm) => (
                    <option key={dorm.id} value={dorm.id}>
                      {dorm.name}
                    </option>
                  ))}
                </select>
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">ทุกประเภท</option>
                  {expenseTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-6">
            {loading ? (
              <div className="text-center text-gray-500">กำลังโหลด...</div>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center text-gray-500">
                {searchTerm || selectedDormId || selectedType !== "all"
                  ? "ไม่พบข้อมูลที่ตรงกับเงื่อนไข"
                  : "ยังไม่มีค่าใช้จ่าย"}
              </div>
            ) : viewMode === "card" ? (
              renderCardView()
            ) : (
              renderTableView()
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <ExpenseModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editExpense={editExpense}
        dormitories={dormitories}
        loading={submitting}
      />

      {/* Confirm Modal */}
      <ConfirmDeleteModal
        open={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setExpenseToDelete(null);
        }}
        onConfirm={handleDelete}
        text={`คุณแน่ใจหรือไม่ที่จะลบค่าใช้จ่าย "${expenseToDelete?.description}"?`}
      />

      {/* Alert Modal */}
      {alertModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">
                    {alertType === "success" ? "✅" : "❌"}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {alertType === "success" ? "สำเร็จ" : "เกิดข้อผิดพลาด"}
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">{alertMessage}</p>
                <div className="flex justify-end">
                  <button
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      alertType === "success"
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                    onClick={() => setAlertModalOpen(false)}
                  >
                    ตกลง
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </ProtectedRoute>
  );
}
