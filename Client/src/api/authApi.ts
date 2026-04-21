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

    // 🟢 LOGIN
    adminlogin: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/login/admin",
        method: "POST",
        body: credentials,
      }),
    }),
      userlogin: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/login/users",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

export const {
  useSignupMutation,
  useAdminloginMutation,
  useUserloginMutation,
} = authApi;