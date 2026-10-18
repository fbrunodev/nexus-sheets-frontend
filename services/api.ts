import axios from "axios";

// Instância base do axios apontando para o backend
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de requisição — injeta o token JWT automaticamente
// em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  // Lê o token do localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor de resposta — redireciona para login se token expirar.
// Rotas de autenticação (login, register) ficam de fora: o 401 delas
// deve ser tratado pela própria tela, não causar um redirect.
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url ?? "";
    const isAuthRoute = AUTH_ROUTES.some((r) => url.includes(r));

    if (error.response?.status === 401 && !isAuthRoute) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
