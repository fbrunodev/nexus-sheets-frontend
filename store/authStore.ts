import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean; // indica se já leu o localStorage

  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,

      setAuth: (user: User, token: string) => {
        localStorage.setItem("access_token", token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("access_token");
        set({ user: null, token: null, isAuthenticated: false });
      },

      setHasHydrated: (value: boolean) => {
        set({ hasHydrated: value });
      },
    }),
    {
      name: "nexus-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // Chamado quando o Zustand termina de ler o localStorage
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);