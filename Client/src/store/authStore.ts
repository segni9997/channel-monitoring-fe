import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Role } from "../types";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  hasRole: (role: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      hasRole: (roles: Role[]) => {
        const currentUser = get().user;
        if (!currentUser) return false;
        return roles.includes(currentUser.role);
      },
    }),
    {
      name: "auth-storage",
    }
  )
);