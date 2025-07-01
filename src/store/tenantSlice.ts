import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface Tenant {
  id: number;
  name: string;
  phone: string;
  idCard?: string;
  address: string;
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
}

interface Room {
  id: number;
  name: string;
  price: number;
  dormitory: {
    id: number;
    name: string;
  };
}

interface TenantFormData {
  id?: number;
  name: string;
  phone: string;
  idCard?: string;
  address: string;
  password?: string;
  roomIds: number[];
}

interface TenantState {
  tenants: Tenant[];
  rooms: Room[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
}

const initialState: TenantState = {
  tenants: [],
  rooms: [],
  loading: false,
  error: null,
  submitting: false,
};

// Async thunk สำหรับ fetch tenants
export const fetchTenants = createAsyncThunk(
  "tenant/fetchTenants",
  async ({ token }: { token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/tenant", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to fetch tenants");
      }
      return data.tenants;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

// Async thunk สำหรับ fetch rooms
export const fetchRooms = createAsyncThunk(
  "tenant/fetchRooms",
  async ({ token }: { token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/room", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to fetch rooms");
      }
      return data.rooms;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

// Async thunk สำหรับ add tenant
export const addTenant = createAsyncThunk(
  "tenant/addTenant",
  async (
    { token, tenant }: { token: string; tenant: TenantFormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/tenant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tenant),
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to add tenant");
      }
      return data.tenant;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

// Async thunk สำหรับ update tenant
export const updateTenant = createAsyncThunk(
  "tenant/updateTenant",
  async (
    { token, tenant }: { token: string; tenant: TenantFormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/tenant", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tenant),
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to update tenant");
      }
      return data.tenant;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

// Async thunk สำหรับ delete tenant
export const deleteTenant = createAsyncThunk(
  "tenant/deleteTenant",
  async (
    { token, tenantId }: { token: string; tenantId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/tenant", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: tenantId }),
      });
      const data = await response.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to delete tenant");
      }
      return tenantId;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTenants: (state) => {
      state.tenants = [];
      state.rooms = [];
      state.error = null;
    },
    // Optimistic update actions
    addTenantOptimistic: (state, action: PayloadAction<Tenant>) => {
      state.tenants.unshift(action.payload);
    },
    updateTenantOptimistic: (state, action: PayloadAction<Tenant>) => {
      const index = state.tenants.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tenants[index] = action.payload;
      }
    },
    deleteTenantOptimistic: (state, action: PayloadAction<number>) => {
      state.tenants = state.tenants.filter((t) => t.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch tenants
    builder
      .addCase(fetchTenants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.loading = false;
        state.tenants = action.payload;
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch rooms
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add tenant
    builder
      .addCase(addTenant.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(addTenant.fulfilled, (state, action) => {
        state.submitting = false;
        // Re-fetch tenants after successful add
        // The tenant is already added optimistically, so we just need to update with server response
        const index = state.tenants.findIndex(
          (t) => t.id === action.payload.id
        );
        if (index === -1) {
          state.tenants.unshift(action.payload);
        } else {
          state.tenants[index] = action.payload;
        }
      })
      .addCase(addTenant.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });

    // Update tenant
    builder
      .addCase(updateTenant.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateTenant.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.tenants.findIndex(
          (t) => t.id === action.payload.id
        );
        if (index !== -1) {
          state.tenants[index] = action.payload;
        }
      })
      .addCase(updateTenant.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });

    // Delete tenant
    builder
      .addCase(deleteTenant.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteTenant.fulfilled, (state, action) => {
        state.submitting = false;
        state.tenants = state.tenants.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTenant.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearTenants,
  addTenantOptimistic,
  updateTenantOptimistic,
  deleteTenantOptimistic,
} = tenantSlice.actions;

export default tenantSlice.reducer;
