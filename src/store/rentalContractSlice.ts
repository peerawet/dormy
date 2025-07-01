import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface RentalContract {
  id: number;
  startDate: string;
  endDate: string;
  tenantId: number;
  tenant: {
    id: number;
    name: string;
    phone: string;
  };
  roomId: number;
}

interface RentalContractFormData {
  tenantId: number;
  startDate: string;
  endDate: string;
  roomId: number;
}

interface RentalContractState {
  contracts: RentalContract[];
  loading: boolean;
  error: string | null;
  currentRoomId: string | null;
}

const initialState: RentalContractState = {
  contracts: [],
  loading: false,
  error: null,
  currentRoomId: null,
};

// Async thunks
export const fetchContracts = createAsyncThunk(
  "rentalContract/fetchContracts",
  async (
    { roomId, token }: { roomId: string; token: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`/api/rental-contract?roomId=${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to fetch contracts");
      }
      return { contracts: data.contracts, roomId };
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

export const addContract = createAsyncThunk(
  "rentalContract/addContract",
  async (
    { token, contract }: { token: string; contract: RentalContractFormData },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch("/api/rental-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(contract),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to add contract");
      }
      return data.contract;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const updateContract = createAsyncThunk(
  "rentalContract/updateContract",
  async (
    {
      token,
      contractId,
      contract,
    }: { token: string; contractId: number; contract: RentalContractFormData },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch("/api/rental-contract", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: contractId, ...contract }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to update contract");
      }
      return data.contract;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const deleteContract = createAsyncThunk(
  "rentalContract/deleteContract",
  async (
    {
      token,
      contractId,
      roomId,
    }: { token: string; contractId: number; roomId: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch("/api/rental-contract", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: contractId, roomId }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to delete contract");
      }
      return contractId;
    } catch (error: any) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const rentalContractSlice = createSlice({
  name: "rentalContract",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearContracts: (state) => {
      state.contracts = [];
      state.currentRoomId = null;
      state.error = null;
    },
    // Optimistic update for better UX
    optimisticAddContract: (state, action: PayloadAction<RentalContract>) => {
      state.contracts.unshift(action.payload);
    },
    optimisticUpdateContract: (
      state,
      action: PayloadAction<RentalContract>
    ) => {
      const index = state.contracts.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.contracts[index] = action.payload;
      }
    },
    optimisticDeleteContract: (state, action: PayloadAction<number>) => {
      state.contracts = state.contracts.filter((c) => c.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch contracts
    builder
      .addCase(fetchContracts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContracts.fulfilled, (state, action) => {
        state.loading = false;
        state.contracts = action.payload.contracts;
        state.currentRoomId = action.payload.roomId;
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add contract
    builder
      .addCase(addContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addContract.fulfilled, (state, action) => {
        state.loading = false;
        // Remove optimistic update and add real data
        state.contracts = state.contracts.filter((c) => !c.id || c.id > 0);
        state.contracts.unshift(action.payload);
      })
      .addCase(addContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Remove failed optimistic update
        state.contracts = state.contracts.filter((c) => !c.id || c.id > 0);
      });

    // Update contract
    builder
      .addCase(updateContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContract.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.contracts.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.contracts[index] = action.payload;
        }
      })
      .addCase(updateContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete contract
    builder
      .addCase(deleteContract.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContract.fulfilled, (state, action) => {
        state.loading = false;
        state.contracts = state.contracts.filter(
          (c) => c.id !== action.payload
        );
      })
      .addCase(deleteContract.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearContracts,
  optimisticAddContract,
  optimisticUpdateContract,
  optimisticDeleteContract,
} = rentalContractSlice.actions;

export default rentalContractSlice.reducer;
