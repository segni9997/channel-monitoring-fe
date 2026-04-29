import { create } from "zustand";
import { persist } from "zustand/middleware";
import { format, subDays } from "date-fns";

interface DashboardState {
  fromDate: string;
  toDate: string;
  setFromDate: (date: string) => void;
  setToDate: (date: string) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      fromDate: format(subDays(new Date(), 7), "yyyy-MM-dd"),
      toDate: format(new Date(), "yyyy-MM-dd"),
      setFromDate: (date) => set({ fromDate: date }),
      setToDate: (date) => set({ toDate: date }),
    }),
    {
      name: "dashboard-storage",
    }
  )
);
