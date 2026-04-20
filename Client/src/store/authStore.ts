import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_USERS } from "../data/mock";
import type { User, Role } from "../types";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (email: string, password: string) => {
        const found = MOCK_USERS.find((u) => u.email === email && u.password === password);
        if (found) {
          set({ user: found, isAuthenticated: true });
          return true;
        }
        return false;
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
      // Migrate stale user object (e.g. if it has 'name' instead of 'firstName')
      onRehydrateStorage: () => (state) => {
        if (state && state.user && (state.user as any).name) {
          console.warn("Stale auth data detected, resetting session...");
          state.user = null;
          state.isAuthenticated = false;
        }
      },
    }
  )
);
