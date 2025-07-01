import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface Room {
  id: number;
  name: string;
  price: number;
  floor?: number;
  waterRate?: number; // Float - supports decimal values like 3.50
  electricRate?: number; // Float - supports decimal values like 4.25
  waterFlat?: number;
  electricFlat?: number;
  commonFee?: number;
  otherFee?: number;
  rentalContracts?: any[];
}

interface Dormitory {
  id: number;
  name: string;
  address: string;
}

interface RoomState {
  currentRoom: Room | null;
  currentDormitory: Dormitory | null;
  loading: boolean;
  error: string | null;
  activeTab: "contract" | "bill";
}

const initialState: RoomState = {
  currentRoom: null,
  currentDormitory: null,
  loading: false,
  error: null,
  activeTab: "contract",
};

// Async thunk สำหรับ fetch room detail
export const fetchRoomDetail = createAsyncThunk(
  "room/fetchRoomDetail",
  async (
    { roomId, token }: { roomId: string; token: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`/api/room/detail?roomId=${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to fetch room detail");
      }
      return { room: data.room, dormitory: data.dormitory };
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

// Room CRUD thunks
export const addRoom = createAsyncThunk(
  "room/addRoom",
  async (
    { token, room }: { token: string; room: any },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(room),
      });
      const data = await res.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to add room");
      }
      return { dormitoryId: room.dormitoryId, room: data.room };
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

export const editRoom = createAsyncThunk(
  "room/editRoom",
  async (
    { token, room }: { token: string; room: any },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch("/api/room", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(room),
      });
      const data = await res.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to edit room");
      }
      return { dormitoryId: room.dormitoryId, room: data.room };
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

export const deleteRoom = createAsyncThunk(
  "room/deleteRoom",
  async (
    {
      token,
      roomId,
      dormitoryId,
    }: { token: string; roomId: number; dormitoryId: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch("/api/room", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: roomId, dormitoryId }),
      });
      const data = await res.json();
      if (!data.success) {
        return rejectWithValue(data.message || "Failed to delete room");
      }
      return { roomId, dormitoryId };
    } catch (error) {
      return rejectWithValue("Network error");
    }
  }
);

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<"contract" | "bill">) => {
      state.activeTab = action.payload;
    },
    clearRoomData: (state) => {
      state.currentRoom = null;
      state.currentDormitory = null;
      state.error = null;
      state.activeTab = "contract";
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch room detail
    builder
      .addCase(fetchRoomDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoomDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoom = action.payload.room;
        state.currentDormitory = action.payload.dormitory;
      })
      .addCase(fetchRoomDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Room CRUD operations
    builder
      .addCase(addRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRoom.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(editRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editRoom.fulfilled, (state, action) => {
        state.loading = false;
        // Update current room if it's the same room being edited
        if (
          state.currentRoom &&
          state.currentRoom.id === action.payload.room.id
        ) {
          state.currentRoom = action.payload.room;
        }
      })
      .addCase(editRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.loading = false;
        // Clear current room if it's the same room being deleted
        if (
          state.currentRoom &&
          state.currentRoom.id === action.payload.roomId
        ) {
          state.currentRoom = null;
        }
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveTab, clearRoomData, clearError } = roomSlice.actions;
export default roomSlice.reducer;
