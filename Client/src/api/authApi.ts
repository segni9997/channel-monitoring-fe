import { baseApi } from "./baseapi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🟢 SIGNUP
    signup: builder.mutation({
      query: (userData) => ({
        url: "/auth/signup",
        method: "POST",
        body: userData,
      }),
    }),

    // 🟢 LOGIN
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
} = authApi;