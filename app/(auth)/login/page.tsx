"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const LABEL: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  color: "var(--text-secondary)",
  marginBottom: "6px",
};

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const passwordRef = useRef<HTMLInputElement>(null);

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
      setError(err.response?.data?.detail || "Erro ao fazer login. Tente novamente.");
      passwordRef.current?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--bg)" }}
    >
      <Card style={{ padding: "40px", width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.02em" }}>
            <span style={{ color: "#3b82f6" }}>Nexus</span>
            <span style={{ color: "var(--text)" }}> Sheets</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "6px" }}>
            Entre na sua conta
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "16px" }}>
            <label style={LABEL}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="seu@email.com"
              required
              className="ui-input"
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={LABEL}>Senha</label>
            <input
              ref={passwordRef}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••"
              required
              className="ui-input"
            />
          </div>

          {error && (
            <div
              style={{
                background: "var(--negative-subtle)",
                border: "1px solid var(--negative-border)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "var(--negative-text)",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)" }}>
          Não tem conta?{" "}
          <Link href="/register" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: "500" }}>
            Criar conta
          </Link>
        </p>
      </Card>
    </div>
  );
}
