import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Department } from "../types";
import { MOCK_DEPARTMENTS } from "../data/mock";

export interface DepartmentState {
  departments: Department[];
  addDepartment: (name: string) => void;
  updateDepartment: (id: string, name: string) => void;
  deleteDepartment: (id: string) => void;
}

export const useDepartmentStore = create<DepartmentState>()(
  persist(
    (set) => ({
      departments: MOCK_DEPARTMENTS,
      addDepartment: (name) =>
        set((state) => ({
          departments: [...state.departments, { id: `dept_${Date.now()}`, name }],
        })),
      updateDepartment: (id, name) =>
        set((state) => ({
          departments: state.departments.map((d) => (d.id === id ? { ...d, name } : d)),
        })),
      deleteDepartment: (id) =>
        set((state) => ({
          departments: state.departments.filter((d) => d.id !== id),
        })),
    }),
    {
      name: "department-storage",
    }
  )
);
