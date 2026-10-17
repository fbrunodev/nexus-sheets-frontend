"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { Key, Users, Copy, Check, ShieldAlert, Trash2, FileSpreadsheet, Plus, DollarSign } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusDot } from "@/components/ui/status-dot";
import { Modal, ModalContent, ModalBody, ModalFooter, ModalClose } from "@/components/ui/modal";

const CARET =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C8C94' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")";

const MODAL_LABEL: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  color: "var(--text-secondary)",
  marginBottom: "6px",
};

type BadgeVariant = "neutral" | "positive" | "negative" | "warning";
const KEY_TYPE_BADGE: Record<string, BadgeVariant> = {
  LIFETIME: "neutral",
  MONTHLY:  "neutral",
  TRIAL:    "warning",
};

interface ActivationKey {
  id: string;
  key: string;
  type: string;
  expires_at: string | null;
  is_used: boolean;
  used_by: string | null;
  created_at: string;
}

interface UserAdmin {
  id: string;
  name: string | null;
  email: string;
  role: string;
  is_active: boolean;
  plan_type: string | null;
  created_at: string;
  last_login: string | null;
}

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const isMobile = useIsMobile();

  const [platforms, setPlatforms] = useState<any[]>([]);
  const [newPlatform, setNewPlatform] = useState("");
  const [creatingPlatform, setCreatingPlatform] = useState(false);
  const [keys, setKeys] = useState<ActivationKey[]>([]);
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [keyType, setKeyType] = useState("LIFETIME");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"keys" | "users" | "platforms" | "costs">("keys");
  const [costTypes, setCostTypes] = useState<any[]>([]);
  const [newCostType, setNewCostType] = useState("");
  const [creatingCostType, setCreatingCostType] = useState(false);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [operatorName, setOperatorName] = useState("");
  const [operatorEmail, setOperatorEmail] = useState("");
  const [operatorPassword, setOperatorPassword] = useState("");
  const [creatingOperator, setCreatingOperator] = useState(false);
  const [operatorError, setOperatorError] = useState("");

  useEffect(() => {
    if (user && user.role !== "ADMIN") router.push("/dashboard");
  }, [user, router]);

  useEffect(() => {
    fetchKeys();
    fetchUsers();
    fetchPlatforms();
    fetchCostTypes();
  }, []);

  async function fetchCostTypes() {
    try { const { data } = await api.get("/costs/types"); setCostTypes(data); }
    catch (err) { console.error(err); }
  }

  async function createCostType() {
    if (!newCostType.trim()) return;
    setCreatingCostType(true);
    try {
      const { data } = await api.post("/costs/types", { name: newCostType });
      setCostTypes((prev) => [...prev, data]);
      setNewCostType("");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao criar tipo de custo.");
    } finally {
      setCreatingCostType(false);
    }
  }

  async function deleteCostType(id: string) {
    if (!confirm("Remover este tipo de custo?")) return;
    try {
      await api.delete(`/costs/types/${id}`);
      setCostTypes((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao remover tipo de custo.");
    }
  }

  async function fetchPlatforms() {
    try { const { data } = await api.get("/platforms/"); setPlatforms(data); }
    catch (err) { console.error(err); }
  }

  async function fetchKeys() {
    try { const { data } = await api.get("/admin/keys"); setKeys(data); }
    catch (err) { console.error(err); }
    finally { setLoadingKeys(false); }
  }

  async function fetchUsers() {
    try { const { data } = await api.get("/operators/"); setUsers(data); }
    catch (err) { console.error(err); }
    finally { setLoadingUsers(false); }
  }

  async function createPlatform() {
    if (!newPlatform.trim()) return;
    setCreatingPlatform(true);
    try {
      const { data } = await api.post("/platforms/", { name: newPlatform });
      setPlatforms((prev) => [...prev, data]);
      setNewPlatform("");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao criar plataforma.");
    } finally {
      setCreatingPlatform(false);
    }
  }

  async function deletePlatform(platformId: string) {
    if (!confirm("Remover esta plataforma?")) return;
    try {
      await api.delete(`/platforms/${platformId}`);
      setPlatforms((prev) => prev.filter((p) => p.id !== platformId));
    } catch (err) { console.error(err); }
  }

  async function generateKey() {
    setGenerating(true);
    try {
      const { data } = await api.post("/admin/keys", { type: keyType });
      setKeys((prev) => [data, ...prev]);
    } catch (err) { console.error(err); }
    finally { setGenerating(false); }
  }

  async function createNewOperator() {
    if (!operatorName.trim() || !operatorEmail.trim() || !operatorPassword.trim()) return;
    setCreatingOperator(true);
    setOperatorError("");
    try {
      const { data } = await api.post("/operators/", {
        name: operatorName,
        email: operatorEmail,
        password: operatorPassword,
      });
      setUsers((prev) => [data, ...prev]);
      setShowOperatorModal(false);
      setOperatorName("");
      setOperatorEmail("");
      setOperatorPassword("");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setOperatorError(
        Array.isArray(detail)
          ? detail.map((e: any) => String(e.msg || e)).join(", ")
          : String(detail || "Erro ao criar operador. Tente novamente.")
      );
    } finally {
      setCreatingOperator(false);
    }
  }

  async function deleteOperator(operatorId: string) {
    if (!confirm("Remover este operador?")) return;
    try {
      await api.delete(`/operators/${operatorId}`);
      setUsers((prev) => prev.filter((u) => u.id !== operatorId));
    } catch (err) { console.error(err); }
  }

  function copyKey(key: string, id: string) {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const availableKeys = keys.filter((k) => !k.is_used).length;
  const usedKeys = keys.filter((k) => k.is_used).length;

  if (user?.role !== "ADMIN") return null;

  const TABS = [
    { id: "platforms", label: "Plataformas", icon: FileSpreadsheet },
    { id: "keys",      label: "Activation Keys", icon: Key },
    { id: "users",     label: "Operadores", icon: Users },
    { id: "costs",     label: "Tipos de Custo", icon: DollarSign },
  ] as const;

  return (
    <div>
      <PageHeader title="Painel admin" subtitle="Gerencie usuários, chaves e configurações globais" />

      {/* Métricas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "Total de keys",    value: keys.length,   color: "var(--text)" },
          { label: "Keys disponíveis", value: availableKeys, color: "var(--text)" },
          { label: "Keys utilizadas",  value: usedKeys,      color: "var(--text)" },
          { label: "Operadores",       value: users.length,  color: "var(--text)" },
        ].map((item) => (
          <Card
            key={item.label}
            style={{ padding: "16px 20px" }}
          >
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>
              {item.label}
            </p>
            <p style={{ fontSize: "28px", fontWeight: "700", color: item.color }}>{item.value}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "20px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "4px",
          width: "fit-content",
          flexWrap: "wrap",
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: isActive ? "600" : "400",
                color: isActive ? "var(--text)" : "var(--text-muted)",
                background: isActive ? "var(--surface-hover)" : "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              <Icon size={14} color={isActive ? "var(--accent)" : "var(--text-muted)"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab: Activation Keys ── */}
      {activeTab === "keys" && (
        <Card style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "8px" }}>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Gerenciar Keys
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <select
                value={keyType}
                onChange={(e) => setKeyType(e.target.value)}
                className="ui-select"
                style={{ backgroundImage: CARET, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: "32px", padding: "8px 32px 8px 12px" }}
              >
                <option value="LIFETIME">Vitalícia</option>
                <option value="MONTHLY">Mensal</option>
                <option value="TRIAL">Trial</option>
              </select>
              <Button variant="primary" onClick={generateKey} disabled={generating} style={{ gap: "8px" }}>
                <Key size={14} />
                {generating ? "Gerando..." : "Gerar Key"}
              </Button>
            </div>
          </div>

          {loadingKeys ? (
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Carregando...</p>
          ) : keys.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", padding: "24px" }}>
              Nenhuma chave gerada ainda.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Chave", "Tipo", "Status", "Criada em"].map((h) => (
                    <th
                      key={h}
                      style={{ padding: "10px 12px", textAlign: "left", fontSize: "13px", color: "var(--text-secondary)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr
                    key={k.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <code
                          style={{
                            fontSize: "13px",
                            color: k.is_used ? "var(--text-muted)" : "var(--text)",
                            fontFamily: "monospace",
                            letterSpacing: "0.05em",
                            opacity: k.is_used ? 0.5 : 1,
                          }}
                        >
                          {k.key}
                        </code>
                        {!k.is_used && (
                          <button
                            onClick={() => copyKey(k.key, k.id)}
                            style={{ background: "transparent", border: "none", cursor: "pointer", color: copiedId === k.id ? "var(--positive)" : "var(--text-muted)", display: "flex", alignItems: "center", transition: "color 0.15s" }}
                          >
                            {copiedId === k.id ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <Badge variant={KEY_TYPE_BADGE[k.type] ?? "neutral"}>{k.type}</Badge>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <StatusDot status={k.is_used ? "USED" : "AVAILABLE"} />
                    </td>
                    <td style={{ padding: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
                      {new Date(k.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* ── Tab: Operadores ── */}
      {activeTab === "users" && (
        <Card style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Operadores
            </p>
            <Button variant="primary" onClick={() => setShowOperatorModal(true)} style={{ gap: "7px" }}>
              <Plus size={14} /> Novo Operador
            </Button>
          </div>

          {loadingUsers ? (
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Carregando...</p>
          ) : users.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", padding: "24px" }}>
              Nenhum operador cadastrado.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Operador", "Status", "Criado em", ""].map((h) => (
                    <th
                      key={h}
                      style={{ padding: "10px 12px", textAlign: "left", fontSize: "13px", color: "var(--text-secondary)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <td style={{ padding: "12px" }}>
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
                          {(u.name || u.email)[0].toUpperCase()}
                        </div>
                        <div>
                          {u.name && <p style={{ fontSize: "13px", fontWeight: "600", marginBottom: "2px", color: "var(--text)" }}>{u.name}</p>}
                          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <StatusDot status={u.is_active ? "ACTIVE" : "INACTIVE"} />
                    </td>
                    <td style={{ padding: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
                      {new Date(u.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <button
                        onClick={() => deleteOperator(u.id)}
                        style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", marginLeft: "auto", transition: "color 0.15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--negative-text)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* ── Tab: Plataformas ── */}
      {activeTab === "platforms" && (
        <Card style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "8px" }}>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Plataformas
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createPlatform()}
                placeholder="Nome da plataforma"
                className="ui-input"
                style={{ width: "180px" }}
              />
              <Button variant="primary" onClick={createPlatform} disabled={creatingPlatform} style={{ gap: "6px" }}>
                <Plus size={14} />
                {creatingPlatform ? "Criando..." : "Adicionar"}
              </Button>
            </div>
          </div>

          {platforms.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", padding: "24px" }}>
              Nenhuma plataforma cadastrada.
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
              {platforms.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "var(--surface-hover)",
                    borderRadius: "10px",
                    padding: "12px 16px",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)" }}>{p.name}</span>
                  <button
                    onClick={() => deletePlatform(p.id)}
                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", transition: "color 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--negative-text)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── Tab: Tipos de Custo ── */}
      {activeTab === "costs" && (
        <Card style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "8px" }}>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Tipos de Custo
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={newCostType}
                onChange={(e) => setNewCostType(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createCostType()}
                placeholder="Nome do tipo"
                className="ui-input"
                style={{ width: "180px" }}
              />
              <Button variant="primary" onClick={createCostType} disabled={creatingCostType} style={{ gap: "6px" }}>
                <Plus size={14} />
                {creatingCostType ? "Criando..." : "Adicionar"}
              </Button>
            </div>
          </div>

          {costTypes.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", padding: "24px" }}>
              Nenhum tipo de custo cadastrado.
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
              {costTypes.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "var(--surface-hover)",
                    borderRadius: "10px",
                    padding: "12px 16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <DollarSign size={13} color="var(--positive)" />
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)" }}>{c.name}</span>
                  </div>
                  <button
                    onClick={() => deleteCostType(c.id)}
                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", transition: "color 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--negative-text)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Modal — Novo Operador */}
      <Modal
        open={showOperatorModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowOperatorModal(false);
            setOperatorError("");
            setOperatorName("");
            setOperatorEmail("");
            setOperatorPassword("");
          }
        }}
      >
        <ModalContent title="Novo Operador" maxWidth={400}>
          <ModalBody>
            <div>
              <label style={MODAL_LABEL}>Nome</label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Nome do operador"
                autoFocus
                className="ui-input"
              />
            </div>

            <div>
              <label style={MODAL_LABEL}>Email</label>
              <input
                type="email"
                value={operatorEmail}
                onChange={(e) => setOperatorEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="ui-input"
              />
            </div>

            <div>
              <label style={MODAL_LABEL}>Senha</label>
              <input
                type="password"
                value={operatorPassword}
                onChange={(e) => setOperatorPassword(e.target.value)}
                placeholder="Senha de acesso"
                className="ui-input"
              />
            </div>

            {operatorError && (
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
                {operatorError}
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="ghost">Cancelar</Button>
            </ModalClose>
            <Button
              variant="primary"
              onClick={createNewOperator}
              disabled={creatingOperator || !operatorName.trim() || !operatorEmail.trim() || !operatorPassword.trim()}
            >
              {creatingOperator ? "Criando..." : "Criar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
