import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types
export interface RecurringExpense {
  id: number;
  dormitoryId: number;
  roomId?: number;
  type: string;
  description: string;
  amount: number;
  frequency: string;
  dayOfMonth?: number;
  isActive: boolean;
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

export interface RecurringExpenseFormData {
  id?: number;
  dormitoryId: number;
  roomId?: number;
  type: string;
  description: string;
  amount: number;
  frequency: string;
  dayOfMonth?: number;
  isActive?: boolean;
}

export interface RecurringExpenseStats {
  totalAmount: number;
  totalCount: number;
}

interface RecurringExpenseState {
  recurringExpenses: RecurringExpense[];
  stats: RecurringExpenseStats | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: RecurringExpenseState = {
  recurringExpenses: [],
  stats: null,
  loading: false,
  submitting: false,
  error: null,
};

// Async thunks
export const fetchRecurringExpenses = createAsyncThunk(
  "recurringExpense/fetchRecurringExpenses",
  async (
    params: {
      token: string;
      dormitoryId?: number;
      type?: string;
      isActive?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.dormitoryId)
        queryParams.append("dormitoryId", params.dormitoryId.toString());
      if (params.type) queryParams.append("type", params.type);
      if (params.isActive !== undefined)
        queryParams.append("isActive", params.isActive.toString());

      const res = await fetch(
        `/api/recurring-expense?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${params.token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.error || "Failed to fetch recurring expenses");
      }
      return data;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

export const addRecurringExpense = createAsyncThunk(
  "recurringExpense/addRecurringExpense",
  async (
    params: {
      token: string;
      recurringExpenseData: RecurringExpenseFormData;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/recurring-expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${params.token}`,
        },
        body: JSON.stringify(params.recurringExpenseData),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to add recurring expense");
      }
      return data;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

export const updateRecurringExpense = createAsyncThunk(
  "recurringExpense/updateRecurringExpense",
  async (
    params: {
      token: string;
      recurringExpenseData: RecurringExpenseFormData;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/recurring-expense", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${params.token}`,
        },
        body: JSON.stringify(params.recurringExpenseData),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(
          data.error || "Failed to update recurring expense"
        );
      }
      return data;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

export const deleteRecurringExpense = createAsyncThunk(
  "recurringExpense/deleteRecurringExpense",
  async (
    params: { token: string; id: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/recurring-expense?id=${params.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${params.token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(
          data.error || "Failed to delete recurring expense"
        );
      }
      return params.id;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

export const applyRecurringExpense = createAsyncThunk(
  "recurringExpense/applyRecurringExpense",
  async (
    params: {
      token: string;
      recurringExpenseId: number;
      expenseDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/recurring-expense/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${params.token}`,
        },
        body: JSON.stringify({
          recurringExpenseId: params.recurringExpenseId,
          expenseDate: params.expenseDate,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.error || "Failed to apply recurring expense");
      }
      return data;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

const recurringExpenseSlice = createSlice({
  name: "recurringExpense",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRecurringExpenses: (state) => {
      state.recurringExpenses = [];
      state.stats = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch recurring expenses
    builder
      .addCase(fetchRecurringExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecurringExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.recurringExpenses = action.payload.recurringExpenses || [];
        state.stats = action.payload.stats || null;
      })
      .addCase(fetchRecurringExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add recurring expense
    builder
      .addCase(addRecurringExpense.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(addRecurringExpense.fulfilled, (state, action) => {
        state.submitting = false;
        state.recurringExpenses.unshift(action.payload);
      })
      .addCase(addRecurringExpense.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });

    // Update recurring expense
    builder
      .addCase(updateRecurringExpense.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateRecurringExpense.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.recurringExpenses.findIndex(
          (e) => e.id === action.payload.id
        );
        if (index !== -1) {
          state.recurringExpenses[index] = action.payload;
        }
      })
      .addCase(updateRecurringExpense.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });

    // Delete recurring expense
    builder
      .addCase(deleteRecurringExpense.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteRecurringExpense.fulfilled, (state, action) => {
        state.submitting = false;
        state.recurringExpenses = state.recurringExpenses.filter(
          (e) => e.id !== action.payload
        );
      })
      .addCase(deleteRecurringExpense.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });

    // Apply recurring expense
    builder
      .addCase(applyRecurringExpense.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(applyRecurringExpense.fulfilled, (state) => {
        state.submitting = false;
        // Don't modify recurring expenses list, just clear error
      })
      .addCase(applyRecurringExpense.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearRecurringExpenses } =
  recurringExpenseSlice.actions;
export default recurringExpenseSlice.reducer;

