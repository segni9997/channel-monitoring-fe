import { baseApi } from "./baseApi";

export interface AuditLog {
  id: string | number;
  action: string;
  details?: string;
  user_name?: string;
  user_id?: string | number;
  ip_address?: string;
  created_at?: string;
  [key: string]: any;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
}

export interface GetAuditLogsParams {
  page?: number;
  pageSize?: number;
}

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLogsResponse, GetAuditLogsParams | void>({
      query: (params) => ({
        url: `/super-admin/logs`,
        method: "GET",
        params: params ? { page: (params as GetAuditLogsParams).page ?? 1 } : undefined,
      }),
      transformResponse: (response: any): AuditLogsResponse => {
        if (Array.isArray(response)) {
          return {
            data: response,
            total: response.length,
            current_page: 1,
            last_page: 1,
            per_page: response.length,
          };
        }
        return {
          data: response.data ?? [],
          total: response.total ?? 0,
          current_page: response.current_page ?? 1,
          last_page: response.last_page ?? 1,
          per_page: response.per_page ?? 50,
        };
      },
      providesTags: ["AuditLog"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAuditLogsQuery } = auditApi;
