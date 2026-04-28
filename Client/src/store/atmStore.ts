import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type ATM } from "../types";
import { MOCK_ATMS } from "../data/mock";

export interface ATMState {
  atms: ATM[];
  addATM: (atm: Omit<ATM, "id">) => void;
  updateATM: (id: string, atm: Partial<Omit<ATM, "id">>) => void;
  deleteATM: (id: string) => void;
  transferATM: (atmId: string, newBranchId: string) => void;
}

export const useATMStore = create<ATMState>()(
  persist(
    (set) => ({
      atms: MOCK_ATMS,
      addATM: (atm) =>
        set((state) => ({
          atms: [...state.atms, { ...atm, id: `atm_${Date.now()}` }],
        })),
      updateATM: (id, atm) =>
        set((state) => ({
          atms: state.atms.map((a) => (a.id === id ? { ...a, ...atm } : a)),
        })),
      deleteATM: (id) =>
        set((state) => ({
          atms: state.atms.filter((a) => a.id !== id),
        })),
      transferATM: (atmId, newBranchId) =>
        set((state) => ({
          atms: state.atms.map((a) => (a.id === atmId ? { ...a, branchId: newBranchId } : a)),
        })),
    }),
    {
      name: "atm-storage",
    }
  )
);
