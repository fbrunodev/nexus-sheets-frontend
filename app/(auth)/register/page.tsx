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

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const keyRef = useRef<HTMLInputElement>(null);

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
      const msg = err.response?.data?.detail || "Erro ao criar conta. Verifique os dados.";
      setError(msg);
      const lower = String(msg).toLowerCase();
      if (lower.includes("chave") || lower.includes("key")) {
        keyRef.current?.focus();
      } else if (lower.includes("email") || lower.includes("e-mail") || lower.includes("cadastrado")) {
        emailRef.current?.focus();
      } else {
        passwordRef.current?.focus();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <Card style={{ padding: "40px", width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.02em" }}>
            <span style={{ color: "#3b82f6" }}>Nexus</span>
            <span style={{ color: "var(--text)" }}> Sheets</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "6px" }}>Crie sua conta</p>
        </div>

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: "16px" }}>
            <label style={LABEL}>Email</label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="ui-input"
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={LABEL}>Senha</label>
            <input
              ref={passwordRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="ui-input"
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={LABEL}>Chave de ativação</label>
            <input
              ref={keyRef}
              value={activationKey}
              onChange={(e) => setActivationKey(e.target.value.toUpperCase())}
              placeholder="NX-XXXX-XXXX-XXXX"
              required
              className="ui-input"
              style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}
            />
          </div>

          {error && (
            <div style={{ background: "var(--negative-subtle)", border: "1px solid var(--negative-border)", borderRadius: "10px", padding: "10px 14px", color: "var(--negative-text)", fontSize: "13px", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)" }}>
          Já tem conta?{" "}
          <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: "500" }}>
            Entrar
          </Link>
        </p>
      </Card>
    </div>
  );
}
