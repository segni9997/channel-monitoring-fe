import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type User } from "../types";
import { MOCK_USERS } from "../data/mock";

export interface UserState {
  users: User[];
  page: number;
  pageSize: number;
  addUser: (user: Omit<User, "id">) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      users: MOCK_USERS,
      page: 1,
      pageSize: 10,
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      addUser: (user) =>
        set((state) => ({
          users: [...state.users, { ...user, id: `usr_${Date.now()}` }],
        })),
      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        })),
      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        })),
    }),
    {
      name: "user-management-storage",
      onRehydrateStorage: () => (state) => {
        if (state && state.users && state.users.some((u: any) => u.name)) {
          console.warn("Stale user data detected, resetting user list...");
          state.users = MOCK_USERS;
        }
      },
    }
  )
);
