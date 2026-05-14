import { baseApi } from "./baseApi";

export interface SystemSettings {
  shift_time?: number;
  [key: string]: any;
}

export interface ShiftInfo {
  shift_start_time?: string;
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

    getShiftInfo: builder.query<ShiftInfo, void>({
      query: () => ({
        url: "/settings/shift-info",
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

    setShiftStartTime: builder.mutation<any, { shift_start_time: string }>({
      query: (body) => ({
        url: "/admin/settings/shift-start-time",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSettingsQuery,
  useGetShiftInfoQuery,
  useUpdateSettingsMutation,
  useSetShiftStartTimeMutation,
} = settingsApi;
