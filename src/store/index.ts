import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import dormReducer from "./dormSlice";
import roomReducer from "./roomSlice";
import billReducer from "./billSlice";
import rentalContractReducer from "./rentalContractSlice";
import tenantReducer from "./tenantSlice";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";

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
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
export default store;
