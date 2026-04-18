import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Incident, Status } from "../types";
import { MOCK_INCIDENTS } from "../data/mock";
import { calculateDuration } from "../utils/duration";

export interface IncidentState {
  incidents: Incident[];
  page: number;
  pageSize: number;
  fetchIncidents: () => void;
  addIncident: (incident: Omit<Incident, "duration" | "status" | "id">) => void;
  updateIncident: (id: string, updates: Partial<Incident>) => void;
  deleteIncident: (id: string) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export const useIncidentStore = create<IncidentState>()(
  persist(
    (set) => ({
      incidents: MOCK_INCIDENTS,
      page: 1,
      pageSize: 10,
      fetchIncidents: () => {
        // Typically an API call here. We already have defaults loaded.
      },
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      addIncident: (data) =>
        set((state) => {
          let statusStr: Status = Status.PENDING;
          let durationVal: number | undefined = undefined;

          if (data.downtimeEnd) {
            statusStr = Status.COMPLETED;
            durationVal = calculateDuration(data.downtimeStart, data.downtimeEnd);
          }

          const newIncident: Incident = {
            ...data,
            id: `inc_${Date.now()}`,
            status: statusStr,
            duration: durationVal,
          };
          return { incidents: [newIncident, ...state.incidents] };
        }),
      updateIncident: (id: string, updates: Partial<Incident>) =>
        set((state) => {
          const updatedIncidents = state.incidents.map((inc) => {
            if (inc.id !== id) return inc;
            
            const merged = { ...inc, ...updates };

            // Recalculate duration if end time is newly provided or modified
            if (merged.downtimeEnd && merged.downtimeStart) {
               merged.duration = calculateDuration(merged.downtimeStart, merged.downtimeEnd);
               merged.status = Status.COMPLETED;
            }

            return merged;
          });
          return { incidents: updatedIncidents };
        }),
      deleteIncident: (id: string) =>
        set((state) => ({
          incidents: state.incidents.filter((inc) => inc.id !== id),
        })),
    }),
    {
      name: "incident-storage",
    }
  )
);
