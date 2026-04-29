import { baseApi } from "./baseApi";
import { type Department } from "@/types";

export const departmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query<{ count: number; departments: Department[] } | Department[], void>({
      query: () => '/departments',
      providesTags: ["Product"], // Re-using Product tag or we should add 'Department' tag in baseApi
    }),
    createDepartment: builder.mutation<any, Partial<Department> | Partial<Department>[]>({
      query: (body) => ({
        url: '/departments',
        method: 'POST',
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    updateDepartment: builder.mutation<any, { id: string; body: Partial<Department> }>({
      query: ({ id, body }) => ({
        url: `/departments/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteDepartment: builder.mutation<any, string>({
      query: (id) => ({
        url: `/departments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useLazyGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentApi;
