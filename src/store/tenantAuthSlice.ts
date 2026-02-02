import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface TenantAuthState {
  tenant: {
    id: number;
    name: string;
    phone: string;
    address: string;
    lineUserId?: string;
    displayName?: string;
    pictureUrl?: string;
    rooms?: any[];
    bills?: any[];
    contracts?: any[];
  } | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: TenantAuthState = {
  tenant: null,
  token: null,
  loading: false,
  error: null,
};

// Login with LINE linkCode
export const loginTenantWithLinkCode = createAsyncThunk(
  "tenantAuth/loginWithLinkCode",
  async ({ linkCode, lineUserId }: { linkCode: string; lineUserId?: string }) => {
    const res = await fetch("/api/tenant-auth/login-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkCode, lineUserId }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    
    // Save token to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("tenant_token", data.token);
    }
    return data;
  }
);

// Get current tenant info
export const getTenantMe = createAsyncThunk(
  "tenantAuth/me",
  async (token: string) => {
    console.log("🔄 [getTenantMe] Fetching tenant data...");
    const res = await fetch("/api/tenant-auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log("📥 [getTenantMe] Response:", data);
    if (!data.success) throw new Error(data.message);
    console.log("✅ [getTenantMe] Tenant data:", data.tenant);
    console.log("✅ [getTenantMe] Bills in response:", data.tenant.bills);
    console.log("✅ [getTenantMe] Rooms in response:", data.tenant.rooms);
    return data.tenant;
  }
);

// Logout
export const logoutTenant = createAsyncThunk(
  "tenantAuth/logout",
  async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tenant_token");
    }
    return;
  }
);

const tenantAuthSlice = createSlice({
  name: "tenantAuth",
  initialState,
  reducers: {
    setTenantToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    clearTenantError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login with linkCode
    builder.addCase(loginTenantWithLinkCode.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginTenantWithLinkCode.fulfilled, (state, action) => {
      state.loading = false;
      state.tenant = action.payload.tenant;
      state.token = action.payload.token;
    });
    builder.addCase(loginTenantWithLinkCode.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Login failed";
    });

    // Get tenant me
    builder.addCase(getTenantMe.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getTenantMe.fulfilled, (state, action) => {
      state.loading = false;
      state.tenant = action.payload;
      console.log("✅ Redux: Tenant data updated:", action.payload);
      console.log("✅ Redux: Bills in state:", action.payload.bills);
    });
    builder.addCase(getTenantMe.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch tenant info";
      state.tenant = null;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("tenant_token");
      }
    });

    // Logout
    builder.addCase(logoutTenant.fulfilled, (state) => {
      state.tenant = null;
      state.token = null;
      state.loading = false;
      state.error = null;
    });
  },
});

export const { setTenantToken, clearTenantError } = tenantAuthSlice.actions;
export default tenantAuthSlice.reducer;

