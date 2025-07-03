import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  occupancyRate: string;
  totalTenants: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalBills: number;
  expiringContracts: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
}

export interface TopRoom {
  id: string;
  name: string;
  totalRevenue: number;
  dormitoryName: string;
}

export interface ExpiringContract {
  id: string;
  tenantName: string;
  roomName: string;
  dormitoryName: string;
  endDate: string;
  daysLeft: number;
}

export interface RecentExpense {
  id: string;
  type: string;
  description?: string;
  amount: number;
  expenseDate: string; // ISO string
  dormitoryName: string;
  roomName?: string;
}

export interface ExpenseData {
  type: string;
  amount: number;
  percentage: number;
}

export interface MonthlyGrowth {
  change: number;
  percentage: number;
  isPositive: boolean;
}

export interface CategoryExpenseGrowth {
  amount: number;
  growth?: MonthlyGrowth | null;
}

export interface MonthlyExpenseData {
  month: string;
  expense: number;
}

export interface RevenueData {
  type: string;
  amount: number;
  percentage: number;
}

interface DashboardState {
  stats: DashboardStats | null;
  monthlyData: MonthlyData[];
  topRooms: TopRoom[];
  expiringContracts: ExpiringContract[];
  recentExpenses: RecentExpense[];
  expenseData: ExpenseData[];
  totalExpenses: number;
  monthlyGrowth: MonthlyGrowth | null;
  expenseMonthlyGrowth: MonthlyGrowth | null;
  selectedMonth: number;
  selectedYear: number;
  loading: boolean;
  error: string | null;
  waterExpense: CategoryExpenseGrowth;
  electricExpense: CategoryExpenseGrowth;
  monthlyExpenses: MonthlyExpenseData[];
  revenueData: RevenueData[];
  revenue6Data: RevenueData[];
  expense6Data: ExpenseData[];
}

const initialState: DashboardState = {
  stats: null,
  monthlyData: [],
  topRooms: [],
  expiringContracts: [],
  recentExpenses: [],
  expenseData: [],
  totalExpenses: 0,
  monthlyGrowth: null,
  expenseMonthlyGrowth: null,
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  loading: false,
  error: null,
  waterExpense: { amount: 0, growth: null },
  electricExpense: { amount: 0, growth: null },
  monthlyExpenses: [],
  revenueData: [],
  revenue6Data: [],
  expense6Data: [],
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (params: { token: string; month: number; year: number }) => {
    const { token, month, year } = params;
    const response = await fetch(
      `/api/dashboard/stats?month=${month}&year=${year}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch dashboard stats");
    }

    return response.json();
  }
);

export const fetchTopRooms = createAsyncThunk(
  "dashboard/fetchTopRooms",
  async (params: {
    token: string;
    month: number;
    year: number;
    limit?: number;
  }) => {
    const { token, month, year, limit = 5 } = params;
    const response = await fetch(
      `/api/room/detail?limit=${limit}&month=${month}&year=${year}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch top rooms");
    }

    return response.json();
  }
);

