import { baseApi } from "./baseApi";
import { type AppChannel } from "@/types";

export const channelApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChannels: builder.query<{ count: number; channels: AppChannel[] } | AppChannel[], void>({
      query: () => '/channels',
      providesTags: ["Product"], // Re-using Product tag for global cache invalidation
    }),
    createChannel: builder.mutation<any, Partial<AppChannel>>({
      query: (body) => ({
        url: '/channels',
        method: 'POST',
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    updateChannel: builder.mutation<any, { id: string; body: Partial<AppChannel> }>({
      query: ({ id, body }) => ({
        url: `/channels/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteChannel: builder.mutation<any, string>({
      query: (id) => ({
        url: `/channels/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetChannelsQuery,
  useLazyGetChannelsQuery,
  useCreateChannelMutation,
  useUpdateChannelMutation,
  useDeleteChannelMutation,
} = channelApi;
