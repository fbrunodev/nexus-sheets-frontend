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

// Interceptor de resposta — redireciona para login se token expirar
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o token expirou ou é inválido, limpa o storage e redireciona
    if (error.response?.status === 401) {
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
