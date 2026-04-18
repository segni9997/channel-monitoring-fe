import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DashboardState {
  timeRange: string;
  setTimeRange: (range: string) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      timeRange: "daily",
      setTimeRange: (range) => set({ timeRange: range }),
    }),
    {
      name: "dashboard-storage",
    }
  )
);
