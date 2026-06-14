"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { Sheet } from "@/types";
import { ArrowLeft, Check, Plus, Trash2, X } from "lucide-react";



export default function SheetPage() {
  const { id } = useParams();
  const router = useRouter();

  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => { fetchSheet(); }, [id]);

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
    setSheet((prev) => prev ? { ...prev, lines: prev.lines.map((l) => l.id === lineId ? { ...l, [field]: value } : l) } : prev);
    try {
      const line = sheet.lines.find((l) => l.id === lineId);
      if (!line) return;
      const updated = {
        deposit: field === "deposit" ? value : line.deposit,
        withdrawal: field === "withdrawal" ? value : line.withdrawal,
        chest: field === "chest" ? value : line.chest,
      };
      const { data } = await api.patch(`/sheets/${id}/lines/${lineId}`, updated);
      setSheet((prev) => prev ? { ...prev, lines: prev.lines.map((l) => l.id === lineId ? data : l) } : prev);
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
    } catch (err) { console.error(err); }
  }

  function fmt(value: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  }

  function handleKeyDown(e: React.KeyboardEvent, rowIndex: number, field: string) {
    if (!sheet) return;
    const fields = ["deposit", "withdrawal", "chest"];
    const colIndex = fields.indexOf(field);
    function focusCell(rowIdx: number, fieldName: string) {
      const targetLine = sheet!.lines[rowIdx];
      if (!targetLine) return;
      const el = inputRefs.current[`${targetLine.id}-${fieldName}`];
      if (el) { el.focus(); el.select(); }
    }
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); focusCell(rowIndex + 1, field); break;
      case "ArrowUp": e.preventDefault(); focusCell(rowIndex - 1, field); break;
      case "Enter": e.preventDefault(); focusCell(rowIndex + 1, field); break;
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
  const totalReceived = sheet.lines.reduce((acc, l) => acc + l.withdrawal, 0);
  const totalChest = sheet.lines.reduce((acc, l) => acc + l.chest, 0);
  const totalCosts = sheet.cost_proxy + sheet.cost_sms + sheet.cost_bot + sheet.cost_fintech;
  const finalResult = totalReceived - totalDeposited + totalChest + sheet.salary - totalCosts;
  const filled = sheet.lines.filter((l) => l.deposit > 0 || l.withdrawal > 0).length;
  const isFinished = sheet.status === "FINISHED";
  const goalProgress = sheet.goal > 0 ? Math.min((filled / sheet.goal) * 100, 100) : 0;
  const depositLines = sheet.lines.filter((l) => l.deposit > 0).length;
  const averageDeposit = depositLines > 0 ? totalDeposited / depositLines : 0;

  const inputStyle = {
    background: "#080810",
    border: "1px solid #1a1a2e",
    borderRadius: "8px",
    padding: "9px 12px",
    fontSize: "13px",
    color: "#fff",
    width: "100%",
    outline: "none",
    fontFamily: "Inter, sans-serif",
  };

  return (
    <div>
      {/* Barra sticky */}
       <div className="sheet-topbar" style={{ background: "#0a0a16", border: "1px solid #1a1a2e", borderRadius: "12px", padding: "14px 20px", marginBottom: "20px", position: "sticky", top: "0", zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button onClick={() => router.push("/sheets")} style={{ background: "transparent", border: "none", color: "#6060a0", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <p style={{ fontSize: "16px", fontWeight: "700", textTransform: "uppercase" }}>{sheet.name}</p>
            <p style={{ fontSize: "10px", color: "#6060a0" }}>{new Date(sheet.created_at).toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
         <div className="sheet-topbar-metrics">
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "9px", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em" }}>Saldo</p>
            <p style={{ fontSize: "15px", fontWeight: "700", color: finalResult >= 0 ? "#3b82f6" : "#f87171" }}>{fmt(finalResult)}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "9px", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em" }}>Operações</p>
            <p style={{ fontSize: "15px", fontWeight: "700" }}>{filled}</p>
          </div>
          {sheet.goal > 0 && (
            <div>
              <p style={{ fontSize: "9px", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>Meta · {filled}/{sheet.goal}</p>
              <div style={{ width: "90px", height: "3px", background: "#1a1a2e", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${goalProgress}%`, background: "#3b82f6" }} />
              </div>
            </div>
          )}
          {lastSaved && (
            <span style={{ fontSize: "11px", color: "#22d3a5", display: "flex", alignItems: "center", gap: "4px" }}>
              <Check size={12} /> {lastSaved}
            </span>
          )}
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

      {/* Faixa Descontos & Salário */}
      <div style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "14px", padding: "18px 20px", marginBottom: "16px" }}>
        <p style={{ fontSize: "11px", fontWeight: "600", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>Descontos & Salário</p>
        <div className="grid-5">
          {[
            { label: "Proxy", field: "cost_proxy" },
            { label: "SMS", field: "cost_sms" },
            { label: "Bot", field: "cost_bot" },
            { label: "Fintech", field: "cost_fintech" },
            { label: "Salário", field: "salary" },
          ].map((item) => (
            <div key={item.field}>
              <label style={{ display: "block", fontSize: "10px", color: item.field === "salary" ? "#3b82f6" : "#6060a0", marginBottom: "6px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</label>
              <div style={{ display: "flex", alignItems: "center", background: "#080810", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "0 12px" }}>
                <span style={{ fontSize: "12px", color: "#3a3a5c", marginRight: "6px" }}>R$</span>
                <input type="number" defaultValue={(sheet as any)[item.field] || 0} disabled={isFinished} onBlur={(e) => updateCost(item.field, Number(e.target.value))} style={{ background: "transparent", border: "none", color: "#fff", fontSize: "13px", outline: "none", width: "100%", padding: "9px 0", fontFamily: "Inter, sans-serif" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cards de totais */}
      <div className="grid-6" style={{ marginBottom: "20px" }}>
        {[
          { label: "Total Depositado", value: totalDeposited, color: "#f87171" },
          { label: "Total Recebido", value: totalReceived, color: "#22d3a5" },
          { label: "Total em Baús", value: totalChest, color: "#fbbf24" },
          { label: "Salário", value: sheet.salary, color: "#3b82f6" },
          { label: "Média", value: averageDeposit, color: "#a78bfa" },
          { label: "Resultado Final", value: finalResult, color: finalResult >= 0 ? "#22d3a5" : "#f87171", highlight: true },
        ].map((item) => (
          <div key={item.label} style={{ background: item.highlight ? "rgba(59,130,246,0.06)" : "#0f0f1a", border: `1px solid ${item.highlight ? "rgba(59,130,246,0.25)" : "#1a1a2e"}`, borderRadius: "14px", padding: "16px" }}>
            <p style={{ fontSize: "10px", color: "#6060a0", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</p>
            <p style={{ fontSize: "20px", fontWeight: "700", color: item.color }}>{item.value >= 0 ? "+" : ""}{fmt(item.value)}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
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

      {/* Tabela */}
      <div style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "14px", overflow: "hidden" }}>
        <div className="table-header-desktop" style={{ gridTemplateColumns: "50px 1fr 1fr 1fr 140px 40px", gap: "16px", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #1a1a2e" }}>
          <span style={{ fontSize: "11px", color: "#6060a0", fontWeight: "600", textAlign: "center" }}>#</span>
          <span style={{ fontSize: "11px", color: "#6060a0", fontWeight: "600" }}>DEPÓSITO</span>
          <span style={{ fontSize: "11px", color: "#6060a0", fontWeight: "600" }}>SAQUE</span>
          <span style={{ fontSize: "11px", color: "#6060a0", fontWeight: "600" }}>BAÚ</span>
          <span style={{ fontSize: "11px", color: "#6060a0", fontWeight: "600", textAlign: "right" }}>RESULTADO</span>
          <span></span>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {[
                  { field: "deposit", label: "Depósito" },
                  { field: "withdrawal", label: "Saque" },
                  { field: "chest", label: "Baú" },
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
                        onBlur={(e) => updateLine(line.id, field, Number(e.target.value))}
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
            <div className="row-desktop" style={{ gridTemplateColumns: "50px 1fr 1fr 1fr 140px 40px", gap: "16px", alignItems: "center", padding: "8px 20px", borderBottom: "1px solid #141422" }}>
              <span style={{ fontSize: "12px", color: "#3a3a5c", textAlign: "center" }}>{line.line_number}</span>
              {["deposit", "withdrawal", "chest"].map((field) => (
                <div key={field} style={{ display: "flex", alignItems: "center", background: "#080810", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "0 12px", maxWidth: "180px" }}>
                  <span style={{ fontSize: "11px", color: "#3a3a5c", marginRight: "5px" }}>R$</span>
                  <input
                    ref={(el) => { inputRefs.current[`${line.id}-${field}-desktop`] = el; }}
                    type="number"
                    defaultValue={(line as any)[field] || ""}
                    disabled={isFinished}
                    onBlur={(e) => updateLine(line.id, field, Number(e.target.value))}
                    onKeyDown={(e) => handleKeyDown(e, index, field)}
                    placeholder="0"
                    style={{ background: "transparent", border: "none", color: "#fff", fontSize: "13px", outline: "none", width: "100%", padding: "8px 0", fontFamily: "Inter, sans-serif" }}
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
    </div>
  );
}