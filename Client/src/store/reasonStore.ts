import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Reason } from "../types";
import { MOCK_REASONS } from "../data/mock";

export interface ReasonState {
  reasons: Reason[];
  page: number;
  pageSize: number;
  addReason: (reason: Omit<Reason, "id">) => void;
  updateReason: (id: string, description: string) => void;
  deleteReason: (id: string) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export const useReasonStore = create<ReasonState>()(
  persist(
    (set) => ({
      reasons: MOCK_REASONS,
      page: 1,
      pageSize: 10,
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      addReason: (reason) =>
        set((state) => ({
          reasons: [...state.reasons, { ...reason, id: `rsn_${Date.now()}` }],
        })),
      updateReason: (id, description) =>
        set((state) => ({
          reasons: state.reasons.map((r) => (r.id === id ? { ...r, description } : r)),
        })),
      deleteReason: (id) =>
        set((state) => ({
          reasons: state.reasons.filter((r) => r.id !== id),
        })),
    }),
    {
      name: "reason-storage",
    }
  )
);
