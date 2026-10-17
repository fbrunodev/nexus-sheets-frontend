"use client";

import { useAuthStore } from "@/store/authStore";
import { User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const LABEL: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  color: "var(--text-secondary)",
  marginBottom: "6px",
};

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div style={{ maxWidth: "600px" }}>
      <PageHeader title="Configurações" subtitle="Gerencie suas preferências e segurança" />

      {/* Card perfil */}
      <Card style={{ padding: "24px", marginBottom: "16px" }}>
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
            <User size={15} color="var(--text-secondary)" />
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

        <div style={{ marginBottom: "16px" }}>
          <label style={LABEL}>Email</label>
          <input
            type="email"
            defaultValue={user?.email || ""}
            disabled
            className="ui-input"
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Button variant="primary" disabled>Salvar perfil</Button>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Em breve</span>
        </div>
      </Card>

      {/* Card senha */}
      <Card style={{ padding: "24px" }}>
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
            <Lock size={15} color="var(--text-secondary)" />
          </div>
          <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>Alterar senha</p>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={LABEL}>Senha atual</label>
          <input type="password" placeholder="••••••••" disabled className="ui-input" />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={LABEL}>Nova senha</label>
          <input type="password" placeholder="••••••••" disabled className="ui-input" />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={LABEL}>Confirmar nova senha</label>
          <input type="password" placeholder="••••••••" disabled className="ui-input" />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Button variant="primary" disabled>Alterar senha</Button>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Em breve</span>
        </div>
      </Card>
    </div>
  );
}
