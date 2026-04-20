import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["User", "Auth", "Product"],
  endpoints: () => ({}), 
});