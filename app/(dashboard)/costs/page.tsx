"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { DollarSign, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Modal, ModalContent, ModalBody, ModalFooter, ModalClose } from "@/components/ui/modal";

const CARET =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C8C94' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")";

const MODAL_LABEL: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  color: "var(--text-secondary)",
  marginBottom: "6px",
};

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

  useEffect(() => { fetchCostTypes(); }, []);
  useEffect(() => { fetchCosts(); }, [month, year]);

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
      <PageHeader title="Custos" subtitle="Gerencie seus custos mensais" />

      {/* Filtro mês/ano + total */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={prevMonth}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "7px 10px", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", transition: "border-color 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            <ChevronLeft size={16} />
          </button>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "7px 18px",
              fontSize: "13px",
              fontWeight: "600",
              minWidth: "140px",
              textAlign: "center",
              color: "var(--text)",
            }}
          >
            {MONTH_NAMES[month - 1]} {year}
          </div>
          <button
            onClick={nextMonth}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "7px 10px", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", transition: "border-color 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Card
            variant="compact"
            style={{ padding: "10px 20px", textAlign: "center" }}
          >
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "2px" }}>
              Total do mês
            </p>
            <p style={{ fontSize: "20px", fontWeight: "700", fontVariantNumeric: "tabular-nums", color: "var(--negative-text)" }}>
              R$ {total.toFixed(2).replace(".", ",")}
            </p>
          </Card>
          <Button
            variant="primary"
            onClick={() => { setShowModal(true); if (costTypes.length > 0) setNewCostTypeId(costTypes[0].id); }}
            style={{ gap: "7px" }}
          >
            <Plus size={14} />
            Novo Custo
          </Button>
        </div>
      </div>

      {/* Lista de custos */}
      <Card style={{ padding: "24px" }}>
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Carregando...</p>
        ) : costs.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", padding: "32px" }}>
            Nenhum custo registrado em {MONTH_NAMES[month - 1]} {year}.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Tipo", "Valor", "Descrição", "Data", ""].map((h) => (
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
              {costs.map((c) => (
                <tr
                  key={c.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "7px",
                          background: "var(--positive-subtle)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <DollarSign size={13} color="var(--positive)" />
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)" }}>
                        {c.cost_type.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--negative-text)", fontVariantNumeric: "tabular-nums" }}>
                      R$ {Number(c.value).toFixed(2).replace(".", ",")}
                    </span>
                  </td>
                  <td style={{ padding: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
                    {c.description || "—"}
                  </td>
                  <td style={{ padding: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
                    {new Date(c.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <button
                      onClick={() => deleteCost(c.id)}
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

      {/* Modal: Novo Custo */}
      <Modal
        open={showModal}
        onOpenChange={(open) => {
          if (!open) { setShowModal(false); setNewValue(""); setNewDescription(""); }
        }}
      >
        <ModalContent title="Novo Custo" maxWidth={400}>
          <ModalBody>
            <div>
              <label style={MODAL_LABEL}>Tipo de Custo</label>
              <select
                value={newCostTypeId}
                onChange={(e) => setNewCostTypeId(e.target.value)}
                className="ui-select"
                style={{ backgroundImage: CARET, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "36px" }}
              >
                {costTypes.length === 0 && <option value="">Nenhum tipo cadastrado</option>}
                {costTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={MODAL_LABEL}>Valor (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="0,00"
                className="ui-input"
              />
            </div>

            <div>
              <label style={MODAL_LABEL}>Descrição (opcional)</label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Ex: Aluguel do servidor"
                className="ui-input"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="ghost">Cancelar</Button>
            </ModalClose>
            <Button
              variant="primary"
              onClick={createCost}
              disabled={creating || !newCostTypeId || !newValue}
            >
              {creating ? "Salvando..." : "Salvar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
