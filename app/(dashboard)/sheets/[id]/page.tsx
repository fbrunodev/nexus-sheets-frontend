"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { Sheet } from "@/types";
import { ArrowLeft, Check, RotateCcw, Plus, Minus } from "lucide-react";

export default function SheetPage() {
  const { id } = useParams();
  const router = useRouter();

  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    fetchSheet();
  }, [id]);

  async function fetchSheet() {
    try {
      const { data } = await api.get(`/sheets/${id}`);
      setSheet(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateLine(lineId: string, field: string, value: number) {
    if (!sheet) return;

    // Atualiza localmente para feedback imediato (optimistic update)
    setSheet((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lines: prev.lines.map((l) =>
          l.id === lineId ? { ...l, [field]: value } : l
        ),
      };
    });

    setSaving(true);
    try {
      const line = sheet.lines.find((l) => l.id === lineId);
      if (!line) return;

      const updated = {
        deposit: field === "deposit" ? value : line.deposit,
        withdrawal: field === "withdrawal" ? value : line.withdrawal,
        chest: field === "chest" ? value : line.chest,
      };

      const { data } = await api.patch(`/sheets/${id}/lines/${lineId}`, updated);

      // Atualiza o resultado calculado pelo backend
      setSheet((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lines: prev.lines.map((l) => (l.id === lineId ? data : l)),
        };
      });

      setLastSaved(new Date().toLocaleTimeString("pt-BR"));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function updateCosts(field: string, value: number) {
    if (!sheet) return;
    setSheet((prev) => prev ? { ...prev, [field]: value } : prev);

    try {
      await api.patch(`/sheets/${id}`, { [field]: value });
      setLastSaved(new Date().toLocaleTimeString("pt-BR"));
    } catch (err) {
      console.error(err);
    }
  }

  async function finishSheet() {
    try {
      const { data } = await api.post(`/sheets/${id}/finish`);
      setSheet(data);
    } catch (err) {
      console.error(err);
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  if (loading) return <p style={{ color: "#6060a0" }}>Carregando...</p>;
  if (!sheet) return <p style={{ color: "#f87171" }}>Planilha não encontrada.</p>;

  const totalDeposited = sheet.lines.reduce((acc, l) => acc + l.deposit, 0);
  const totalReceived = sheet.lines.reduce((acc, l) => acc + l.withdrawal, 0);
  const totalChest = sheet.lines.reduce((acc, l) => acc + l.chest, 0);
  const totalCosts = sheet.cost_proxy + sheet.cost_sms + sheet.cost_bot + sheet.cost_fintech;
  const finalResult = totalReceived + totalChest - totalDeposited - totalCosts;
  const isFinished = sheet.status === "FINISHED";

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => router.push("/sheets")}
            style={{ background: "transparent", border: "none", color: "#6060a0", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontFamily: "Inter, sans-serif" }}
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <h1 style={{ fontSize: "22px", fontWeight: "700", textTransform: "uppercase" }}>
            {sheet.name}
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {lastSaved && (
            <span style={{ fontSize: "12px", color: "#22d3a5", display: "flex", alignItems: "center", gap: "5px" }}>
              <Check size={12} />
              Salvo às {lastSaved}
            </span>
          )}
          {!isFinished && (
            <button
              onClick={finishSheet}
              style={{ background: "#fbbf24", border: "none", borderRadius: "10px", padding: "9px 18px", color: "#080810", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
            >
              Finalizar Planilha
            </button>
          )}
          {isFinished && (
            <span style={{ background: "rgba(34,211,165,0.1)", border: "1px solid rgba(34,211,165,0.25)", borderRadius: "10px", padding: "9px 18px", color: "#22d3a5", fontSize: "13px", fontWeight: "600" }}>
              ✓ Concluída
            </span>
          )}
        </div>
      </div>

      {/* Descontos e salário */}
      <div style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
        <p style={{ fontSize: "12px", fontWeight: "600", color: "#6060a0", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Descontos & Salário
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
          {[
            { label: "Proxy", field: "cost_proxy" },
            { label: "SMS", field: "cost_sms" },
            { label: "Bot", field: "cost_bot" },
            { label: "Fintech", field: "cost_fintech" },
            { label: "Salário", field: "salary" },
          ].map((item) => (
            <div key={item.field}>
              <label style={{ display: "block", fontSize: "11px", color: item.field === "salary" ? "#3b82f6" : "#6060a0", marginBottom: "6px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {item.label}
              </label>
              <div style={{ display: "flex", alignItems: "center", background: "#080810", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "8px 12px" }}>
                <span style={{ fontSize: "12px", color: "#3a3a5c", marginRight: "6px" }}>R$</span>
                <input
                  type="number"
                  defaultValue={(sheet as any)[item.field] || 0}
                  disabled={isFinished}
                  onBlur={(e) => updateCosts(item.field, Number(e.target.value))}
                  style={{ background: "transparent", border: "none", color: "#fff", fontSize: "14px", outline: "none", width: "100%", fontFamily: "Inter, sans-serif" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cards de totais */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Total depositado", value: totalDeposited, color: "#f87171" },
          { label: "Total recebido", value: totalReceived, color: "#22d3a5" },
          { label: "Total em baús", value: totalChest, color: "#fbbf24" },
          { label: "Salário", value: sheet.salary, color: "#3b82f6" },
          { label: "Resultado final", value: finalResult, color: finalResult >= 0 ? "#22d3a5" : "#f87171" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: item.label === "Resultado final" ? "rgba(59,130,246,0.06)" : "#0f0f1a",
              border: `1px solid ${item.label === "Resultado final" ? "rgba(59,130,246,0.25)" : "#1a1a2e"}`,
              borderRadius: "14px",
              padding: "16px",
            }}
          >
            <p style={{ fontSize: "10px", color: "#6060a0", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {item.label}
            </p>
            <p style={{ fontSize: "20px", fontWeight: "700", color: item.color }}>
              {item.value >= 0 ? "+" : ""}{formatCurrency(item.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Tabela de linhas */}
      <div style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "14px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1a1a2e" }}>
              {["#", "DEPÓSITO", "SAQUE", "BAÚ", "RESULTADO"].map((h) => (
                <th key={h} style={{ padding: "14px 16px", textAlign: h === "#" ? "center" : "left", fontSize: "11px", fontWeight: "600", color: "#6060a0", letterSpacing: "0.06em" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheet.lines.map((line) => (
              <tr
                key={line.id}
                style={{ borderBottom: "1px solid #1a1a2e" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.01)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "10px 16px", textAlign: "center", fontSize: "12px", color: "#3a3a5c", width: "50px" }}>
                  {line.line_number}
                </td>
                {["deposit", "withdrawal", "chest"].map((field) => (
                  <td key={field} style={{ padding: "8px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", background: "#080810", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "7px 10px", maxWidth: "140px" }}>
                      <span style={{ fontSize: "11px", color: "#3a3a5c", marginRight: "5px" }}>R$</span>
                      <input
                        type="number"
                        defaultValue={(line as any)[field] || ""}
                        disabled={isFinished}
                        onBlur={(e) => updateLine(line.id, field, Number(e.target.value))}
                        placeholder="0"
                        style={{ background: "transparent", border: "none", color: "#fff", fontSize: "13px", outline: "none", width: "100%", fontFamily: "Inter, sans-serif" }}
                      />
                    </div>
                  </td>
                ))}
                <td style={{ padding: "10px 16px", fontSize: "14px", fontWeight: "600", color: line.result > 0 ? "#22d3a5" : line.result < 0 ? "#f87171" : "#3a3a5c" }}>
                  {line.result > 0 ? "+" : ""}{formatCurrency(line.result)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}