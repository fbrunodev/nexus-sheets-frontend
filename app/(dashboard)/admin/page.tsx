"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { Key, Users, Copy, Check, ShieldAlert, Trash2, FileSpreadsheet, Plus, DollarSign } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";


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
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [newPlatform, setNewPlatform] = useState("")
  const [creatingPlatform, setCreatingPlatform] = useState(false)
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
  const [operatorError, setOperatorError] = useState<string>("");
  const isMobile = useIsMobile();
  // Redireciona se não for admin
  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    fetchKeys();
    fetchUsers();
    fetchPlatforms();
    fetchCostTypes();
  }, []);


  async function fetchCostTypes() {
    try {
      const { data } = await api.get("/costs/types");
      setCostTypes(data);
    } catch (err) {
      console.error(err);
    }
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

  async function fetchPlatforms(){
    try {
      const {data} = await api.get("/platforms/")
      setPlatforms(data)
    }catch(err) {
      console.error(err)
    }
  }


  async function fetchKeys() {
    try {
      const { data } = await api.get("/admin/keys");
      setKeys(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingKeys(false);
    }
  }

  async function fetchUsers() {
    try {
      // Busca operadores como proxy de usuários por enquanto
      const { data } = await api.get("/operators/");
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function createPlatform() {
    if (!newPlatform.trim()) return;
    setCreatingPlatform(true) 
    
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
    } catch (err) {
      console.error(err);
    }
  }
  
  async function generateKey() {
    setGenerating(true);
    try {
      const { data } = await api.post("/admin/keys", { type: keyType });
      setKeys((prev) => [data, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
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
      if (Array.isArray(detail)) {
        setOperatorError(detail.map((e: any) => String(e.msg || e)).join(", "));
      } else {
        setOperatorError(String(detail || "Erro ao criar operador. Tente novamente."));
      }
    } finally {
      setCreatingOperator(false);
    }
  }

  async function deleteOperator(operatorId: string) {
    if (!confirm("Remover este operador?")) return;
    try {
      await api.delete(`/operators/${operatorId}`);
      setUsers((prev) => prev.filter((u) => u.id !== operatorId));
    } catch (err) {
      console.error(err);
    }
  }

  function copyKey(key: string, id: string) {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const typeColors: Record<string, { color: string; bg: string }> = {
    LIFETIME: { color: "#22d3a5", bg: "rgba(34,211,165,0.1)" },
    MONTHLY: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    TRIAL: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  };

  const availableKeys = keys.filter((k) => !k.is_used).length;
  const usedKeys = keys.filter((k) => k.is_used).length;

  if (user?.role !== "ADMIN") return null;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <ShieldAlert size={20} color="#3b82f6" />
          <h1 style={{ fontSize: "24px", fontWeight: "700" }}>Painel Admin</h1>
        </div>
        <p style={{ color: "#6060a0", fontSize: "13px" }}>
          Gerencie usuários, chaves e configurações globais
        </p>
      </div>

      {/* Métricas */}
      <div style={{ display: "grid",gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total de keys", value: keys.length, color: "#fff" },
          { label: "Keys disponíveis", value: availableKeys, color: "#22d3a5" },
          { label: "Keys utilizadas", value: usedKeys, color: "#f87171" },
          { label: "Operadores", value: users.length, color: "#3b82f6" },
        ].map((item) => (
          <div key={item.label} style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "12px", padding: "16px 20px" }}>
            <p style={{ fontSize: "11px", color: "#6060a0", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {item.label}
            </p>
            <p style={{ fontSize: "28px", fontWeight: "700", color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
        {[
          { id: "platforms", label: "Plataformas", icon: FileSpreadsheet },
          { id: "keys", label: "Activation Keys", icon: Key },
          { id: "users", label: "Operadores", icon: Users },
          { id: "costs", label: "Tipos de Custo", icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "keys" | "users" | "platforms" | "costs")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: isActive ? "600" : "400",
                color: isActive ? "#fff" : "#6060a0",
                background: isActive ? "rgba(59,130,246,0.15)" : "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "all 0.15s",
              }}
            >
              <Icon size={14} color={isActive ? "#3b82f6" : "#6060a0"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab: Activation Keys */}
      {activeTab === "keys" && (
        <div style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "14px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Gerenciar Keys
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <select
                value={keyType}
                onChange={(e) => setKeyType(e.target.value)}
                style={{ background: "#080810", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "8px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", cursor: "pointer" }}
              >
                <option value="LIFETIME">Vitalícia</option>
                <option value="MONTHLY">Mensal</option>
                <option value="TRIAL">Trial</option>
              </select>
              <button
                onClick={generateKey}
                disabled={generating}
                style={{ display: "flex", alignItems: "center", gap: "8px", background: generating ? "#1a1a2e" : "#3b82f6", border: "none", borderRadius: "8px", padding: "9px 16px", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: generating ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif" }}
              >
                <Key size={14} />
                {generating ? "Gerando..." : "Gerar Key"}
              </button>
            </div>
          </div>

          {loadingKeys ? (
            <p style={{ color: "#6060a0", fontSize: "13px" }}>Carregando...</p>
          ) : keys.length === 0 ? (
            <p style={{ color: "#3a3a5c", fontSize: "13px", textAlign: "center", padding: "24px" }}>
              Nenhuma chave gerada ainda.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1a1a2e" }}>
                  {["Chave", "Tipo", "Status", "Criada em"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "11px", fontWeight: "600", color: "#6060a0", letterSpacing: "0.06em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => {
                  const typeStyle = typeColors[k.type] || typeColors.LIFETIME;
                  return (
                    <tr key={k.id} style={{ borderBottom: "1px solid #1a1a2e" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.01)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <code style={{ fontSize: "13px", color: k.is_used ? "#3a3a5c" : "#fff", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                            {k.key}
                          </code>
                          {!k.is_used && (
                            <button
                              onClick={() => copyKey(k.key, k.id)}
                              style={{ background: "transparent", border: "none", cursor: "pointer", color: copiedId === k.id ? "#22d3a5" : "#6060a0", display: "flex", alignItems: "center" }}
                            >
                              {copiedId === k.id ? <Check size={13} /> : <Copy size={13} />}
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ background: typeStyle.bg, color: typeStyle.color, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "500" }}>
                          {k.type}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ background: k.is_used ? "rgba(248,113,113,0.1)" : "rgba(34,211,165,0.1)", color: k.is_used ? "#f87171" : "#22d3a5", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "500" }}>
                          {k.is_used ? "Utilizada" : "Disponível"}
                        </span>
                      </td>
                      <td style={{ padding: "12px", fontSize: "12px", color: "#6060a0" }}>
                        {new Date(k.created_at).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Operadores */}
      {activeTab === "users" && (
        <div style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "14px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Operadores
            </p>
            <button
              onClick={() => setShowOperatorModal(true)}
              style={{ display: "flex", alignItems: "center", gap: "7px", background: "#3b82f6", border: "none", borderRadius: "8px", padding: "9px 16px", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
            >
              <Plus size={14} /> Novo Operador
            </button>
          </div>

          {loadingUsers ? (
            <p style={{ color: "#6060a0", fontSize: "13px" }}>Carregando...</p>
          ) : users.length === 0 ? (
            <p style={{ color: "#3a3a5c", fontSize: "13px", textAlign: "center", padding: "24px" }}>
              Nenhum operador cadastrado.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1a1a2e" }}>
                  {["Operador", "Status", "Criado em", ""].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "11px", fontWeight: "600", color: "#6060a0", letterSpacing: "0.06em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #1a1a2e" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.01)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600", color: "#3b82f6", flexShrink: 0 }}>
                          {(u.name || u.email)[0].toUpperCase()}
                        </div>
                        <div>
                          {u.name && <p style={{ fontSize: "13px", fontWeight: "600", marginBottom: "2px" }}>{u.name}</p>}
                          <p style={{ fontSize: "12px", color: "#6060a0" }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ background: u.is_active ? "rgba(34,211,165,0.1)" : "rgba(248,113,113,0.1)", color: u.is_active ? "#22d3a5" : "#f87171", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "500" }}>
                        {u.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontSize: "12px", color: "#6060a0" }}>
                      {new Date(u.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <button
                        onClick={() => deleteOperator(u.id)}
                        style={{ background: "transparent", border: "none", color: "#3a3a5c", cursor: "pointer", display: "flex", alignItems: "center", marginLeft: "auto" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a5c")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}


      {/* Tab: Plataformas */}
      {activeTab === "platforms" && (
        <div style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "14px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Plataformas
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createPlatform()}
                placeholder="Nome da plataforma"
                style={{ background: "#080810", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "8px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif" }}
              />
              <button
                onClick={createPlatform}
                disabled={creatingPlatform}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: creatingPlatform ? "#1a1a2e" : "#3b82f6", border: "none", borderRadius: "8px", padding: "8px 16px", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: creatingPlatform ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif" }}
              >
                <Plus size={14} />
                {creatingPlatform ? "Criando..." : "Adicionar"}
              </button>
            </div>
          </div>

          {platforms.length === 0 ? (
            <p style={{ color: "#3a3a5c", fontSize: "13px", textAlign: "center", padding: "24px" }}>
              Nenhuma plataforma cadastrada.
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
              {platforms.map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#141422", borderRadius: "10px", padding: "12px 16px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "500" }}>{p.name}</span>
                  <button
                    onClick={() => deletePlatform(p.id)}
                    style={{ background: "transparent", border: "none", color: "#3a3a5c", cursor: "pointer", display: "flex", alignItems: "center" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Tab: Tipos de Custo */}
      {activeTab === "costs" && (
        <div style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "14px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Tipos de Custo
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={newCostType}
                onChange={(e) => setNewCostType(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createCostType()}
                placeholder="Nome do tipo"
                style={{ background: "#080810", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "8px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif" }}
              />
              <button
                onClick={createCostType}
                disabled={creatingCostType}
                style={{ display: "flex", alignItems: "center", gap: "6px", background: creatingCostType ? "#1a1a2e" : "#3b82f6", border: "none", borderRadius: "8px", padding: "8px 16px", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: creatingCostType ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif" }}
              >
                <Plus size={14} />
                {creatingCostType ? "Criando..." : "Adicionar"}
              </button>
            </div>
          </div>

          {costTypes.length === 0 ? (
            <p style={{ color: "#3a3a5c", fontSize: "13px", textAlign: "center", padding: "24px" }}>
              Nenhum tipo de custo cadastrado.
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
              {costTypes.map((c) => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#141422", borderRadius: "10px", padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <DollarSign size={13} color="#22d3a5" />
                    <span style={{ fontSize: "13px", fontWeight: "500" }}>{c.name}</span>
                  </div>
                  <button
                    onClick={() => deleteCostType(c.id)}
                    style={{ background: "transparent", border: "none", color: "#3a3a5c", cursor: "pointer", display: "flex", alignItems: "center" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a5c")}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Novo Operador */}
      {showOperatorModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "20px" }}>
          <div style={{ background: "#141422", border: "1px solid #2a2a4a", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "400px" }}>

            <p style={{ fontSize: "16px", fontWeight: "700", color: "#fff", marginBottom: "24px" }}>Novo Operador</p>

            <p style={{ fontSize: "10px", fontWeight: "600", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>Nome</p>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              placeholder="Nome do operador"
              style={{ display: "block", width: "100%", background: "#0a0a16", border: "1px solid #2a2a4a", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", marginBottom: "14px", boxSizing: "border-box" }}
            />

            <p style={{ fontSize: "10px", fontWeight: "600", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>Email</p>
            <input
              type="email"
              value={operatorEmail}
              onChange={(e) => setOperatorEmail(e.target.value)}
              placeholder="email@exemplo.com"
              style={{ display: "block", width: "100%", background: "#0a0a16", border: "1px solid #2a2a4a", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", marginBottom: "14px", boxSizing: "border-box" }}
            />

            <p style={{ fontSize: "10px", fontWeight: "600", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>Senha</p>
            <input
              type="password"
              value={operatorPassword}
              onChange={(e) => setOperatorPassword(e.target.value)}
              placeholder="Senha de acesso"
              style={{ display: "block", width: "100%", background: "#0a0a16", border: "1px solid #2a2a4a", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", marginBottom: "20px", boxSizing: "border-box" }}
            />

            {operatorError && (
              <p style={{ fontSize: "12px", color: "#f87171", marginBottom: "14px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "8px", padding: "8px 12px" }}>
                {operatorError}
              </p>
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => { setShowOperatorModal(false); setOperatorError(""); setOperatorName(""); setOperatorEmail(""); setOperatorPassword(""); }}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "transparent", border: "1px solid #2a2a4a", color: "#6060a0", fontSize: "13px", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
              >
                Cancelar
              </button>
              <button
                onClick={createNewOperator}
                disabled={creatingOperator}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", background: creatingOperator ? "#1a1a2e" : "#3b82f6", border: "none", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: creatingOperator ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif" }}
              >
                {creatingOperator ? "Criando..." : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}