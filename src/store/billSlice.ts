import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface Bill {
  id: number;
  billDate: string;
  tenantId: number;
  tenant: {
    id: number;
    name: string;
    phone: string;
  };
  water: number;
  electric: number;
  common: number;
  other: number;
  rent: number;
  discount: number;
  total: number;
  meterWaterStart?: number | null;
  meterWaterEnd?: number | null;
  meterElectricStart?: number | null;
  meterElectricEnd?: number | null;
  roomId: number;
}

interface BillFormData {
  billDate: string;
  tenantId: number;
  water: number;
  electric: number;
  common: number;
  other: number;
  rent: number;
  discount: number;
  total: number;
  meterWaterStart?: number | null;
  meterWaterEnd?: number | null;
  meterElectricStart?: number | null;
  meterElectricEnd?: number | null;
  roomId: number;
}

interface BillState {
  bills: Bill[];
  loading: boolean;
  error: string | null;
  currentRoomId: string | null;
}

const initialState: BillState = {
  bills: [],
  loading: false,
  error: null,
  currentRoomId: null,
};

// Async thunks
export const fetchBills = createAsyncThunk(
  "bill/fetchBills",
  async (
    { roomId, token }: { roomId: string; token: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`/api/bill?roomId=${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to fetch bills");
      }
      return { bills: data.bills, roomId };
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

export const addBill = createAsyncThunk(
  "bill/addBill",
  async (
    { token, bill }: { token: string; bill: BillFormData },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch("/api/bill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bill),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const text = await res.text();
      if (!text) {
        throw new Error("Empty response from server");
      }

      const data = JSON.parse(text);
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to add bill");
      }
      return data.bill;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const updateBill = createAsyncThunk(
  "bill/updateBill",
  async (
    {
      token,
      billId,
      bill,
    }: { token: string; billId: number; bill: BillFormData },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`/api/bill/${billId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bill),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const text = await res.text();
      if (!text) {
        throw new Error("Empty response from server");
      }

      const data = JSON.parse(text);
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to update bill");
      }
      return data.bill;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const deleteBill = createAsyncThunk(
  "bill/deleteBill",
  async (
    { token, billId }: { token: string; billId: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`/api/bill/${billId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to delete bill");
      }
      return billId;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const billSlice = createSlice({
  name: "bill",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBills: (state) => {
      state.bills = [];
      state.currentRoomId = null;
      state.error = null;
    },
    // Optimistic update for better UX
    optimisticAddBill: (state, action: PayloadAction<Bill>) => {
      state.bills.unshift(action.payload);
    },
    optimisticUpdateBill: (state, action: PayloadAction<Bill>) => {
      const index = state.bills.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.bills[index] = action.payload;
      }
    },
    optimisticDeleteBill: (state, action: PayloadAction<number>) => {
      state.bills = state.bills.filter((b) => b.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch bills
    builder
      .addCase(fetchBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = action.payload.bills;
        state.currentRoomId = action.payload.roomId;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add bill
    builder
      .addCase(addBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBill.fulfilled, (state, action) => {
        state.loading = false;
        // Check if optimistic update already added it
        const exists = state.bills.find((b) => b.id === action.payload.id);
        if (!exists) {
          state.bills.unshift(action.payload);
        }
      })
      .addCase(addBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update bill
    builder
      .addCase(updateBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBill.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bills.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bills[index] = action.payload;
        }
      })
      .addCase(updateBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete bill
    builder
      .addCase(deleteBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = state.bills.filter((b) => b.id !== action.payload);
      })
      .addCase(deleteBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearBills,
  optimisticAddBill,
  optimisticUpdateBill,
  optimisticDeleteBill,
} = billSlice.actions;

export default billSlice.reducer;
