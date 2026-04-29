import { baseApi } from "./baseApi";
import { type Branch } from "@/types";

export const branchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBranches: builder.query<{ count: number; branches: Branch[] } | Branch[], void>({
      query: () => '/branches',
      providesTags: ["Product"], // Assuming we want to cache/invalidate, or use a new tag
    }),
    createBranch: builder.mutation<any, Partial<Branch> | Partial<Branch>[]>({
      query: (body) => ({
        url: '/branches',
        method: 'POST',
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    updateBranch: builder.mutation<any, { id: string; body: Partial<Branch> }>({
      query: ({ id, body }) => ({
        url: `/branches/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteBranch: builder.mutation<any, string>({
      query: (id) => ({
        url: `/branches/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetBranchesQuery,
  useLazyGetBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} = branchApi;
