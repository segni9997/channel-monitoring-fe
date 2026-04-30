import type { Role } from "@/types";
import { baseApi } from "./baseApi";

interface LoginRequest {
email:string;
password:string;

}

interface LoginResponse {
  message: string;
  token:string;

  user: {
    id: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    role: Role;
    created_at: string;
    updated_at: string;
  }
} 
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

    // 🟢 LOGIN ENDPOINTS
    superAdminLogin: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/login/super-admin",
        method: "POST",
        body: credentials,
      }),
    }),

    adminLogin: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/login/admin",
        method: "POST",
        body: credentials,
      }),
    }),

    userLogin: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/login/user",
        method: "POST",
        body: credentials,
      }),
    }),

    // 🟢 GET CURRENT USER
    getMe: builder.query<LoginResponse["user"], void>({
      query: () => ({
        url: "/user",
        method: "GET",
      }),
    }),

    // 🟢 CHANGE PASSWORD
    changePassword: builder.mutation<{ message: string }, { old_password: string; new_password: string; new_password_confirmation: string }>({
      query: (body) => ({
        url: "/settings/change-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useSignupMutation,
  useSuperAdminLoginMutation,
  useAdminLoginMutation,
  useUserLoginMutation,
  useGetMeQuery,
  useChangePasswordMutation,
} = authApi;