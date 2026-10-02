// src/store/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/auth.service";
import type { Credentials, User } from "@/types/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (c: Credentials) => Promise<boolean>;
  register: (c: Credentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      login: async (c) => {
        set({ loading: true, error: null });
        try {
          set({ user: await authService.login(c), loading: false });
          return true;
        } catch (e) {
          set({ error: (e as Error).message, loading: false });
          return false;
        }
      },

      register: async (c) => {
        set({ loading: true, error: null });
        try {
          await authService.register(c);
          set({ loading: false });
          return true;
        } catch (e) {
          set({ error: (e as Error).message, loading: false });
          return false;
        }
      },

      logout: () => set({ user: null, error: null }),
      clearError: () => set({ error: null }),
    }),
    { name: "auth", partialize: (s) => ({ user: s.user }) }
  )
);