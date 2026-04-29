import { baseApi } from "./baseApi";
import { type ATM } from "@/types";

export const atmApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAtms: builder.query<{ count: number; atms: ATM[] } | ATM[], { branch_id?: string } | void>({
      query: (params) => {
        let url = '/atms';
        if (params && params.branch_id) {
          url += `?branch_id=${params.branch_id}`;
        }
        return url;
      },
      providesTags: ["Product"],
    }),
    createAtm: builder.mutation<any, Partial<ATM> | Partial<ATM>[]>({
      query: (body) => ({
        url: '/atms',
        method: 'POST',
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    updateAtm: builder.mutation<any, { id: string; body: Partial<ATM> }>({
      query: ({ id, body }) => ({
        url: `/atms/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteAtm: builder.mutation<any, string>({
      query: (id) => ({
        url: `/atms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const { 
  useGetAtmsQuery, 
  useLazyGetAtmsQuery,
  useCreateAtmMutation,
  useUpdateAtmMutation,
  useDeleteAtmMutation,
} = atmApi;

