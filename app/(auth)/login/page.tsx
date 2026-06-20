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
  const [showErrorModal, setShowErrorModal] = useState(false);
  
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
      setShowErrorModal(true);
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
        {/* Pop-up de erro */}
        {showErrorModal && (
          <div
            onClick={() => setShowErrorModal(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: "#0f0f1a", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "360px", textAlign: "center" }}
            >
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(248,113,113,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>
                Não foi possível entrar
              </h3>
              <p style={{ fontSize: "14px", color: "#9090b0", marginBottom: "22px", lineHeight: "1.5" }}>
                {error}
              </p>
              <button
                onClick={() => setShowErrorModal(false)}
                style={{ width: "100%", background: "#3b82f6", border: "none", borderRadius: "10px", padding: "11px", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
              >
                Entendi
              </button>
            </div>
          </div>
        )}    
      </div>
    </div>
  );
}