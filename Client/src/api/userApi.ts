import { baseApi } from "./baseApi";
import type { User, Role } from "@/types";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // 🔵 GET ALL USERS
    getUsers: builder.query<User[], void>({
      query: () => ({
        url: "/admin/users",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        console.log("response", response)
        return response
      }
    
    }),

    // 🟢 CREATE USER
    createUser: builder.mutation<
      User,
      {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        role: Role;
        password: string;
      }
    >({
      query: (body) => ({
        url: "/admin/users",
        method: "POST",
        body,
      }),
    //   invalidatesTags: ["Users"],
    }),

    // 🟡 UPDATE USER
    updateUser: builder.mutation<
      User,
      {
        id: number;
        data: Partial<{
          firstName: string;
          lastName: string;
          email: string;
          phoneNumber: string;
          role: Role;
        }>;
      }
    >({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}`,
        method: "POST", // your backend uses POST for update
        body: data,
      }),
    //   invalidatesTags: ["Users"],
    }),

    // 🔴 TOGGLE ADMIN STATUS (Super Admin only)
    toggleAdminStatus: builder.mutation<any, { id: number | string }>({
      query: ({ id }) => ({
        url: `/super-admin/admins/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["Admin", "User"],
    }),

    // 🟢 CREATE ADMIN USER (Super Admin only)
    createAdmin: builder.mutation<
      any,
      {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        password: string;
      }
    >({
      query: (body) => ({
        url: "/super-admin/admins",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Admin", "User"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useToggleAdminStatusMutation,
  useCreateAdminMutation,
} = usersApi;