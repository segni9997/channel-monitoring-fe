import { baseApi } from "./baseApi";

export interface AuditLog {
  id: string | number;
  action: string;
  description?: string;
  user?: string;
  userId?: number;
  ipAddress?: string;
  createdAt?: string;
  created_at?: string;
  [key: string]: any;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface GetAuditLogsParams {
  page?: number;
  pageSize?: number;
  limit?: number;
}

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLogsResponse, GetAuditLogsParams | void>({
      query: () => {
        return {
          url: `/super-admin/logs`,
          method: "GET",
        };
      },
      transformResponse: (response: any): AuditLogsResponse => {
        // Handle various response shapes
        if (Array.isArray(response)) {
          return { data: response, total: response.length, page: 1, pageSize: response.length };
        }
        return response;
      },
      providesTags: ["AuditLog"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAuditLogsQuery } = auditApi;
