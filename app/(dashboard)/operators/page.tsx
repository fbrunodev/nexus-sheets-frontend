"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Operator } from "@/types";
import { Plus, Users } from "lucide-react";

export default function OperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOperators();
  }, []);

  async function fetchOperators() {
    try {
      const { data } = await api.get("/operators/");
      setOperators(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newEmail.trim() || !newPassword.trim()) return;
    setCreating(true);
    setError("");
    try {
      const { data } = await api.post("/operators/", {
        email: newEmail,
        password: newPassword,
      });
      setOperators((prev) => [data, ...prev]);
      setShowModal(false);
      setNewEmail("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erro ao criar operador.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px" }}>Operadores</h1>
          <p style={{ color: "#6060a0", fontSize: "13px" }}>Gerencie os operadores do sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "#3b82f6", border: "none", borderRadius: "10px", padding: "10px 18px", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
        >
          <Plus size={16} />
          Novo Operador
        </button>
      </div>

      {/* Contador */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total", value: operators.length, color: "#fff" },
          { label: "Ativos", value: operators.filter((o) => o.is_active).length, color: "#22d3a5" },
          { label: "Inativos", value: operators.filter((o) => !o.is_active).length, color: "#f87171" },
        ].map((item) => (
          <div key={item.label} style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "12px", padding: "16px 20px" }}>
            <p style={{ fontSize: "11px", color: "#6060a0", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</p>
            <p style={{ fontSize: "28px", fontWeight: "700", color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <p style={{ color: "#6060a0", fontSize: "14px" }}>Carregando...</p>
      ) : operators.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#3a3a5c" }}>
          <Users size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
          <p style={{ fontSize: "14px" }}>Nenhum operador cadastrado</p>
          <p style={{ fontSize: "12px", marginTop: "4px" }}>Crie um novo operador para começar</p>
        </div>
      ) : (
        <div style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "14px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1a2e" }}>
                {["Operador", "Role", "Status", "Criado em", "Último login"].map((h) => (
                  <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: "11px", fontWeight: "600", color: "#6060a0", letterSpacing: "0.06em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {operators.map((op) => (
                <tr
                  key={op.id}
                  style={{ borderBottom: "1px solid #1a1a2e" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.01)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600", color: "#3b82f6", flexShrink: 0 }}>
                        {op.email[0].toUpperCase()}
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: "500" }}>{op.email}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "500" }}>
                      {op.role}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ background: op.is_active ? "rgba(34,211,165,0.1)" : "rgba(248,113,113,0.1)", color: op.is_active ? "#22d3a5" : "#f87171", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "500" }}>
                      {op.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: "13px", color: "#6060a0" }}>
                    {new Date(op.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: "13px", color: "#6060a0" }}>
                    {op.last_login ? new Date(op.last_login).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "18px", padding: "32px", width: "100%", maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "24px" }}>Novo Operador</h2>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "500", color: "#6060a0", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</label>
              <input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="operador@email.com"
                autoFocus
                style={{ width: "100%", background: "#080810", border: "1px solid #1a1a2e", borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif" }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "500", color: "#6060a0", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%", background: "#080810", border: "1px solid #1a1a2e", borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif" }}
              />
            </div>

            {error && (
              <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "10px", padding: "10px 14px", color: "#f87171", fontSize: "13px", marginBottom: "16px" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", background: "transparent", border: "1px solid #1a1a2e", color: "#6060a0", fontSize: "14px", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newEmail.trim() || !newPassword.trim()}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", background: creating ? "#1a1a2e" : "#3b82f6", border: "none", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: creating ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif" }}
              >
                {creating ? "Criando..." : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}