export const fetchExpiringContracts = createAsyncThunk(
  "dashboard/fetchExpiringContracts",
  async (params: { token: string; days?: number }) => {
    const { token, days = 30 } = params;
    const response = await fetch(`/api/rental-contract?expiring=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch expiring contracts");
    }

    return response.json();
  }
);

export const fetchRecentExpenses = createAsyncThunk(
  "dashboard/fetchRecentExpenses",
  async (params: { token: string; limit?: number }) => {
    const { token, limit = 5 } = params;
    const response = await fetch(`/api/expense?limit=${limit}&sort=desc`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch recent expenses");
    }

    return response.json();
  }
);

export const fetchExpenseData = createAsyncThunk(
  "dashboard/fetchExpenseData",
  async (
    params: { token: string; month: number; year: number },
    { rejectWithValue }
  ) => {
    try {
      const { token, month, year } = params;
      const currentUrl = `/api/expense?groupBy=type&month=${month}&year=${year}`;
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevUrl = `/api/expense?groupBy=type&month=${prevMonth}&year=${prevYear}`;

      const [currentRes, prevRes] = await Promise.all([
        fetch(currentUrl, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(prevUrl, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!currentRes.ok)
        throw new Error((await currentRes.json()).error || "Failed fetch");
      if (!prevRes.ok) throw new Error("Failed previous fetch");

      const currentJson = await currentRes.json();
      const prevJson = await prevRes.json();

      const getTypeAmount = (list: any[], type: string) => {
        const item = list.find((i: any) => i.type === type);
        return item ? item._sum?.amount || 0 : 0;
      };
      const waterCurrent = getTypeAmount(currentJson.expensesByType, "water");
      const electricCurrent = getTypeAmount(
        currentJson.expensesByType,
        "electric"
      );
      const waterPrev = getTypeAmount(prevJson.expensesByType, "water");
      const electricPrev = getTypeAmount(prevJson.expensesByType, "electric");
      const makeGrowth = (curr: number, prev: number): MonthlyGrowth | null => {
        if (prev === 0) return null;
        const change = curr - prev;
        return {
          change,
          percentage: (change / prev) * 100,
          isPositive: change >= 0,
        };
      };
      const waterGrowth = makeGrowth(waterCurrent, waterPrev);
      const electricGrowth = makeGrowth(electricCurrent, electricPrev);

      return {
        current: currentJson,
        prev: prevJson,
        waterGrowth,
        electricGrowth,
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMonthlyExpenses = createAsyncThunk(
  "dashboard/fetchMonthlyExpenses",
  async (
    params: { token: string; month: number; year: number },
    { rejectWithValue }
  ) => {
    try {
      const { token, month, year } = params;
      const url = `/api/expense?groupBy=month&month=${month}&year=${year}&months=6`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed fetch monthly expenses");
      const json = await res.json();
      return json.monthlyExpenses || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchRevenueData = createAsyncThunk(
  "dashboard/fetchRevenueData",
  async (
    params: { token: string; month: number; year: number },
    { rejectWithValue }
  ) => {
    try {
      const { token, month, year } = params;
      const url = `/api/revenue?month=${month}&year=${year}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed fetch revenue data");
      const json = await res.json();
      return json.revenueByType || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchRevenue6Data = createAsyncThunk(
  "dashboard/fetchRevenue6Data",
  async (
    params: { token: string; month: number; year: number },
    { rejectWithValue }
  ) => {
    try {
      const { token, month, year } = params;
      const url = `/api/revenue?month=${month}&year=${year}&months=6`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed fetch revenue 6 data");
      const json = await res.json();
      return json.revenueByType || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchExpense6Data = createAsyncThunk(
  "dashboard/fetchExpense6Data",
  async (
    params: { token: string; month: number; year: number },
    { rejectWithValue }
  ) => {
    try {
      const { token, month, year } = params;
      const url = `/api/expense?groupBy=type&month=${month}&year=${year}&months=6`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed fetch expense 6 data");
      const json = await res.json();
      return json.expensesByType || [];
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAllDashboardData = createAsyncThunk(
  "dashboard/fetchAllData",
  async (
    params: { token: string; month: number; year: number },
    { dispatch }
  ) => {
    const { token, month, year } = params;

    // Fetch all dashboard data concurrently
    const promises = [
      dispatch(fetchDashboardStats({ token, month, year })),
      dispatch(fetchTopRooms({ token, month, year })),
      dispatch(fetchExpiringContracts({ token })),
      dispatch(fetchRecentExpenses({ token })),
      dispatch(fetchExpenseData({ token, month, year })),
      dispatch(fetchMonthlyExpenses({ token, month, year })),
      dispatch(fetchRevenueData({ token, month, year })),
      dispatch(fetchRevenue6Data({ token, month, year })),
      dispatch(fetchExpense6Data({ token, month, year })),
    ];

    await Promise.all(promises);
  }
);

export const refreshDashboard = createAsyncThunk(
  "dashboard/refresh",
  async (
    params: { token: string; month: number; year: number },
    { dispatch }
  ) => {
    const { token, month, year } = params;

    // Refresh all dashboard data
    const promises = [
      dispatch(fetchDashboardStats({ token, month, year })),
      dispatch(fetchTopRooms({ token, month, year })),
      dispatch(fetchExpiringContracts({ token })),
      dispatch(fetchRecentExpenses({ token })),
      dispatch(fetchExpenseData({ token, month, year })),
      dispatch(fetchMonthlyExpenses({ token, month, year })),
      dispatch(fetchRevenueData({ token, month, year })),
      dispatch(fetchRevenue6Data({ token, month, year })),
      dispatch(fetchExpense6Data({ token, month, year })),
    ];

    await Promise.all(promises);
  }
);

// Slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedMonth: (state, action: PayloadAction<number>) => {
      state.selectedMonth = action.payload;
    },
    setSelectedYear: (state, action: PayloadAction<number>) => {
      state.selectedYear = action.payload;
    },
    clearDashboardData: (state) => {
      state.stats = null;
      state.monthlyData = [];
      state.topRooms = [];
      state.expiringContracts = [];
      state.recentExpenses = [];
      state.expenseData = [];
      state.totalExpenses = 0;
      state.monthlyGrowth = null;
      state.expenseMonthlyGrowth = null;
      state.waterExpense = { amount: 0, growth: null };
      state.electricExpense = { amount: 0, growth: null };
      state.monthlyExpenses = [];
      state.revenueData = [];
      state.revenue6Data = [];
      state.expense6Data = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.overview;
        state.monthlyData = action.payload.monthlyData || [];
        state.monthlyGrowth = action.payload.monthlyGrowth || null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch dashboard stats";
      })
      // Fetch top rooms
      .addCase(fetchTopRooms.fulfilled, (state, action) => {
        state.topRooms = action.payload.rooms || [];
      })
      .addCase(fetchTopRooms.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch top rooms";
      })
      // Fetch expiring contracts
      .addCase(fetchExpiringContracts.fulfilled, (state, action) => {
        const contracts =
          action.payload.contracts?.map((contract: any) => {
            const endDateStr = contract.endDate; // ISO string from API
            const end = new Date(endDateStr);
            return {
              id: contract.id.toString(),
              tenantName: contract.tenant?.name || "ไม่ระบุชื่อ",
              roomName: contract.room?.name || "ไม่ระบุห้อง",
              dormitoryName: contract.room?.dormitory?.name || "ไม่ระบุหอพัก",
              endDate: endDateStr, // store as string
              daysLeft: Math.ceil(
                (end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              ),
            };
          }) || [];
        state.expiringContracts = contracts;
      })
      .addCase(fetchExpiringContracts.rejected, (state, action) => {
        state.error =
          action.error.message || "Failed to fetch expiring contracts";
      })
      // Fetch recent expenses
      .addCase(fetchRecentExpenses.fulfilled, (state, action) => {
        const expenses =
          action.payload.expenses?.map((expense: any) => ({
            id: expense.id.toString(),
            type: expense.type,
            description: expense.description,
            amount: expense.amount,
            expenseDate: expense.expenseDate, // store string
            dormitoryName: expense.dormitory?.name || "ไม่ระบุหอพัก",
            roomName: expense.room?.name,
          })) || [];
        state.recentExpenses = expenses;
      })
      .addCase(fetchRecentExpenses.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch recent expenses";
      })
      // Fetch expense data
      .addCase(fetchExpenseData.fulfilled, (state, action) => {
        const currentByType = action.payload.current.expensesByType || [];
        const prevByType = action.payload.prev.expensesByType || [];

        const totalExpenses = currentByType.reduce(
          (sum: number, item: any) => sum + (item._sum?.amount || 0),
          0
        );
        const prevTotal = prevByType.reduce(
          (sum: number, item: any) => sum + (item._sum?.amount || 0),
          0
        );

        state.totalExpenses = totalExpenses;
        state.expenseData = currentByType.map((item: any) => ({
          type: item.type,
          amount: item._sum?.amount || 0,
          percentage:
            totalExpenses > 0
              ? ((item._sum?.amount || 0) / totalExpenses) * 100
              : 0,
        }));

        if (prevTotal > 0) {
          const change = totalExpenses - prevTotal;
          state.expenseMonthlyGrowth = {
            change,
            percentage: (change / prevTotal) * 100,
            isPositive: change >= 0,
          };
        } else {
          state.expenseMonthlyGrowth = null;
        }

        const getTypeAmount = (list: any[], type: string) => {
          const item = list.find((i: any) => i.type === type);
          return item ? item._sum?.amount || 0 : 0;
        };
        const waterCurrent = getTypeAmount(currentByType, "water");
        const electricCurrent = getTypeAmount(currentByType, "electric");
        const waterPrev = getTypeAmount(prevByType, "water");
        const electricPrev = getTypeAmount(prevByType, "electric");
        const makeGrowth = (
          curr: number,
          prev: number
        ): MonthlyGrowth | null => {
          if (prev === 0) return null;
          const change = curr - prev;
          return {
            change,
            percentage: (change / prev) * 100,
            isPositive: change >= 0,
          };
        };
        state.waterExpense = {
          amount: waterCurrent,
          growth: makeGrowth(waterCurrent, waterPrev),
        };
        state.electricExpense = {
          amount: electricCurrent,
          growth: makeGrowth(electricCurrent, electricPrev),
        };
      })
      .addCase(fetchExpenseData.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch expense data";
      })
      // Fetch monthly expenses
      .addCase(fetchMonthlyExpenses.fulfilled, (state, action) => {
        state.monthlyExpenses = action.payload;
      })
      .addCase(fetchMonthlyExpenses.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Failed to fetch monthly expenses";
      })
      // Fetch revenue data
      .addCase(fetchRevenueData.fulfilled, (state, action) => {
        const list = action.payload;
        const total = list.reduce(
          (sum: number, item: any) => sum + item.amount,
          0
        );
        state.revenueData = list.map((item: any) => ({
          type: item.type,
          amount: item.amount,
          percentage: total > 0 ? (item.amount / total) * 100 : 0,
        }));
      })
      .addCase(fetchRevenueData.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Failed to fetch revenue data";
      })
      // Fetch revenue 6 data
      .addCase(fetchRevenue6Data.fulfilled, (state, action) => {
        const list = action.payload;
        const total = list.reduce(
          (sum: number, item: any) => sum + item.amount,
          0
        );
        state.revenue6Data = list.map((item: any) => ({
          type: item.type,
          amount: item.amount,
          percentage: total > 0 ? (item.amount / total) * 100 : 0,
        }));
      })
      .addCase(fetchRevenue6Data.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Failed to fetch revenue 6 data";
      })
      // Fetch expense 6 data
      .addCase(fetchExpense6Data.fulfilled, (state, action) => {
        const list = action.payload;
        const total = list.reduce(
          (sum: number, item: any) =>
            sum + (item._sum?.amount || item.amount || 0),
          0
        );
        state.expense6Data = list.map((item: any) => ({
          type: item.type,
          amount: item._sum?.amount || item.amount || 0,
          percentage:
            total > 0
              ? ((item._sum?.amount || item.amount || 0) / total) * 100
              : 0,
        }));
      })
      .addCase(fetchExpense6Data.rejected, (state, action) => {
        state.error =
          (action.payload as string) || "Failed to fetch expense 6 data";
      })
      // Fetch all dashboard data
      .addCase(fetchAllDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDashboardData.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchAllDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch dashboard data";
      })
      // Refresh dashboard
      .addCase(refreshDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshDashboard.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(refreshDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to refresh dashboard";
      });
  },
});

export const {
  clearError,
  setSelectedMonth,
  setSelectedYear,
  clearDashboardData,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
