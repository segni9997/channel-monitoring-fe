import { baseApi } from "@/api/baseApi";
;
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    // [authApi.reducerPath]:authApi.reducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});