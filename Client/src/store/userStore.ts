import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserState {
  page: number;
  pageSize: number;

  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      page: 1,
      pageSize: 10,
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
     
    }),
    {
      name: "user-management-storage",
    
    }
  )
);
