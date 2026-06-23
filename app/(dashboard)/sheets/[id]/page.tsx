"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { Sheet } from "@/types";
import { ArrowLeft, Check, Pencil, Plus, Trash2, X } from "lucide-react";
// import { registerPushSubscription } from "@/lib/push";

export default function SheetPage() {
  const { id } = useParams();
  const router = useRouter();

  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [editingSalary, setEditingSalary] = useState(false);
  const [salaryValue, setSalaryValue] = useState(0);
  const [finishModal, setFinishModal] = useState<{ visible: boolean; name: string; result: number }>({ visible: false, name: "", result: 0 });
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => { fetchSheet(); }, [id]);
  // useEffect(() => { registerPushSubscription().catch((err) => console.error("Push registration error:", err)); }, []);

  async function fetchSheet() {
    try {
      const { data } = await api.get(`/sheets/${id}`);
      setSheet(data);
      setSalaryValue(data.salary || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateLine(lineId: string, field: string, value: number) {
    if (!sheet) return;
    setSheet((prev) => prev ? { ...prev, lines: prev.lines.map((l) => l.id === lineId ? { ...l, [field]: value } : l) } : prev);
    try {
      const line = sheet.lines.find((l) => l.id === lineId);
      if (!line) return;
      const updated = {
        deposit: field === "deposit" ? value : line.deposit,
        withdrawal: field === "withdrawal" ? value : line.withdrawal,
        chest: field === "chest" ? value : line.chest,
        bonus: field === "bonus" ? value : line.bonus,
      };
      const { data } = await api.patch(`/sheets/${id}/lines/${lineId}`, updated);
      setSheet((prev) => prev ? { ...prev, lines: prev.lines.map((l) => l.id === lineId ? data : l) } : prev);
      const refKey = `${lineId}-${field}`;
      if (inputRefs.current[refKey]) {
        inputRefs.current[refKey]!.value = String(data[field as keyof typeof data] ?? 0);
      }
      setLastSaved(new Date().toLocaleTimeString("pt-BR"));
    } catch (err) {
      console.error(err);
    }
  }

  async function addLines() {
    try {
      const { data } = await api.post(`/sheets/${id}/lines?quantity=5`);
      setSheet(data);
    } catch (err) { console.error(err); }
  }

  async function removeLine(lineId: string) {
    try {
      const { data } = await api.delete(`/sheets/${id}/lines/${lineId}`);
      setSheet(data);
    } catch (err) { console.error(err); }
  }

  async function clearAll() {
    if (!confirm("Zerar os valores de todas as linhas?")) return;
    try {
      const { data } = await api.post(`/sheets/${id}/clear`);
      setSheet(data);
    } catch (err) { console.error(err); }
  }

  async function updateCost(field: string, value: number) {
    if (!sheet) return;
    setSheet((prev) => prev ? { ...prev, [field]: value } : prev);
    try {
      await api.patch(`/sheets/${id}`, { [field]: value });
      setLastSaved(new Date().toLocaleTimeString("pt-BR"));
    } catch (err) { console.error(err); }
  }

  async function finishSheet() {
    try {
      const { data } = await api.post(`/sheets/${id}/finish`);
      setSheet(data);
      const totalR = data.lines.reduce((acc: number, l: any) => acc + l.withdrawal, 0);
      const totalD = data.lines.reduce((acc: number, l: any) => acc + l.deposit, 0);
      const totalC = data.lines.reduce((acc: number, l: any) => acc + l.chest, 0);
      const totalB = data.lines.reduce((acc: number, l: any) => acc + (l.bonus || 0), 0);
      const result = totalR - totalD + totalC + totalB + (data.salary || 0);
      setFinishModal({ visible: true, name: data.name, result });
      setTimeout(() => setFinishModal({ visible: false, name: "", result: 0 }), 3000);
    } catch (err: any) {
      console.error("finishSheet error:", err);
      alert(err?.response?.data?.detail || err?.message || "Erro ao finalizar planilha");
    }
  }

  function fmt(value: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  }

  function handleKeyDown(e: React.KeyboardEvent, rowIndex: number, field: string) {
    if (!sheet) return;
    const fields = ["deposit", "withdrawal", "chest", "bonus"];
    const colIndex = fields.indexOf(field);
    function focusCell(rowIdx: number, fieldName: string) {
      const targetLine = sheet!.lines[rowIdx];
      if (!targetLine) return;
      const el = inputRefs.current[`${targetLine.id}-${fieldName}`];
      if (el) { el.focus(); el.select(); }
    }
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); focusCell(rowIndex + 1, field); break;
      case "ArrowUp":   e.preventDefault(); focusCell(rowIndex - 1, field); break;
      case "Enter":     e.preventDefault(); focusCell(rowIndex + 1, field); break;
      case "Tab":
        e.preventDefault();
        if (colIndex < fields.length - 1) focusCell(rowIndex, fields[colIndex + 1]);
        else focusCell(rowIndex + 1, fields[0]);
        break;
    }
  }

  if (loading) return <p style={{ color: "#6060a0" }}>Carregando...</p>;
  if (!sheet) return <p style={{ color: "#f87171" }}>Planilha não encontrada.</p>;

  const totalDeposited = sheet.lines.reduce((acc, l) => acc + l.deposit, 0);
  const totalReceived  = sheet.lines.reduce((acc, l) => acc + l.withdrawal, 0);
  const totalChest     = sheet.lines.reduce((acc, l) => acc + l.chest, 0);
  const totalBonus     = sheet.lines.reduce((acc, l) => acc + (l.bonus || 0), 0);
  const finalResult    = totalReceived - totalDeposited + totalChest + totalBonus + sheet.salary;
  const filled         = sheet.lines.filter((l) => l.deposit > 0 || l.withdrawal > 0).length;
  const isFinished     = sheet.status === "FINISHED";
  const depositLines   = sheet.lines.filter((l) => l.deposit > 0).length;
  const averageDeposit = depositLines > 0 ? totalDeposited / depositLines : 0;

  // Cor condicional: só aparece quando o valor for diferente de zero
  function metricColor(value: number, activeColor: string) {
    return value !== 0 ? activeColor : "#3a3a5c";
  }

  const COLS = "44px 1fr 1fr 1fr 1fr 120px 36px";

  return (
    <div>
      {/* ── Topbar sticky ── */}
      <div
        style={{ background: "#0a0a16", border: "1px solid #1a1a2e", borderRadius: "12px", padding: "12px 20px", marginBottom: "20px", position: "sticky", top: "0", zIndex: 20, display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: "12px" }}
      >
        {/* Esquerda: voltar + nome + data */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
          <button onClick={() => router.push("/sheets")} style={{ background: "transparent", border: "none", color: "#6060a0", cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "15px", fontWeight: "700", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sheet.name}</p>
            <p style={{ fontSize: "10px", color: "#6060a0" }}>{new Date(sheet.created_at).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>

        {/* Direita: saved + finalizar */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {lastSaved && (
            <span style={{ fontSize: "11px", color: "#22d3a5", display: "flex", alignItems: "center", gap: "4px" }}>
              <Check size={12} /> {lastSaved}
            </span>
          )}

          {/* Finalizar / Concluída */}
          {!isFinished ? (
            <button onClick={finishSheet} style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", background: "#3b82f6", color: "#fff", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              Finalizar
            </button>
          ) : (
            <span style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", background: "rgba(34,211,165,0.1)", color: "#22d3a5", border: "1px solid rgba(34,211,165,0.25)" }}>
              ✓ Concluída
            </span>
          )}
        </div>
      </div>

      {/* ── Cards de totais (grid-6) ── */}
      <div className="grid-6" style={{ marginBottom: "20px" }}>
        {[
          { label: "Total Depositado", value: totalDeposited,  activeColor: "#a78bfa" },
          { label: "Total Recebido",   value: totalReceived,   activeColor: "#22d3a5" },
          { label: "Total em Baús",    value: totalChest,      activeColor: "#fbbf24" },
          { label: "Salário",          isSalary: true },
          { label: "Média",            value: averageDeposit,  activeColor: "#a78bfa" },
          { label: "Resultado Final",  value: finalResult,     activeColor: finalResult >= 0 ? "#22d3a5" : "#f87171", highlight: true },
        ].map((item) => {
          if (item.isSalary) {
            return (
              <div key="salary" style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "12px", padding: "16px", position: "relative" }}>
                <p style={{ fontSize: "9px", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Salário</p>
                {editingSalary ? (
                  <input
                    type="number"
                    autoFocus
                    value={salaryValue}
                    onChange={(e) => setSalaryValue(Number(e.target.value))}
                    onBlur={() => { updateCost("salary", salaryValue); setEditingSalary(false); }}
                    onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                    style={{ background: "transparent", border: "none", borderBottom: "1px solid #3b82f6", color: "#fff", fontSize: "20px", fontWeight: "700", outline: "none", width: "100%", padding: "2px 0", fontFamily: "Inter, sans-serif" }}
                  />
                ) : (
                  <p
                    onClick={() => { if (!isFinished) setEditingSalary(true); }}
                    style={{ fontSize: "20px", fontWeight: "700", color: salaryValue > 0 ? "#3b82f6" : "#3a3a5c", cursor: isFinished ? "default" : "pointer" }}
                  >
                    {salaryValue > 0 ? "+" : ""}{fmt(salaryValue)}
                  </p>
                )}
                {!isFinished && <Pencil size={11} color="#3b82f6" style={{ position: "absolute", top: "12px", right: "12px", opacity: 0.5 }} />}
              </div>
            );
          }
          const color = metricColor(item.value!, item.activeColor!);
          const showPlus = item.value! > 0;
          const border = item.highlight
            ? `2px solid ${finalResult >= 0 ? "rgba(34,211,165,0.4)" : "rgba(248,113,113,0.4)"}`
            : "1px solid #1a1a2e";
          return (
            <div
              key={item.label}
              style={{ background: item.highlight ? "rgba(59,130,246,0.06)" : "#0f0f1a", border, borderRadius: "14px", padding: "16px" }}
            >
              <p style={{ fontSize: "10px", color: "#6060a0", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</p>
              <p style={{ fontSize: item.highlight ? "clamp(18px, 5vw, 26px)" : "20px", fontWeight: "700", color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {showPlus ? "+" : ""}{fmt(item.value!)}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600" }}>Operações</span>
          <span style={{ fontSize: "9px", background: "#1a1a2e", color: "#6060a0", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace" }}>Enter / Setas</span>
        </div>
        {!isFinished && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={addLines} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", background: "rgba(59,130,246,0.12)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.25)", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              <Plus size={14} /> 5 linhas
            </button>
            <button onClick={clearAll} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", background: "transparent", color: "#6060a0", border: "1px solid #1a1a2e", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              <Trash2 size={14} /> Limpar tudo
            </button>
          </div>
        )}
      </div>

      {/* ── Tabela ── */}
      <div style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "14px", overflow: "hidden" }}>
        {/* Cabeçalho desktop */}
        <div className="table-header-desktop" style={{ gridTemplateColumns: COLS, gap: "16px", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #1a1a2e" }}>
          <span style={{ fontSize: "11px", color: "#6060a0", fontWeight: "600", textAlign: "center" }}>#</span>
          <span style={{ fontSize: "11px", color: "#6060a0", fontWeight: "600" }}>DEPÓSITO</span>
          <span style={{ fontSize: "11px", color: "#6060a0", fontWeight: "600" }}>SAQUE</span>
          <span style={{ fontSize: "11px", color: "#6060a0", fontWeight: "600" }}>BAÚ</span>
          <span style={{ fontSize: "11px", color: "#6060a0", fontWeight: "600" }}>BÔNUS</span>
          <span style={{ fontSize: "11px", color: "#6060a0", fontWeight: "600", textAlign: "right" }}>RESULTADO</span>
          <span />
        </div>

        {sheet.lines.map((line, index) => (
          <div key={line.id}>
            {/* ===== Layout MOBILE: card ===== */}
            <div className="row-mobile" style={{ padding: "14px 16px", borderBottom: "1px solid #141422" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "12px", color: "#6060a0", fontWeight: "600" }}>Operação #{line.line_number}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "15px", fontWeight: "700", color: line.result > 0 ? "#22d3a5" : line.result < 0 ? "#f87171" : "#3a3a5c" }}>
                    {line.result > 0 ? "+" : ""}{fmt(line.result)}
                  </span>
                  {!isFinished && (
                    <button onClick={() => removeLine(line.id)} style={{ background: "transparent", border: "none", color: "#3a3a5c", cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {[
                  { field: "deposit",    label: "Depósito" },
                  { field: "withdrawal", label: "Saque" },
                  { field: "chest",      label: "Baú" },
                  { field: "bonus",      label: "Bônus" },
                ].map(({ field, label }) => (
                  <div key={field}>
                    <label style={{ display: "block", fontSize: "9px", color: "#6060a0", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
                    <div style={{ display: "flex", alignItems: "center", background: "#080810", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "0 8px" }}>
                      <span style={{ fontSize: "10px", color: "#3a3a5c", marginRight: "3px" }}>R$</span>
                      <input
                        ref={(el) => { inputRefs.current[`${line.id}-${field}`] = el; }}
                        type="number"
                        inputMode="decimal"
                        defaultValue={(line as any)[field] || ""}
                        disabled={isFinished}
                        onBlur={(e) => {
                          const newValue = Number(e.target.value);
                          const currentValue = (line as any)[field] || 0;
                          if (newValue !== currentValue) {
                            updateLine(line.id, field, newValue);
                          }
                        }}
                        onKeyDown={(e) => handleKeyDown(e, index, field)}
                        placeholder="0"
                        style={{ background: "transparent", border: "none", color: "#fff", fontSize: "13px", outline: "none", width: "100%", padding: "9px 0", fontFamily: "Inter, sans-serif" }}
                        onFocus={(e) => { (e.target.parentElement as HTMLElement).style.borderColor = "#3b82f6"; e.target.select(); }}
                        onBlurCapture={(e) => { (e.target.parentElement as HTMLElement).style.borderColor = "#1a1a2e"; }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== Layout DESKTOP: linha em grid ===== */}
            <div className="row-desktop" style={{ gridTemplateColumns: COLS, gap: "16px", alignItems: "center", padding: "5px 16px", borderBottom: "1px solid #141422" }}>
              <span style={{ fontSize: "12px", color: "#3a3a5c", textAlign: "center" }}>{line.line_number}</span>
              {["deposit", "withdrawal", "chest", "bonus"].map((field) => (
                <div key={field} style={{ display: "flex", alignItems: "center", background: "#080810", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "0 10px" }}>
                  <span style={{ fontSize: "11px", color: "#3a3a5c", marginRight: "5px" }}>R$</span>
                  <input
                    ref={(el) => { inputRefs.current[`${line.id}-${field}`] = el; }}
                    type="number"
                    defaultValue={(line as any)[field] || ""}
                    disabled={isFinished}
                    onBlur={(e) => {
                      const newValue = Number(e.target.value);
                      const currentValue = (line as any)[field] || 0;
                      if (newValue !== currentValue) {
                        updateLine(line.id, field, newValue);
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(e, index, field)}
                    placeholder="0"
                    style={{ background: "transparent", border: "none", color: "#fff", fontSize: "13px", outline: "none", width: "100%", padding: "7px 0", fontFamily: "Inter, sans-serif" }}
                    onFocus={(e) => { (e.target.parentElement as HTMLElement).style.borderColor = "#3b82f6"; e.target.select(); }}
                    onBlurCapture={(e) => { (e.target.parentElement as HTMLElement).style.borderColor = "#1a1a2e"; }}
                  />
                </div>
              ))}
              <span style={{ fontSize: "14px", fontWeight: "600", textAlign: "right", color: line.result > 0 ? "#22d3a5" : line.result < 0 ? "#f87171" : "#3a3a5c" }}>
                {line.result > 0 ? "+" : ""}{fmt(line.result)}
              </span>
              {!isFinished ? (
                <button onClick={() => removeLine(line.id)} style={{ background: "transparent", border: "none", color: "#3a3a5c", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={15} />
                </button>
              ) : <span />}
            </div>
          </div>
        ))}
      </div>

      {finishModal.visible && (
        <div
          onClick={() => setFinishModal({ visible: false, name: "", result: 0 })}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#0f0f1a", border: "1px solid rgba(34,211,165,0.3)", borderRadius: "20px", padding: "32px 28px", textAlign: "center", maxWidth: "320px", width: "100%", animation: "scaleIn 0.25s ease" }}
          >
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(34,211,165,0.1)", border: "1px solid rgba(34,211,165,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <span style={{ fontSize: "24px" }}>🎯</span>
            </div>
            <p style={{ fontSize: "12px", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>Planilha finalizada</p>
            <p style={{ fontSize: "18px", fontWeight: "700", color: "#fff", marginBottom: "12px" }}>{finishModal.name}</p>
            <p style={{ fontSize: "32px", fontWeight: "700", color: finishModal.result >= 0 ? "#22d3a5" : "#f87171", marginBottom: "24px" }}>
              {finishModal.result >= 0 ? "+" : ""}{fmt(finishModal.result)}
            </p>
            <button
              onClick={() => setFinishModal({ visible: false, name: "", result: 0 })}
              style={{ background: "rgba(34,211,165,0.1)", border: "1px solid rgba(34,211,165,0.3)", borderRadius: "10px", padding: "10px 32px", color: "#22d3a5", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
