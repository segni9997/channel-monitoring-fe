import { baseApi } from "./baseApi";

interface DashboardResponse {
  total_incidents: number;
  pending_incidents: number;
  completed_incidents: number;
  total_down_time: number;
  filter_applied: string;
  downtime_per_channel: Record<
    string,
    {
      incident_count: number;
      total_downtime: number;
    }
  >;
  incident_trends: Record<string, number>;
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // 🔵 DASHBOARD
    dashboard: builder.query<
      DashboardResponse,
      { fromDate: string; toDate: string }
    >({
      query: ({ fromDate, toDate }) => ({
        url: `/admin/dashboard?from=${fromDate}&to=${toDate}`,
        method: "GET",
      }),
    }),

   

  }),
});

export const {
  useDashboardQuery,
  useLazyDashboardQuery,
} = dashboardApi;