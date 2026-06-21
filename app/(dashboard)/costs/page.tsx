"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { DollarSign, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface CostType {
  id: string;
  name: string;
  created_at: string;
}

interface Cost {
  id: string;
  cost_type_id: string;
  cost_type: CostType;
  owner_id: string;
  value: number;
  month: number;
  year: number;
  description: string | null;
  created_at: string;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function CostsPage() {
  const isMobile = useIsMobile();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [costs, setCosts] = useState<Cost[]>([]);
  const [costTypes, setCostTypes] = useState<CostType[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newCostTypeId, setNewCostTypeId] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCostTypes();
  }, []);

  useEffect(() => {
    fetchCosts();
  }, [month, year]);

  async function fetchCostTypes() {
    try {
      const { data } = await api.get("/costs/types");
      setCostTypes(data);
      if (data.length > 0) setNewCostTypeId(data[0].id);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchCosts() {
    setLoading(true);
    try {
      const { data } = await api.get(`/costs/?month=${month}&year=${year}`);
      setCosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createCost() {
    if (!newCostTypeId || !newValue) return;
    setCreating(true);
    try {
      const { data } = await api.post("/costs/", {
        cost_type_id: newCostTypeId,
        value: parseFloat(newValue),
        month,
        year,
        description: newDescription.trim() || null,
      });
      setCosts((prev) => [data, ...prev]);
      setShowModal(false);
      setNewValue("");
      setNewDescription("");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Erro ao criar custo.");
    } finally {
      setCreating(false);
    }
  }

  async function deleteCost(id: string) {
    if (!confirm("Remover este custo?")) return;
    try {
      await api.delete(`/costs/${id}`);
      setCosts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const total = costs.reduce((sum, c) => sum + c.value, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <DollarSign size={20} color="#22d3a5" />
          <h1 style={{ fontSize: "24px", fontWeight: "700" }}>Custos</h1>
        </div>
        <p style={{ color: "#6060a0", fontSize: "13px" }}>
          Gerencie seus custos mensais
        </p>
      </div>

      {/* Filtro mês/ano + total */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={prevMonth}
            style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "7px 10px", color: "#6060a0", cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "7px 18px", fontSize: "13px", fontWeight: "600", minWidth: "140px", textAlign: "center" }}>
            {MONTH_NAMES[month - 1]} {year}
          </div>
          <button
            onClick={nextMonth}
            style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "7px 10px", color: "#6060a0", cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "10px", padding: "10px 20px", textAlign: "center" }}>
            <p style={{ fontSize: "10px", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>Total do mês</p>
            <p style={{ fontSize: "20px", fontWeight: "700", color: "#f87171" }}>
              R$ {total.toFixed(2).replace(".", ",")}
            </p>
          </div>
          <button
            onClick={() => { setShowModal(true); if (costTypes.length > 0) setNewCostTypeId(costTypes[0].id); }}
            style={{ display: "flex", alignItems: "center", gap: "7px", background: "#3b82f6", border: "none", borderRadius: "8px", padding: "10px 16px", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
          >
            <Plus size={14} />
            Novo Custo
          </button>
        </div>
      </div>

      {/* Lista de custos */}
      <div style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "14px", padding: "24px" }}>
        {loading ? (
          <p style={{ color: "#6060a0", fontSize: "13px" }}>Carregando...</p>
        ) : costs.length === 0 ? (
          <p style={{ color: "#3a3a5c", fontSize: "13px", textAlign: "center", padding: "32px" }}>
            Nenhum custo registrado em {MONTH_NAMES[month - 1]} {year}.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1a2e" }}>
                {["Tipo", "Valor", "Descrição", "Data", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "11px", fontWeight: "600", color: "#6060a0", letterSpacing: "0.06em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {costs.map((c) => (
                <tr
                  key={c.id}
                  style={{ borderBottom: "1px solid #1a1a2e" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.01)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "rgba(34,211,165,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <DollarSign size={13} color="#22d3a5" />
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: "500" }}>{c.cost_type.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#f87171" }}>
                      R$ {Number(c.value).toFixed(2).replace(".", ",")}
                    </span>
                  </td>
                  <td style={{ padding: "12px", fontSize: "12px", color: "#6060a0" }}>
                    {c.description || "—"}
                  </td>
                  <td style={{ padding: "12px", fontSize: "12px", color: "#6060a0" }}>
                    {new Date(c.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <button
                      onClick={() => deleteCost(c.id)}
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

      {/* Modal: Novo Custo */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "20px" }}>
          <div style={{ background: "#141422", border: "1px solid #2a2a4a", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "400px" }}>
            <p style={{ fontSize: "16px", fontWeight: "700", color: "#fff", marginBottom: "24px" }}>Novo Custo</p>

            <p style={{ fontSize: "10px", fontWeight: "600", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>Tipo de Custo</p>
            <select
              value={newCostTypeId}
              onChange={(e) => setNewCostTypeId(e.target.value)}
              style={{ display: "block", width: "100%", background: "#0a0a16", border: "1px solid #2a2a4a", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", marginBottom: "14px", boxSizing: "border-box", cursor: "pointer" }}
            >
              {costTypes.length === 0 && (
                <option value="">Nenhum tipo cadastrado</option>
              )}
              {costTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <p style={{ fontSize: "10px", fontWeight: "600", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>Valor (R$)</p>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="0,00"
              style={{ display: "block", width: "100%", background: "#0a0a16", border: "1px solid #2a2a4a", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", marginBottom: "14px", boxSizing: "border-box" }}
            />

            <p style={{ fontSize: "10px", fontWeight: "600", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>Descrição (opcional)</p>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Ex: Aluguel do servidor"
              style={{ display: "block", width: "100%", background: "#0a0a16", border: "1px solid #2a2a4a", borderRadius: "8px", padding: "10px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", marginBottom: "20px", boxSizing: "border-box" }}
            />

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => { setShowModal(false); setNewValue(""); setNewDescription(""); }}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "transparent", border: "1px solid #2a2a4a", color: "#6060a0", fontSize: "13px", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
              >
                Cancelar
              </button>
              <button
                onClick={createCost}
                disabled={creating || !newCostTypeId || !newValue}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", background: (creating || !newCostTypeId || !newValue) ? "#1a1a2e" : "#3b82f6", border: "none", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: (creating || !newCostTypeId || !newValue) ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif" }}
              >
                {creating ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
