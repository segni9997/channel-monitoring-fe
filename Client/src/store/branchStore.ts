import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Branch } from "../types";
import { MOCK_BRANCHES } from "../data/mock";

export interface BranchState {
  branches: Branch[];
  addBranch: (branch: Omit<Branch, "id">) => void;
  updateBranch: (id: string, branch: Partial<Omit<Branch, "id">>) => void;
  deleteBranch: (id: string) => void;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      branches: MOCK_BRANCHES,
      addBranch: (branch) =>
        set((state) => ({
          branches: [...state.branches, { ...branch, id: `br_${Date.now()}` }],
        })),
      updateBranch: (id, branch) =>
        set((state) => ({
          branches: state.branches.map((b) => (b.id === id ? { ...b, ...branch } : b)),
        })),
      deleteBranch: (id) =>
        set((state) => ({
          branches: state.branches.filter((b) => b.id !== id),
        })),
    }),
    {
      name: "branch-storage",
    }
  )
);
