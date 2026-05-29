import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  // persist salva o estado no localStorage automaticamente
  // assim o usuário continua logado após recarregar a página
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user: User, token: string) => {
        // Salva o token no localStorage para o interceptor do axios usar
        localStorage.setItem("access_token", token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        // Limpa o token e o estado do usuário
        localStorage.removeItem("access_token");
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "nexus-auth", // chave no localStorage
      // Persiste apenas os dados essenciais — não o token em si
      // pois o axios já lê direto do localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);