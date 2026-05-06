import { baseApi } from "./baseApi";

export interface SystemSettings {
  shift_time?: number;
  [key: string]: any;
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<SystemSettings, void>({
      query: () => ({
        url: "/admin/settings",
        method: "GET",
      }),
      providesTags: ["Settings"],
    }),

    updateSettings: builder.mutation<SystemSettings, Partial<SystemSettings>>({
      query: (body) => ({
        url: "/admin/settings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
