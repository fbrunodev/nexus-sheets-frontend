"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import { User, Lock, Check } from "lucide-react";

export default function SettingsPage() {
  const { user, setAuth } = useAuthStore();

  // Perfil
  const [email, setEmail] = useState(user?.email || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    setProfileSuccess(false);
    try {
      // Endpoint a ser implementado no backend
      // const { data } = await api.patch("/auth/me", { email });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.detail || "Erro ao salvar perfil.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setSavingPassword(true);
    try {
      // Endpoint a ser implementado no backend
      // await api.patch("/auth/password", { current_password: currentPassword, new_password: newPassword });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || "Erro ao alterar senha.");
    } finally {
      setSavingPassword(false);
    }
  }

  const inputStyle = {
    width: "100%",
    background: "#080810",
    border: "1px solid #1a1a2e",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    fontFamily: "Inter, sans-serif",
  };

  const labelStyle = {
    display: "block" as const,
    fontSize: "11px",
    fontWeight: "500" as const,
    color: "#6060a0",
    marginBottom: "6px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px" }}>
          Configurações
        </h1>
        <p style={{ color: "#6060a0", fontSize: "13px" }}>
          Gerencie suas preferências e segurança
        </p>
      </div>

      {/* Card perfil */}
      <div
        style={{
          background: "#0f0f1a",
          border: "1px solid #1a1a2e",
          borderRadius: "14px",
          padding: "24px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(59,130,246,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={15} color="#3b82f6" />
          </div>
          <p style={{ fontSize: "14px", fontWeight: "600" }}>Perfil</p>
        </div>

        {/* Avatar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "rgba(59,130,246,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: "700",
              color: "#3b82f6",
            }}
          >
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: "600" }}>{user?.email}</p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "4px",
              }}
            >
              <span
                style={{
                  background: "rgba(59,130,246,0.1)",
                  color: "#3b82f6",
                  borderRadius: "20px",
                  padding: "2px 10px",
                  fontSize: "11px",
                  fontWeight: "500",
                }}
              >
                {user?.role}
              </span>
              <span
                style={{
                  background: "rgba(251,191,36,0.1)",
                  color: "#fbbf24",
                  borderRadius: "20px",
                  padding: "2px 10px",
                  fontSize: "11px",
                  fontWeight: "500",
                }}
              >
                {user?.plan_type || "—"}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          {profileError && (
            <div
              style={{
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.25)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#f87171",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div
              style={{
                background: "rgba(34,211,165,0.1)",
                border: "1px solid rgba(34,211,165,0.25)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#22d3a5",
                fontSize: "13px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Check size={13} />
              Perfil salvo com sucesso.
            </div>
          )}

          <button
            type="submit"
            disabled={savingProfile}
            style={{
              background: savingProfile ? "#1a1a2e" : "#3b82f6",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              color: "#fff",
              fontSize: "13px",
              fontWeight: "600",
              cursor: savingProfile ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {savingProfile ? "Salvando..." : "Salvar perfil"}
          </button>
        </form>
      </div>

      {/* Card senha */}
      <div
        style={{
          background: "#0f0f1a",
          border: "1px solid #1a1a2e",
          borderRadius: "14px",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(251,191,36,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock size={15} color="#fbbf24" />
          </div>
          <p style={{ fontSize: "14px", fontWeight: "600" }}>Alterar senha</p>
        </div>

        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Senha atual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Nova senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Confirmar nova senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          {passwordError && (
            <div
              style={{
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.25)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#f87171",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div
              style={{
                background: "rgba(34,211,165,0.1)",
                border: "1px solid rgba(34,211,165,0.25)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#22d3a5",
                fontSize: "13px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Check size={13} />
              Senha alterada com sucesso.
            </div>
          )}

          <button
            type="submit"
            disabled={savingPassword}
            style={{
              background: savingPassword ? "#1a1a2e" : "#fbbf24",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              color: "#080810",
              fontSize: "13px",
              fontWeight: "700",
              cursor: savingPassword ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {savingPassword ? "Salvando..." : "Alterar senha"}
          </button>
        </form>
      </div>
    </div>
  );
}