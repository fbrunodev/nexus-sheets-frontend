"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { Sheet } from "@/types";
import { Plus, FileSpreadsheet, Trophy } from "lucide-react";

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  NOT_STARTED: { label: "Não iniciada", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  IN_PROGRESS: { label: "Em andamento", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  FINISHED: { label: "Concluída", color: "#22d3a5", bg: "rgba(34,211,165,0.1)" },
};

export default function SheetsPage() {
  const router = useRouter();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLines, setNewLines] = useState(10);

  useEffect(() => {
    fetchSheets();
  }, []);

  async function fetchSheets() {
    try {
      const { data } = await api.get("/sheets/");
      setSheets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const { data } = await api.post("/sheets/", {
        name: newName,
        initial_lines: newLines,
      });
      setSheets((prev) => [data, ...prev]);
      setShowModal(false);
      setNewName("");
      setNewLines(10);
      router.push(`/sheets/${data.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function calcTotal(sheet: Sheet) {
    const received = sheet.lines.reduce((acc, l) => acc + l.withdrawal, 0);
    const chest = sheet.lines.reduce((acc, l) => acc + l.chest, 0);
    const deposited = sheet.lines.reduce((acc, l) => acc + l.deposit, 0);
    const costs = sheet.cost_proxy + sheet.cost_sms + sheet.cost_bot + sheet.cost_fintech;
    return received + chest - deposited - costs;
  }

  const total = sheets.reduce((acc, s) => acc + calcTotal(s), 0);
  const notStarted = sheets.filter((s) => s.status === "NOT_STARTED").length;
  const inProgress = sheets.filter((s) => s.status === "IN_PROGRESS").length;
  const finished = sheets.filter((s) => s.status === "FINISHED").length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px" }}>Planilhas</h1>
          <p style={{ color: "#6060a0", fontSize: "13px" }}>Gerencie e acompanhe suas planilhas</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "10px", padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <FileSpreadsheet size={14} color="#3b82f6" />
            <span style={{ fontSize: "13px", color: "#6060a0" }}>Total Geral</span>
            <span style={{ fontSize: "14px", fontWeight: "700", color: total >= 0 ? "#22d3a5" : "#f87171" }}>
              {formatCurrency(total)}
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "#3b82f6", border: "none", borderRadius: "10px", padding: "10px 18px", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
          >
            <Plus size={16} />
            Nova Planilha
          </button>
        </div>
      </div>

      {/* Filtros de status */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {[
          { label: "Todas", count: sheets.length },
          { label: "Não iniciada", count: notStarted },
          { label: "Iniciada", count: inProgress },
          { label: "Finalizada", count: finished },
        ].map((tab) => (
          <button key={tab.label} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", fontSize: "13px", background: tab.label === "Todas" ? "rgba(255,255,255,0.06)" : "transparent", border: "1px solid #1a1a2e", color: tab.label === "Todas" ? "#fff" : "#6060a0", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            {tab.label}
            <span style={{ background: "#1a1a2e", borderRadius: "20px", padding: "1px 7px", fontSize: "11px" }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Contadores */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total", value: sheets.length, color: "#fff" },
          { label: "Não Iniciadas", value: notStarted, color: "#fbbf24" },
          { label: "Iniciadas", value: inProgress, color: "#3b82f6" },
          { label: "Finalizadas", value: finished, color: "#22d3a5", icon: <Trophy size={18} color="#22d3a5" /> },
        ].map((item) => (
          <div key={item.label} style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "11px", color: "#6060a0", marginBottom: "4px" }}>{item.label}</p>
              <p style={{ fontSize: "24px", fontWeight: "700", color: item.color }}>{item.value}</p>
            </div>
            {item.icon}
          </div>
        ))}
      </div>

      {/* Lista de planilhas */}
      {loading ? (
        <p style={{ color: "#6060a0", fontSize: "14px" }}>Carregando...</p>
      ) : sheets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#3a3a5c" }}>
          <FileSpreadsheet size={40} style={{ marginBottom: "12px", opacity: 0.4 }} />
          <p style={{ fontSize: "14px" }}>Nenhuma planilha encontrada</p>
          <p style={{ fontSize: "12px", marginTop: "4px" }}>Crie uma nova planilha para começar</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
          {sheets.map((sheet) => {
            const total = calcTotal(sheet);
            const status = statusLabels[sheet.status];
            const filledLines = sheet.lines.filter((l) => l.deposit > 0 || l.withdrawal > 0).length;
            const progress = sheet.lines.length > 0 ? (filledLines / sheet.lines.length) * 100 : 0;

            return (
              <div
                key={sheet.id}
                onClick={() => router.push(`/sheets/${sheet.id}`)}
                style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "14px", padding: "20px", cursor: "pointer", transition: "border-color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1a1a2e")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: "600", marginBottom: "3px" }}>{sheet.name}</p>
                    <p style={{ fontSize: "11px", color: "#6060a0" }}>
                      {new Date(sheet.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span style={{ background: status.bg, color: status.color, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "500" }}>
                    {status.label}
                  </span>
                </div>

                {/* Progresso */}
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "11px", color: "#6060a0" }}>LINHAS</span>
                    <span style={{ fontSize: "11px", color: "#6060a0" }}>{filledLines}/{sheet.lines.length}</span>
                  </div>
                  <div style={{ height: "4px", background: "#1a1a2e", borderRadius: "2px" }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: "#3b82f6", borderRadius: "2px", transition: "width 0.3s" }} />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#6060a0" }}>TOTAL:</span>
                  <span style={{ fontSize: "16px", fontWeight: "700", color: total >= 0 ? "#22d3a5" : "#f87171" }}>
                    {total >= 0 ? "+" : ""}{formatCurrency(total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal criar planilha */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "18px", padding: "32px", width: "100%", maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "24px" }}>Nova Planilha</h2>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "500", color: "#6060a0", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Nome
              </label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Operação 60dp"
                autoFocus
                style={{ width: "100%", background: "#080810", border: "1px solid #1a1a2e", borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif" }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "500", color: "#6060a0", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Número de linhas
              </label>
              <input
                type="number"
                value={newLines}
                onChange={(e) => setNewLines(Number(e.target.value))}
                min={1}
                max={200}
                style={{ width: "100%", background: "#080810", border: "1px solid #1a1a2e", borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", background: "transparent", border: "1px solid #1a1a2e", color: "#6060a0", fontSize: "14px", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", background: creating || !newName.trim() ? "#1a1a2e" : "#3b82f6", border: "none", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: creating || !newName.trim() ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif" }}
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