import { baseApi } from "./baseApi";
import { type Reason } from "@/types";

export const reasonApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReasons: builder.query<{ count: number; reasons: Reason[] } | Reason[], { channel_id?: string } | void>({
      query: (params) => {
        let url = '/reasons';
        if (params && params.channel_id) {
          url += `?channel_id=${params.channel_id}`;
        }
        return url;
      },
      providesTags: ["Product"],
    }),
    createReason: builder.mutation<any,  {
      name: string;
      channel_id: string;
      responsible_dept: string;
    }>({
      query: (body) => ({
        url: '/reasons',
        method: 'POST',
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    updateReason: builder.mutation<any, { id: string; body: {
        name: string;
        channel_id: string;
        responsible_dept: string;
      } }>({
      query: ({ id, body }) => ({
        url: `/reasons/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteReason: builder.mutation<any, string>({
      query: (id) => ({
        url: `/reasons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const { 
  useGetReasonsQuery, 
  useLazyGetReasonsQuery,
  useCreateReasonMutation,
  useUpdateReasonMutation,
  useDeleteReasonMutation,
} = reasonApi;

