"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Operator } from "@/types";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalContent, ModalBody, ModalFooter, ModalClose } from "@/components/ui/modal";

const MODAL_LABEL: React.CSSProperties = {
  display: "block",
  fontSize: "10px",
  fontWeight: "600",
  color: "var(--text-muted)",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
};

export default function OperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { fetchOperators(); }, []);

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
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) return;
    setCreating(true);
    setError("");
    try {
      const { data } = await api.post("/operators/", {
        name: newName,
        email: newEmail,
        password: newPassword,
      });
      setOperators((prev) => [data, ...prev]);
      setShowModal(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        Array.isArray(detail)
          ? detail.map((e: any) => String(e.msg || e)).join(", ")
          : String(detail || "Erro ao criar operador.")
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px", color: "var(--text)" }}>Operadores</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Gerencie os operadores do sistema</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)} style={{ gap: "8px" }}>
          <Plus size={16} />
          Novo Operador
        </Button>
      </div>

      {/* Contador */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total",    value: operators.length,                             color: "var(--text)" },
          { label: "Ativos",   value: operators.filter((o) => o.is_active).length,  color: "var(--positive)" },
          { label: "Inativos", value: operators.filter((o) => !o.is_active).length, color: "var(--negative-text)" },
        ].map((item) => (
          <div
            key={item.label}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px 20px" }}
          >
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {item.label}
            </p>
            <p style={{ fontSize: "28px", fontWeight: "700", color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Carregando...</p>
      ) : operators.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
          <Users size={40} style={{ marginBottom: "12px", opacity: 0.3 }} />
          <p style={{ fontSize: "14px" }}>Nenhum operador cadastrado</p>
          <p style={{ fontSize: "12px", marginTop: "4px" }}>Crie um novo operador para começar</p>
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Operador", "Role", "Status", "Criado em", "Último login"].map((h) => (
                  <th
                    key={h}
                    style={{ padding: "14px 20px", textAlign: "left", fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", letterSpacing: "0.06em" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {operators.map((op) => (
                <tr
                  key={op.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: "var(--surface-hover)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "var(--accent)",
                          flexShrink: 0,
                        }}
                      >
                        {(op.name || op.email)[0].toUpperCase()}
                      </div>
                      <div>
                        {op.name && <div style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)" }}>{op.name}</div>}
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{op.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <Badge variant="neutral">{op.role}</Badge>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <Badge variant={op.is_active ? "positive" : "negative"}>
                      {op.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: "13px", color: "var(--text-muted)" }}>
                    {new Date(op.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: "13px", color: "var(--text-muted)" }}>
                    {op.last_login ? new Date(op.last_login).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal — Novo Operador */}
      <Modal
        open={showModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowModal(false);
            setError("");
            setNewName("");
            setNewEmail("");
            setNewPassword("");
          }
        }}
      >
        <ModalContent title="Novo Operador" maxWidth={400}>
          <ModalBody>
            <div>
              <label style={MODAL_LABEL}>Nome</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome do operador"
                autoFocus
                className="ui-input"
              />
            </div>

            <div>
              <label style={MODAL_LABEL}>Email</label>
              <input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="operador@email.com"
                type="email"
                className="ui-input"
              />
            </div>

            <div>
              <label style={MODAL_LABEL}>Senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="ui-input"
              />
            </div>

            {error && (
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--negative-text)",
                  background: "var(--negative-subtle)",
                  border: "1px solid var(--negative-bar)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
              >
                {error}
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="ghost">Cancelar</Button>
            </ModalClose>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={creating || !newName.trim() || !newEmail.trim() || !newPassword.trim()}
            >
              {creating ? "Criando..." : "Criar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
