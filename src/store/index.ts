import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import dormReducer from "./dormSlice";
import roomReducer from "./roomSlice";
import billReducer from "./billSlice";
import rentalContractReducer from "./rentalContractSlice";
import tenantReducer from "./tenantSlice";
import expenseReducer from "./expenseSlice";
import recurringExpenseReducer from "./recurringExpenseSlice";
import dashboardReducer from "./dashboardSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  dorm: dormReducer,
  room: roomReducer,
  bill: billReducer,
  rentalContract: rentalContractReducer,
  tenant: tenantReducer,
  expense: expenseReducer,
  recurringExpense: recurringExpenseReducer,
  dashboard: dashboardReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredActionPaths: ["register", "rehydrate"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
export default store;
