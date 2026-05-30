"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activationKey, setActivationKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/register", {
        email,
        password,
        activation_key: activationKey,
      });
      setAuth(data.user, data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erro ao criar conta. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  }

  const labelStyle = {
    display: "block" as const,
    fontSize: "12px",
    fontWeight: "500" as const,
    color: "#6060a0",
    marginBottom: "6px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  };

  const inputStyle = {
    width: "100%",
    background: "#080810",
    border: "1px solid #1a1a2e",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    fontFamily: "Inter, sans-serif",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#080810" }}>
      <div style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "18px", padding: "40px", width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.02em" }}>
            <span style={{ color: "#3b82f6" }}>Nexus</span>
            <span style={{ color: "#ffffff" }}> Sheets</span>
          </h1>
          <p style={{ color: "#6060a0", fontSize: "13px", marginTop: "6px" }}>Crie sua conta</p>
        </div>

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required style={inputStyle} />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Chave de Ativação</label>
            <input
              value={activationKey}
              onChange={(e) => setActivationKey(e.target.value.toUpperCase())}
              placeholder="NX-XXXX-XXXX-XXXX"
              required
              style={{ ...inputStyle, fontFamily: "monospace", letterSpacing: "0.05em" }}
            />
          </div>

          {error && (
            <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "10px", padding: "10px 14px", color: "#f87171", fontSize: "13px", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", background: loading ? "#1a1a2e" : "#3b82f6", border: "none", borderRadius: "10px", padding: "12px", color: "#ffffff", fontSize: "14px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif", transition: "background 0.2s" }}
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#6060a0" }}>
          Já tem conta?{" "}
          <Link href="/login" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "500" }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}