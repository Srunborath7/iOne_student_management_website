// src/store/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService, type Credentials, type User } from "@/src/services/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  login: (c: Credentials) => Promise<boolean>;
  register: (c: Credentials) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearFeedback: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      successMessage: null,

      login: async (credentials) => {
        set({ loading: true, error: null, successMessage: null });
        try {
          const res = await authService.login(credentials);
          set({
            user: res.user,
            token: res.access_token,
            loading: false,
            successMessage: res.message || "Logged in successfully!",
          });
          return true;
        } catch (e) {
          set({
            error: (e as Error).message || "Failed to log in",
            loading: false,
          });
          return false;
        }
      },

      register: async (credentials) => {
        set({ loading: true, error: null, successMessage: null });
        try {
          await authService.register(credentials);
          set({
            loading: false,
            successMessage: "Account registered successfully! You can now log in.",
          });
          return true;
        } catch (e) {
          set({
            error: (e as Error).message || "Registration failed",
            loading: false,
          });
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null, successMessage: null });
      },

      checkAuth: async () => {
        const currentToken = get().token;
        if (!currentToken) {
          set({ user: null });
          return;
        }
        try {
          const user = await authService.getCurrentUser();
          set({ user });
        } catch {
          // Token expired or invalid
          set({ user: null, token: null });
        }
      },

      clearFeedback: () => set({ error: null, successMessage: null }),
    }),
    {
      name: "ione_auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);