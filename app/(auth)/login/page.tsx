"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuth(data.user, data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Erro ao fazer login. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#080810" }}
    >
      <div
        style={{
          background: "#0f0f1a",
          border: "1px solid #1a1a2e",
          borderRadius: "18px",
          padding: "40px",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: "#3b82f6" }}>Nexus</span>
            <span style={{ color: "#ffffff" }}> Sheets</span>
          </h1>
          <p style={{ color: "#6060a0", fontSize: "13px", marginTop: "6px" }}>
            Entre na sua conta
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "500",
                color: "#6060a0",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={{
                width: "100%",
                background: "#080810",
                border: "1px solid #1a1a2e",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#ffffff",
                fontSize: "14px",
                outline: "none",
                fontFamily: "Inter, sans-serif",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "500",
                color: "#6060a0",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                background: "#080810",
                border: "1px solid #1a1a2e",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#ffffff",
                fontSize: "14px",
                outline: "none",
                fontFamily: "Inter, sans-serif",
              }}
            />
          </div>

          {/* Erro */}
          {error && (
            <div
              style={{
                background: "rgba(248, 113, 113, 0.1)",
                border: "1px solid rgba(248, 113, 113, 0.25)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#f87171",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "#1a1a2e" : "#3b82f6",
              border: "none",
              borderRadius: "10px",
              padding: "12px",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#6060a0" }}>
          Não tem conta?{" "}
          <Link href="/register" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "500" }}>
            Criar conta
          </Link>
        </p>

      </div>
    </div>
  );
}