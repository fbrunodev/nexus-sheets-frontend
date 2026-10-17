"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { Sheet } from "@/types";
import { ArrowLeft, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Modal, ModalContent, ModalBody, ModalFooter } from "@/components/ui/modal";

export default function SheetPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [editingSalary, setEditingSalary] = useState(false);
  const [salaryValue, setSalaryValue] = useState(0);
  const [finishModal, setFinishModal] = useState<{ visible: boolean; name: string; result: number }>({ visible: false, name: "", result: 0 });
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => { fetchSheet(); }, [id]);

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
        deposit:    field === "deposit"    ? value : line.deposit,
        withdrawal: field === "withdrawal" ? value : line.withdrawal,
        chest:      field === "chest"      ? value : line.chest,
        bonus:      field === "bonus"      ? value : line.bonus,
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

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Carregando...</p>;
  if (!sheet)  return <p style={{ color: "var(--negative-text)" }}>Planilha não encontrada.</p>;

  const totalDeposited = sheet.lines.reduce((acc, l) => acc + l.deposit, 0);
  const totalReceived  = sheet.lines.reduce((acc, l) => acc + l.withdrawal, 0);
  const totalChest     = sheet.lines.reduce((acc, l) => acc + l.chest, 0);
  const totalBonus     = sheet.lines.reduce((acc, l) => acc + (l.bonus || 0), 0);
  const finalResult    = totalReceived - totalDeposited + totalChest + totalBonus + (sheet.cooperation_type !== "BAU" ? sheet.salary : 0);
  const filled         = sheet.lines.filter((l) => l.deposit > 0 || l.withdrawal > 0).length;
  const isFinished     = sheet.status === "FINISHED";
  const isReadOnly     = sheet.owner_id !== user?.id;
  const depositLines   = sheet.lines.filter((l) => l.deposit > 0).length;
  const averageDeposit = depositLines > 0 ? totalDeposited / depositLines : 0;

  const COLS = "44px 1fr 1fr 1fr 1fr 120px 36px";

  return (
    <div>
      {/* ── Topbar sticky ── */}
      <div
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "12px 20px",
          marginBottom: "20px",
          position: "sticky",
          top: "0",
          zIndex: 20,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* Esquerda: voltar + nome + data */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
          <button
            onClick={() => router.push("/sheets")}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0, transition: "color 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
              <p style={{ fontSize: "15px", fontWeight: "700", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text)" }}>
                {sheet.name}
              </p>
              <Badge variant="neutral" size="sm">
                {sheet.cooperation_type}
              </Badge>
              {isReadOnly && (
                <span
                  style={{
                    flexShrink: 0,
                    background: "var(--warning-subtle)",
                    color: "var(--warning)",
                    border: "1px solid var(--warning-border)",
                    borderRadius: "6px",
                    padding: "2px 8px",
                    fontSize: "10px",
                    fontWeight: "600",
                  }}
                >
                  Somente leitura
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                {new Date(sheet.created_at).toLocaleDateString("pt-BR")}
              </p>
              {sheet.cooperation_type === "META" && sheet.goal > 0 && (
                <p style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                  Meta: <span style={{ color: "var(--text)", fontWeight: "600" }}>{sheet.goal}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Direita: saved + finalizar */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {lastSaved && (
            <span style={{ fontSize: "11px", color: "var(--positive)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Check size={12} /> {lastSaved}
            </span>
          )}
          {!isFinished && !isReadOnly ? (
            <Button variant="primary" onClick={finishSheet}>Finalizar</Button>
          ) : isFinished ? (
            <span
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "600",
                background: "var(--positive-subtle)",
                color: "var(--positive)",
                border: "1px solid var(--positive-border)",
              }}
            >
              ✓ Concluída
            </span>
          ) : null}
        </div>
      </div>

      {/* ── Cards de totais ── */}
      <div className={sheet.cooperation_type === "BAU" ? "grid-5" : "grid-6"} style={{ marginBottom: "20px" }}>
        {[
          { label: "Total Depositado", value: totalDeposited,  activeColor: "var(--text-secondary)" },
          { label: "Total Recebido",   value: totalReceived,   activeColor: "var(--positive)" },
          { label: "Total em Baús",    value: totalChest,      activeColor: "var(--warning)" },
          ...(sheet.cooperation_type === "BAU" ? [{ label: "Total em Bônus", value: totalBonus, activeColor: "var(--text-secondary)" }] : []),
          ...(sheet.cooperation_type !== "BAU" ? [{ label: "Salário", isSalary: true }] : []),
          ...(sheet.cooperation_type !== "BAU" ? [{ label: "Média", value: averageDeposit, activeColor: "var(--text-secondary)" }] : []),
          { label: "Resultado Final", value: finalResult, activeColor: finalResult >= 0 ? "var(--positive)" : "var(--negative-text)", highlight: true },
        ].map((item) => {
          if (item.isSalary) {
            return (
              <Card
                key="salary"
                style={{ padding: "16px", position: "relative" }}
              >
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>Salário</p>
                {editingSalary ? (
                  <input
                    type="number"
                    autoFocus
                    value={salaryValue}
                    onChange={(e) => setSalaryValue(Number(e.target.value))}
                    onBlur={() => { updateCost("salary", salaryValue); setEditingSalary(false); }}
                    onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                    style={{ background: "transparent", border: "none", borderBottom: "1px solid var(--accent)", color: "var(--text)", fontSize: "20px", fontWeight: "700", outline: "none", width: "100%", padding: "2px 0", fontFamily: "inherit" }}
                  />
                ) : (
                  <p
                    onClick={() => { if (!isFinished && !isReadOnly) setEditingSalary(true); }}
                    style={{ fontSize: "20px", fontWeight: "700", color: salaryValue > 0 ? "var(--accent)" : "var(--text-muted)", cursor: (isFinished || isReadOnly) ? "default" : "pointer" }}
                  >
                    {salaryValue > 0 ? "+" : ""}{fmt(salaryValue)}
                  </p>
                )}
                {!isFinished && !isReadOnly && (
                  <Pencil size={11} color="var(--accent)" style={{ position: "absolute", top: "12px", right: "12px", opacity: 0.5 }} />
                )}
              </Card>
            );
          }
          const color = (item.value ?? 0) !== 0 ? item.activeColor! : "var(--text-muted)";
          const showPlus = (item.value ?? 0) > 0;
          return (
            <Card
              key={item.label}
              highlight={item.highlight}
              tone={item.highlight ? (finalResult >= 0 ? "positive" : "negative") : undefined}
              style={{ padding: "16px" }}
            >
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                {item.label}
              </p>
              <p
                style={{
                  fontSize: item.highlight ? "clamp(18px, 5vw, 26px)" : "20px",
                  fontWeight: "700",
                  color,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {showPlus ? "+" : ""}{fmt(item.value!)}
              </p>
            </Card>
          );
        })}
      </div>

      {/* ── Progresso de meta ── */}
      {sheet.cooperation_type === "META" && sheet.goal > 0 && (
        <Card style={{ padding: "16px 20px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)" }}>Progresso da Meta</span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{filled}/{sheet.goal} operações</span>
          </div>
          <div style={{ background: "var(--border)", borderRadius: "100px", height: "8px", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${Math.min((filled / sheet.goal) * 100, 100)}%`,
                background: filled >= sheet.goal ? "var(--positive)" : "var(--accent)",
                borderRadius: "100px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          {filled >= sheet.goal && (
            <p style={{ fontSize: "11px", color: "var(--positive)", marginTop: "8px", fontWeight: "600" }}>
              ✓ Meta atingida!
            </p>
          )}
        </Card>
      )}

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>Operações</span>
          <span
            style={{
              fontSize: "9px",
              background: "var(--border)",
              color: "var(--text-muted)",
              padding: "2px 6px",
              borderRadius: "4px",
              fontFamily: "monospace",
            }}
          >
            Enter / Setas
          </span>
        </div>
        {!isFinished && !isReadOnly && (
          <div style={{ display: "flex", gap: "8px" }}>
            <Button variant="secondary" onClick={addLines} style={{ gap: "5px", fontSize: "12px" }}>
              <Plus size={14} /> 5 linhas
            </Button>
            <Button variant="ghost" onClick={clearAll} style={{ gap: "5px", fontSize: "12px" }}>
              <Trash2 size={14} /> Limpar tudo
            </Button>
          </div>
        )}
      </div>

      {/* ── Tabela ── */}
      <Card style={{ overflow: "hidden" }}>
        {/* Cabeçalho desktop */}
        <div
          className="table-header-desktop"
          style={{
            gridTemplateColumns: COLS,
            gap: "16px",
            alignItems: "center",
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center" }}>#</span>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Depósito</span>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Saque</span>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Baú</span>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Bônus</span>
          <span style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "right" }}>Resultado</span>
          <span />
        </div>

        {sheet.lines.map((line, index) => (
          <div key={line.id}>
            {/* ===== Mobile: card ===== */}
            <div
              className="row-mobile"
              style={{ padding: "14px 16px", borderBottom: "1px solid var(--surface-hover)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
                  Operação #{line.line_number}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: "700",
                      fontVariantNumeric: "tabular-nums",
                      color: line.result > 0 ? "var(--positive)" : line.result < 0 ? "var(--negative-text)" : "var(--text-muted)",
                    }}
                  >
                    {line.result > 0 ? "+" : ""}{fmt(line.result)}
                  </span>
                  {!isFinished && !isReadOnly && (
                    <button
                      onClick={() => removeLine(line.id)}
                      style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
                    >
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
                    <label style={{ display: "block", fontSize: "9px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {label}
                    </label>
                    <div className="ui-cell">
                      <span style={{ fontSize: "10px", color: "var(--text-muted)", marginRight: "3px" }}>R$</span>
                      <input
                        ref={(el) => { inputRefs.current[`${line.id}-${field}`] = el; }}
                        type="number"
                        inputMode="decimal"
                        defaultValue={(line as any)[field] || ""}
                        disabled={isFinished || isReadOnly}
                        onBlur={(e) => {
                          const newValue = Number(e.target.value);
                          const currentValue = (line as any)[field] || 0;
                          if (newValue !== currentValue) updateLine(line.id, field, newValue);
                        }}
                        onKeyDown={(e) => handleKeyDown(e, index, field)}
                        placeholder="0"
                        style={{ background: "transparent", border: "none", color: "var(--text)", fontSize: "13px", outline: "none", width: "100%", padding: "9px 0", fontFamily: "inherit" }}
                        onFocus={(e) => e.target.select()}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== Desktop: linha em grid ===== */}
            <div
              className="row-desktop"
              style={{
                gridTemplateColumns: COLS,
                gap: "16px",
                alignItems: "center",
                padding: "5px 16px",
                borderBottom: "1px solid var(--surface-hover)",
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                {line.line_number}
              </span>
              {["deposit", "withdrawal", "chest", "bonus"].map((field) => (
                <div
                  key={field}
                  className="ui-cell"
                >
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginRight: "5px" }}>R$</span>
                  <input
                    ref={(el) => { inputRefs.current[`${line.id}-${field}`] = el; }}
                    type="number"
                    defaultValue={(line as any)[field] || ""}
                    disabled={isFinished || isReadOnly}
                    onBlur={(e) => {
                      const newValue = Number(e.target.value);
                      const currentValue = (line as any)[field] || 0;
                      if (newValue !== currentValue) updateLine(line.id, field, newValue);
                    }}
                    onKeyDown={(e) => handleKeyDown(e, index, field)}
                    placeholder="0"
                    style={{ background: "transparent", border: "none", color: "var(--text)", fontSize: "13px", outline: "none", width: "100%", padding: "7px 0", fontFamily: "inherit" }}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
              ))}
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                  color: line.result > 0 ? "var(--positive)" : line.result < 0 ? "var(--negative-text)" : "var(--text-muted)",
                }}
              >
                {line.result > 0 ? "+" : ""}{fmt(line.result)}
              </span>
              {!isFinished && !isReadOnly ? (
                <button
                  onClick={() => removeLine(line.id)}
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--negative-text)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  <X size={15} />
                </button>
              ) : <span />}
            </div>
          </div>
        ))}
      </Card>

      {/* ── Modal — Planilha finalizada ── */}
      <Modal
        open={finishModal.visible}
        onOpenChange={(open) => { if (!open) setFinishModal({ visible: false, name: "", result: 0 }); }}
      >
        <ModalContent maxWidth={320} showClose={false}>
          <ModalBody style={{ textAlign: "center" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--positive-subtle)",
                border: "1px solid var(--positive-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: "24px",
              }}
            >
              🎯
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>
              Planilha finalizada
            </p>
            <p style={{ fontSize: "18px", fontWeight: "700", color: "var(--text)", marginBottom: "12px" }}>
              {finishModal.name}
            </p>
            <p
              style={{
                fontSize: "32px",
                fontWeight: "700",
                fontVariantNumeric: "tabular-nums",
                color: finishModal.result >= 0 ? "var(--positive)" : "var(--negative-text)",
                marginBottom: "24px",
              }}
            >
              {finishModal.result >= 0 ? "+" : ""}{fmt(finishModal.result)}
            </p>
          </ModalBody>
          <ModalFooter style={{ justifyContent: "center" }}>
            <Button
              variant="secondary"
              onClick={() => setFinishModal({ visible: false, name: "", result: 0 })}
            >
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
