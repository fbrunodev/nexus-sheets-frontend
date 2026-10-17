"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { User, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LABEL: React.CSSProperties = {
  display: "block",
  fontSize: "10px",
  fontWeight: "600",
  color: "var(--text-muted)",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

export default function SettingsPage() {
  const { user } = useAuthStore();

  const [email, setEmail] = useState(user?.email || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

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

  return (
    <div style={{ maxWidth: "600px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px", color: "var(--text)" }}>
          Configurações
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Gerencie suas preferências e segurança</p>
      </div>

      {/* Card perfil */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "24px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "var(--surface-hover)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={15} color="var(--accent)" />
          </div>
          <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>Perfil</p>
        </div>

        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "var(--surface-hover)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: "700",
              color: "var(--accent)",
            }}
          >
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>{user?.email}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
              <Badge variant="neutral">{user?.role}</Badge>
              <Badge variant="warning">{user?.plan_type || "—"}</Badge>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div style={{ marginBottom: "16px" }}>
            <label style={LABEL}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ui-input"
            />
          </div>

          {profileError && (
            <p
              style={{
                fontSize: "12px",
                color: "var(--negative-text)",
                background: "var(--negative-subtle)",
                border: "1px solid var(--negative-bar)",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "16px",
              }}
            >
              {profileError}
            </p>
          )}

          {profileSuccess && (
            <div
              style={{
                background: "rgba(34,211,165,0.08)",
                border: "1px solid rgba(34,211,165,0.25)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "var(--positive)",
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

          <Button type="submit" variant="primary" disabled={savingProfile}>
            {savingProfile ? "Salvando..." : "Salvar perfil"}
          </Button>
        </form>
      </div>

      {/* Card senha */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(245,185,74,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock size={15} color="var(--warning)" />
          </div>
          <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>Alterar senha</p>
        </div>

        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: "16px" }}>
            <label style={LABEL}>Senha atual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="ui-input"
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={LABEL}>Nova senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="ui-input"
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={LABEL}>Confirmar nova senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="ui-input"
            />
          </div>

          {passwordError && (
            <p
              style={{
                fontSize: "12px",
                color: "var(--negative-text)",
                background: "var(--negative-subtle)",
                border: "1px solid var(--negative-bar)",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "16px",
              }}
            >
              {passwordError}
            </p>
          )}

          {passwordSuccess && (
            <div
              style={{
                background: "rgba(34,211,165,0.08)",
                border: "1px solid rgba(34,211,165,0.25)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "var(--positive)",
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

          <Button type="submit" variant="primary" disabled={savingPassword}>
            {savingPassword ? "Salvando..." : "Alterar senha"}
          </Button>
        </form>
      </div>
    </div>
  );
}
