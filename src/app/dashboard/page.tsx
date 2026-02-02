"use client";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  fetchAllDashboardData,
  refreshDashboard,
  setSelectedMonth,
  setSelectedYear,
} from "@/store/dashboardSlice";
import { addExpense, deleteExpense, ExpenseFormData } from "@/store/expenseSlice";
import { fetchDorms } from "@/store/dormSlice";
import {
  fetchRecurringExpenses,
  addRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  applyRecurringExpense,
  RecurringExpenseFormData,
  RecurringExpense,
} from "@/store/recurringExpenseSlice";
import RecurringExpensesTable from "@/app/components/RecurringExpensesTable";
import Navbar from "@/app/components/Navbar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import DashboardOverview from "../components/DashboardOverview";
import RevenueChart from "../components/RevenueChart";
import TopRoomsCard from "../components/TopRoomsCard";
import ExpiringContractsCard from "../components/ExpiringContractsCard";
import RecentExpensesCard from "../components/RecentExpensesCard";
import ExpensePieChart from "../components/ExpensePieChart";
import ExpenseTrendChart from "../components/ExpenseTrendChart";
import RevenuePieChart from "../components/RevenuePieChart";
import ExpenseModal from "@/app/components/ExpenseModal";
import RecurringExpenseModal from "@/app/components/RecurringExpenseModal";
import ConfirmDeleteModal from "@/app/components/ConfirmDeleteModal";
import {
  RefreshCw,
  Calendar,
  TrendingUp,
  Building,
  Users,
  AlertCircle,
  FileText,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const {
    stats,
    monthlyData,
    topRooms,
    expiringContracts,
    recentExpenses,
    expenseData,
    totalExpenses,
    monthlyGrowth,
    expenseMonthlyGrowth,
    selectedMonth,
    selectedYear,
    loading,
    error,
    waterExpense,
    electricExpense,
    monthlyExpenses,
    revenueData,
    revenue6Data,
    expense6Data,
  } = useSelector((state: RootState) => state.dashboard);
  const { dorms: dormitories } = useSelector((state: RootState) => state.dorm);
  const { submitting: expenseSubmitting } = useSelector(
    (state: RootState) => state.expense
  );
  const {
    recurringExpenses,
    stats: recurringExpenseStats,
    submitting: recurringExpenseSubmitting,
  } = useSelector((state: RootState) => state.recurringExpense);
  const [applyingRecurringExpenseId, setApplyingRecurringExpenseId] =
    useState<number | null>(null);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseInitialData, setExpenseInitialData] =
    useState<Partial<ExpenseFormData> | null>(null);
  const [recurringExpenseModalOpen, setRecurringExpenseModalOpen] =
    useState(false);
  const [editRecurringExpense, setEditRecurringExpense] =
    useState<RecurringExpense | null>(null);
  const [confirmDeleteRecurringExpenseModalOpen, setConfirmDeleteRecurringExpenseModalOpen] = useState(false);
  const [recurringExpenseToDelete, setRecurringExpenseToDelete] =
    useState<RecurringExpense | null>(null);
  const [confirmDeleteExpenseModalOpen, setConfirmDeleteExpenseModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!token) return; // Don't fetch if no token
    dispatch(fetchDorms(token));
    dispatch(
      fetchAllDashboardData({ token, month: selectedMonth, year: selectedYear })
    );
    dispatch(fetchRecurringExpenses({ token, isActive: true }));
  }, [dispatch, token, selectedMonth, selectedYear]);

  const handleRefresh = () => {
    if (!token) return;
    dispatch(
      refreshDashboard({ token, month: selectedMonth, year: selectedYear })
    );
  };

  const handleOpenExpenseModal = (type?: string) => {
    const today = new Date();
    const year = selectedYear || today.getFullYear();
    const month = selectedMonth || today.getMonth() + 1;
    // Use first day of selected month, or today if current month/year
    const isCurrentMonth =
      year === today.getFullYear() && month === today.getMonth() + 1;
    const day = isCurrentMonth ? today.getDate() : 1;
    // Format date as YYYY-MM-DD
    const expenseDate = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    setExpenseInitialData({
      type: type || "other",
      expenseDate,
      dormitoryId: dormitories.length > 0 ? dormitories[0].id : 0,
    });
    setExpenseModalOpen(true);
  };

  const handleCloseExpenseModal = () => {
    setExpenseModalOpen(false);
    setExpenseInitialData(null);
  };

  const handleSubmitExpense = async (formData: ExpenseFormData) => {
    if (!token) return;
    try {
      await dispatch(
        addExpense({ token, expenseData: formData })
      ).unwrap();
      // Refresh dashboard data after adding expense
      dispatch(
        fetchAllDashboardData({
          token,
          month: selectedMonth,
          year: selectedYear,
        })
      );
      handleCloseExpenseModal();
    } catch (error: any) {
      throw error; // Let modal handle the error
    }
  };

  const handleOpenRecurringExpenseModal = (recurringExpense?: RecurringExpense) => {
    setEditRecurringExpense(recurringExpense || null);
    setRecurringExpenseModalOpen(true);
  };

  const handleCloseRecurringExpenseModal = () => {
    setRecurringExpenseModalOpen(false);
    setEditRecurringExpense(null);
  };

  const handleSubmitRecurringExpense = async (
    formData: RecurringExpenseFormData
  ) => {
    if (!token) return;
    try {
      if (editRecurringExpense) {
        await dispatch(
          updateRecurringExpense({
            token,
            recurringExpenseData: { ...formData, id: editRecurringExpense.id },
          })
        ).unwrap();
      } else {
        await dispatch(
          addRecurringExpense({ token, recurringExpenseData: formData })
        ).unwrap();
      }
      // Refresh recurring expenses
      dispatch(fetchRecurringExpenses({ token, isActive: true }));
      handleCloseRecurringExpenseModal();
    } catch (error: any) {
      throw error; // Let modal handle the error
    }
  };

  const handleEditRecurringExpense = (recurringExpense: RecurringExpense) => {
    handleOpenRecurringExpenseModal(recurringExpense);
  };

  const handleDeleteRecurringExpense = (recurringExpense: RecurringExpense) => {
    setRecurringExpenseToDelete(recurringExpense);
    setConfirmDeleteRecurringExpenseModalOpen(true);
  };

  const handleConfirmDeleteRecurringExpense = async () => {
    if (!recurringExpenseToDelete || !token) return;
    try {
      await dispatch(
        deleteRecurringExpense({
          token,
          id: recurringExpenseToDelete.id,
        })
      ).unwrap();
      // Refresh recurring expenses
      dispatch(fetchRecurringExpenses({ token, isActive: true }));
      setConfirmDeleteRecurringExpenseModalOpen(false);
      setRecurringExpenseToDelete(null);
    } catch (error: any) {
      console.error("Error deleting recurring expense:", error);
      // You could show an alert here
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenseToDelete(expenseId);
    setConfirmDeleteExpenseModalOpen(true);
  };

  const handleConfirmDeleteExpense = async () => {
    if (!expenseToDelete || !token) return;
    try {
      await dispatch(
        deleteExpense({
          token,
          id: Number(expenseToDelete),
        })
      ).unwrap();
      // Refresh dashboard data after deleting expense
      dispatch(
        fetchAllDashboardData({
          token,
          month: selectedMonth,
          year: selectedYear,
        })
      );
      setConfirmDeleteExpenseModalOpen(false);
      setExpenseToDelete(null);
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      // You could show an alert here
    }
  };

  const handleApplyRecurringExpense = async (recurringExpense: any) => {
    if (!token) return;
    setApplyingRecurringExpenseId(recurringExpense.id);
    try {
      // Use current date for expense date
      const today = new Date();
      const year = selectedYear || today.getFullYear();
      const month = selectedMonth || today.getMonth() + 1;
      const day = today.getDate();
      const expenseDate = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

      await dispatch(
        applyRecurringExpense({
          token,
          recurringExpenseId: recurringExpense.id,
          expenseDate,
        })
      ).unwrap();
      
      // Refresh dashboard data after applying
      dispatch(
        fetchAllDashboardData({
          token,
          month: selectedMonth,
          year: selectedYear,
        })
      );
    } catch (error: any) {
      console.error("Error applying recurring expense:", error);
      // You could show an alert here
    } finally {
      setApplyingRecurringExpenseId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("th-TH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
  const currentYearVal = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYearVal - 3 + i);

  if (loading || !stats) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <div className="ml-4 text-lg text-gray-600">
                {loading ? "กำลังโหลดข้อมูล..." : "เตรียมข้อมูล..."}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                แดชบอร์ด
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(currentTime)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(currentTime)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <select
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring"
                value={selectedMonth}
                onChange={(e) =>
                  dispatch(setSelectedMonth(Number(e.target.value)))
                }
              >
                {monthNames.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring"
                value={selectedYear}
                onChange={(e) =>
                  dispatch(setSelectedYear(Number(e.target.value)))
                }
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y + 543}
                  </option>
                ))}
              </select>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>รีเฟรช</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Welcome Message */}
          <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  ยินดีต้อนรับ, {user?.name || "ผู้ใช้"}!
                </h2>
                <p className="text-gray-600">
                  นี่คือภาพรวมของระบบจัดการหอพักของคุณ
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Overview */}
          <DashboardOverview
            stats={stats}
            totalExpenses={totalExpenses}
            monthlyGrowth={monthlyGrowth}
            expenseGrowth={expenseMonthlyGrowth}
            waterExpense={waterExpense}
            electricExpense={electricExpense}
            formatCurrency={formatCurrency}
            onAddExpense={() => handleOpenExpenseModal()}
            onAddWaterExpense={() => handleOpenExpenseModal("water")}
            onAddElectricExpense={() => handleOpenExpenseModal("electric")}
          />

             {/* Recurring Expenses Table */}
             <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span>🔄</span>
                    <span className="truncate">ค่าใช้จ่ายประจำ</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
                    คลิก Apply เพื่อสร้างค่าใช้จ่ายจากค่าใช้จ่ายประจำ
                  </p>
                </div>
                <button
                  onClick={() => handleOpenRecurringExpenseModal()}
                  className="shrink-0 px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                >
                  <span>+</span>
                  <span className="sm:hidden">เพิ่ม</span>
                  <span className="hidden sm:inline">เพิ่มค่าใช้จ่ายประจำ</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <RecurringExpensesTable
                recurringExpenses={recurringExpenses.filter((e) => e.isActive)}
                formatCurrency={formatCurrency}
                onApply={handleApplyRecurringExpense}
                onEdit={handleEditRecurringExpense}
                onDelete={handleDeleteRecurringExpense}
                applyingId={applyingRecurringExpenseId}
              />
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
            {/* Revenue Trend - take half width on xl */}
            <div className="xl:col-span-6">
              <RevenueChart
                data={monthlyData}
                formatCurrency={formatCurrency}
                title="รายได้รายเดือน"
                subtitle="แสดงรายได้ในช่วง 6 เดือนที่ผ่านมา"
              />
            </div>

            {/* Expense Trend - take half width on xl */}
            <div className="xl:col-span-6">
              <ExpenseTrendChart
                data={monthlyExpenses}
                formatCurrency={formatCurrency}
                title="ค่าใช้จ่ายรายเดือน"
                subtitle="แสดงค่าใช้จ่ายในช่วง 6 เดือนที่ผ่านมา"
              />
            </div>
          </div>

          

          {/* Proportion Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {/* Revenue Proportion Current Month */}
            <div>
              <RevenuePieChart
                data={revenueData}
                formatCurrency={formatCurrency}
                title="สัดส่วนรายได้"
                subtitle="สัดส่วนรายได้ตามประเภท"
              />
            </div>

            {/* Expense Proportion Current Month */}
            <div>
              <ExpensePieChart
                data={expenseData}
                formatCurrency={formatCurrency}
                title="สัดส่วนค่าใช้จ่าย"
                subtitle="แสดงสัดส่วนค่าใช้จ่ายตามประเภท"
              />
            </div>

            {/* Revenue Proportion 6 Months */}
            <div>
              <RevenuePieChart
                data={revenue6Data}
                formatCurrency={formatCurrency}
                title="สัดส่วนรายได้ 6 เดือน"
                subtitle="สัดส่วนรายได้ตามประเภทในช่วง 6 เดือนที่ผ่านมา"
              />
            </div>

            {/* Expense Proportion 6 Months */}
            <div>
              <ExpensePieChart
                data={expense6Data}
                formatCurrency={formatCurrency}
                title="สัดส่วนค่าใช้จ่าย 6 เดือน"
                subtitle="สัดส่วนค่าใช้จ่ายตามประเภทในช่วง 6 เดือนที่ผ่านมา"
              />
            </div>
          </div>

       

          {/* Information Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Top Rooms */}
            <TopRoomsCard
              rooms={topRooms}
              formatCurrency={formatCurrency}
              title="ห้องที่ทำรายได้สูงสุด"
              subtitle="5 ห้องที่มีรายได้สูงสุด"
            />

            {/* Expiring Contracts */}
            <ExpiringContractsCard
              contracts={expiringContracts}
              title="สัญญาใกล้หมดอายุ"
              subtitle="สัญญาที่จะหมดอายุใน 30 วันข้างหน้า"
            />

            {/* Recent Expenses */}
            <RecentExpensesCard
              expenses={recentExpenses}
              formatCurrency={formatCurrency}
              title="ค่าใช้จ่ายล่าสุด"
              subtitle="ค่าใช้จ่ายล่าสุด 5 รายการ"
              onDelete={handleDeleteExpense}
            />
          </div>

          {/* Quick Stats Footer */}
          <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalRooms}
                  </p>
                  <p className="text-sm text-gray-600">ห้องทั้งหมด</p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.totalTenants}
                  </p>
                  <p className="text-sm text-gray-600">ผู้เช่าทั้งหมด</p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.totalBills}
                  </p>
                  <p className="text-sm text-gray-600">บิลทั้งหมด</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={expenseModalOpen}
        onClose={handleCloseExpenseModal}
        onSubmit={handleSubmitExpense}
        initialData={expenseInitialData}
        dormitories={dormitories}
        loading={expenseSubmitting}
      />

      {/* Recurring Expense Modal */}
      <RecurringExpenseModal
        isOpen={recurringExpenseModalOpen}
        onClose={handleCloseRecurringExpenseModal}
        onSubmit={handleSubmitRecurringExpense}
        editRecurringExpense={
          editRecurringExpense
            ? {
                id: editRecurringExpense.id,
                dormitoryId: editRecurringExpense.dormitoryId,
                roomId: editRecurringExpense.roomId,
                type: editRecurringExpense.type,
                description: editRecurringExpense.description,
                amount: editRecurringExpense.amount,
                frequency: editRecurringExpense.frequency,
                dayOfMonth: editRecurringExpense.dayOfMonth,
                isActive: editRecurringExpense.isActive,
              }
            : null
        }
        dormitories={dormitories}
        loading={recurringExpenseSubmitting}
      />

      {/* Confirm Delete Modal for Recurring Expense */}
      <ConfirmDeleteModal
        open={confirmDeleteRecurringExpenseModalOpen}
        onClose={() => {
          setConfirmDeleteRecurringExpenseModalOpen(false);
          setRecurringExpenseToDelete(null);
        }}
        onConfirm={handleConfirmDeleteRecurringExpense}
        text={`คุณแน่ใจหรือไม่ที่จะลบค่าใช้จ่ายประจำ "${recurringExpenseToDelete?.description}"?`}
      />

      {/* Confirm Delete Modal for Expense */}
      <ConfirmDeleteModal
        open={confirmDeleteExpenseModalOpen}
        onClose={() => {
          setConfirmDeleteExpenseModalOpen(false);
          setExpenseToDelete(null);
        }}
        onConfirm={handleConfirmDeleteExpense}
        text="คุณแน่ใจหรือไม่ที่จะลบค่าใช้จ่ายนี้?"
      />
    </ProtectedRoute>
  );
}
