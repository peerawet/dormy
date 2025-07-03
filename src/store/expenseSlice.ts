import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
export interface Expense {
  id: number;
  dormitoryId: number;
  roomId?: number;
  type: string;
  description: string;
  amount: number;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
  dormitory: {
    id: number;
    name: string;
  };
  room?: {
    id: number;
    name: string;
  };
}

export interface ExpenseFormData {
  id?: number;
  dormitoryId: number;
  roomId?: number;
  type: string;
  description: string;
  amount: number;
  expenseDate: string;
}

export interface ExpenseStats {
  totalAmount: number;
  totalCount: number;
}

export interface ExpensesByType {
  type: string;
  _sum: {
    amount: number;
  };
  _count: {
    id: number;
  };
}

interface ExpenseState {
  expenses: Expense[];
  stats: ExpenseStats | null;
  expensesByType: ExpensesByType[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  expenses: [],
  stats: null,
  expensesByType: [],
  loading: false,
  submitting: false,
  error: null,
};

// Async thunks
export const fetchExpenses = createAsyncThunk(
  "expense/fetchExpenses",
  async (params: {
    token: string;
    dormitoryId?: number;
    type?: string;
    month?: number;
    year?: number;
  }) => {
    const { token, dormitoryId, type, month, year } = params;
    const queryParams = new URLSearchParams();

    if (dormitoryId) queryParams.append("dormitoryId", dormitoryId.toString());
    if (type) queryParams.append("type", type);
    if (month) queryParams.append("month", month.toString());
    if (year) queryParams.append("year", year.toString());

    const response = await fetch(`/api/expense?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch expenses");
    }

    return response.json();
  }
);

export const addExpense = createAsyncThunk(
  "expense/addExpense",
  async (params: { token: string; expenseData: ExpenseFormData }) => {
    const { token, expenseData } = params;
    const response = await fetch("/api/expense", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(expenseData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add expense");
    }

    return response.json();
  }
);

export const updateExpense = createAsyncThunk(
  "expense/updateExpense",
  async (params: { token: string; expenseData: ExpenseFormData }) => {
    const { token, expenseData } = params;
    const response = await fetch("/api/expense", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(expenseData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update expense");
    }

    return response.json();
  }
);

export const deleteExpense = createAsyncThunk(
  "expense/deleteExpense",
  async (params: { token: string; id: number }) => {
    const { token, id } = params;
    const response = await fetch(`/api/expense?id=${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete expense");
    }

    return { id };
  }
);

// Slice
const expenseSlice = createSlice({
  name: "expense",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearExpenses: (state) => {
      state.expenses = [];
      state.stats = null;
      state.expensesByType = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload.expenses;
        state.stats = action.payload.stats;
        state.expensesByType = action.payload.expensesByType;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch expenses";
      })
      // Add expense
      .addCase(addExpense.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.submitting = false;
        state.expenses.unshift(action.payload);
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message || "Failed to add expense";
      })
      // Update expense
      .addCase(updateExpense.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.expenses.findIndex(
          (exp) => exp.id === action.payload.id
        );
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message || "Failed to update expense";
      })
      // Delete expense
      .addCase(deleteExpense.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.submitting = false;
        state.expenses = state.expenses.filter(
          (exp) => exp.id !== action.payload.id
        );
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message || "Failed to delete expense";
      });
  },
});

export const { clearError, clearExpenses } = expenseSlice.actions;
export default expenseSlice.reducer;
