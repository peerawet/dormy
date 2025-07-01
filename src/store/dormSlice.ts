import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { addRoom, editRoom, deleteRoom } from "./roomSlice";

interface Tenant {
  id: number;
  name: string;
  phone: string;
  address?: string;
}

interface TenantRoom {
  tenant: Tenant;
}

interface RentalContract {
  id: number;
  startDate: string;
  endDate: string;
  tenant: {
    id: number;
    name: string;
    phone: string;
  };
}

interface Room {
  id: number;
  name: string;
  price: number;
  waterRate?: number;
  electricRate?: number;
  waterFlat?: number;
  electricFlat?: number;
  commonFee?: number;
  otherFee?: number;
  tenantRooms?: TenantRoom[];
  rentalContracts?: RentalContract[];
}

interface Dormitory {
  id: number;
  name: string;
  address: string;
  rooms: Room[];
}

interface DormState {
  dorms: Dormitory[];
  loading: boolean;
  error: string | null;
}

const initialState: DormState = {
  dorms: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchDorms = createAsyncThunk(
  "dorm/fetchDorms",
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/dormitory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to fetch dorms");
      }
      return data.dorms;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

export const addDorm = createAsyncThunk(
  "dorm/addDorm",
  async (
    { token, dorm }: { token: string; dorm: { name: string; address: string } },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch("/api/dormitory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dorm),
      });
      const data = await res.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to add dorm");
      }
      return data.dorm;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

export const editDorm = createAsyncThunk(
  "dorm/editDorm",
  async (
    {
      token,
      id,
      dorm,
    }: { token: string; id: number; dorm: { name: string; address: string } },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch("/api/dormitory", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, ...dorm }),
      });
      const data = await res.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to edit dorm");
      }
      return { id, ...dorm };
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

export const deleteDorm = createAsyncThunk(
  "dorm/deleteDorm",
  async ({ token, id }: { token: string; id: number }, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/dormitory", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to delete dorm");
      }
      return id;
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

const dormSlice = createSlice({
  name: "dorm",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch dorms
    builder
      .addCase(fetchDorms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDorms.fulfilled, (state, action) => {
        state.loading = false;
        state.dorms = action.payload;
      })
      .addCase(fetchDorms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add dorm
    builder
      .addCase(addDorm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDorm.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure rooms array exists for new dorm
        const newDorm = {
          ...action.payload,
          rooms: action.payload.rooms || [],
        };
        state.dorms.push(newDorm);
      })
      .addCase(addDorm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Edit dorm
    builder
      .addCase(editDorm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editDorm.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.dorms.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          // Preserve existing rooms when updating dorm
          state.dorms[index] = {
            ...state.dorms[index],
            ...action.payload,
            rooms: state.dorms[index].rooms,
          };
        }
      })
      .addCase(editDorm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete dorm
    builder
      .addCase(deleteDorm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDorm.fulfilled, (state, action) => {
        state.loading = false;
        state.dorms = state.dorms.filter((d) => d.id !== action.payload);
      })
      .addCase(deleteDorm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Listen to room actions from roomSlice
    builder
      .addCase(addRoom.fulfilled, (state, action) => {
        const dorm = state.dorms.find(
          (d) => d.id === action.payload.dormitoryId
        );
        if (dorm) {
          dorm.rooms.push(action.payload.room);
        }
      })
      .addCase(editRoom.fulfilled, (state, action) => {
        const dorm = state.dorms.find(
          (d) => d.id === action.payload.dormitoryId
        );
        if (dorm) {
          const roomIndex = dorm.rooms.findIndex(
            (r) => r.id === action.payload.room.id
          );
          if (roomIndex !== -1) {
            dorm.rooms[roomIndex] = action.payload.room;
          }
        }
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        const dorm = state.dorms.find(
          (d) => d.id === action.payload.dormitoryId
        );
        if (dorm) {
          dorm.rooms = dorm.rooms.filter((r) => r.id !== action.payload.roomId);
        }
      });
  },
});

export const { clearError } = dormSlice.actions;
export default dormSlice.reducer;
