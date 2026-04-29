import { baseApi } from "./baseApi";
import { type Incident } from "@/types";

export interface GetIncidentsParams {
  from_date?: string;
  to_date?: string;
  status?: string;
  reason_id?: string;
  channel?: string;
  branch_id?: string;
  atm_id?: string;
}

export const incidentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getIncidents: builder.query<any, GetIncidentsParams | void>({
      query: (params) => {
        let url = '/inventory/incidents';
        if (params) {
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== "") {
              queryParams.append(key, value as string);
            }
          });
          const queryString = queryParams.toString();
          if (queryString) {
            url += `?${queryString}`;
          }
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["Product"], // Re-using Product tag or we should add 'Incident' tag in baseApi
    }),
    getIncident: builder.query<any, string>({
      query: (id) => `/inventory/incidents/${id}`,
    }),
    createIncident: builder.mutation<any, Partial<Incident>>({
      query: (body) => ({
        url: '/inventory/incidents',
        method: 'POST',
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    createAtmIncident: builder.mutation<any, Partial<Incident>>({
      query: (body) => ({
        url: '/inventory/incidents/atm',
        method: 'POST',
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    updateIncident: builder.mutation<any, { id: string; body: Partial<Incident> }>({
      query: ({ id, body }) => ({
        url: `/inventory/incidents/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteIncident: builder.mutation<any, string>({
      query: (id) => ({
        url: `/inventory/incidents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const { 
  useGetIncidentsQuery, 
  useLazyGetIncidentsQuery,
  useGetIncidentQuery,
  useCreateIncidentMutation,
  useCreateAtmIncidentMutation,
  useUpdateIncidentMutation,
  useDeleteIncidentMutation
} = incidentApi;
