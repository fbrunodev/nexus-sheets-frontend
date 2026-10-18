"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { Sheet } from "@/types";
import {
  Plus,
  FileSpreadsheet,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { StatusDot } from "@/components/ui/status-dot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PeriodSelect } from "@/components/ui/period-select";
import { Modal, ModalContent, ModalBody, ModalFooter, ModalClose } from "@/components/ui/modal";
import { NumberInput } from "@/components/ui/number-input";

const CARET =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C8C94' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")";

const MODAL_LABEL: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  color: "var(--text-secondary)",
  marginBottom: "6px",
};

import { formatSignedBRL, formatSignedPercent } from "@/lib/format";

export default function SheetsPage() {
  const router = useRouter();

  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newLines, setNewLines] = useState(10);
  const [newGoal, setNewGoal] = useState(0);
  const [activeStatus, setActiveStatus] = useState("all");
  const [period, setPeriod] = useState<"all" | "month" | "week">("all");
  const [search, setSearch] = useState("");
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [operatorSheets, setOperatorSheets] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [selectedOperator, setSelectedOperator] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Sheet | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [createError, setCreateError] = useState("");
  const [cooperationType, setCooperationType] = useState<"META" | "BAU" | "RECARGA">("META");
  const LIMIT = 20;

  const searchMounted = useRef(false);

  useEffect(() => {
    fetchSheets();
    fetchStats();
  }, [activeStatus, period]);

  useEffect(() => {
    if (!searchMounted.current) {
      searchMounted.current = true;
      return;
    }
    const timeout = setTimeout(() => {
      fetchSheets();
    }, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  async function fetchSheets() {
    setLoading(true);
    try {
      const statusParam = activeStatus !== "all" ? activeStatus : "";
      const periodParam = period !== "all" ? `&period=${period}` : "";
      const { data } = await api.get(
        `/sheets/?limit=${LIMIT}&offset=0&status=${statusParam}&search=${encodeURIComponent(search)}${periodParam}`
      );
      setSheets(data.items);
      setOffset(data.items.length);
      setHasMore(data.has_more);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const statusParam = activeStatus !== "all" ? activeStatus : "";
      const periodParam = period !== "all" ? `&period=${period}` : "";
      const { data } = await api.get(
        `/sheets/?limit=${LIMIT}&offset=${offset}&status=${statusParam}&search=${encodeURIComponent(search)}${periodParam}`
      );
      setSheets((prev) => [...prev, ...data.items]);
      setOffset((prev) => prev + data.items.length);
      setHasMore(data.has_more);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }

  async function fetchStats() {
    try {
      const { data } = await api.get("/sheets/stats");
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchPlatforms();
    fetchOperatorSheets();
  }, []);

  async function fetchOperatorSheets() {
    try {
      const { data } = await api.get("/sheets/operator-sheets");
      setOperatorSheets(data.items);
      setOperators(data.operators);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchPlatforms() {
    try {
      const { data } = await api.get("/platforms/");
      setPlatforms(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreate() {
    if (cooperationType !== "BAU" && !selectedPlatform) return;
    setCreateError("");
    setCreating(true);
    try {
      const platform = platforms.find((p) => p.id === selectedPlatform);
      const payload: any = {
        name: cooperationType === "BAU" ? "Baú" : (platform ? platform.name : "Sem nome"),
        goal: cooperationType === "META" ? newGoal : 0,
        platform_id: cooperationType === "BAU" ? null : selectedPlatform,
        cooperation_type: cooperationType,
      };
      if (pasteMode) {
        const deposits = parseDeposits(pasteText);
        if (deposits.length === 0) {
          setCreateError("Nenhum depósito válido encontrado. Verifique o formato colado.");
          setCreating(false);
          return;
        }
        payload.deposits = deposits;
      } else {
        payload.initial_lines = newLines;
      }
      const { data } = await api.post("/sheets/", payload);
      setSheets((prev) => [data, ...prev]);
      fetchStats();
      setShowModal(false);
      setSelectedPlatform("");
      setNewLines(10);
      setNewGoal(0);
      setPasteText("");
      setPasteMode(false);
      setCreateError("");
      setCooperationType("META");
      router.push(`/sheets/${data.id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? "Erro ao criar planilha. Tente novamente.";
      setCreateError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/sheets/${deleteTarget.id}`);
      setSheets((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      fetchStats();
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  function parseDeposits(text: string): number[] {
    return text
      .split("\n")
      .map((line) =>
        line.replace(/R\$/g, "").replace(/\./g, "").replace(/,/g, ".").trim()
      )
      .filter((line) => line !== "")
      .map((line) => parseFloat(line))
      .filter((num) => !isNaN(num));
  }

  const grandTotal   = stats?.grand_total ?? 0;
  const notStarted   = stats?.not_started ?? 0;
  const inProgress   = stats?.in_progress ?? 0;
  const finished     = stats?.finished ?? 0;
  const totalSheets  = stats?.total ?? 0;

  const tabs = [
    { label: "Todas",        value: "all",         count: totalSheets },
    { label: "Não iniciada", value: "NOT_STARTED", count: notStarted },
    { label: "Em andamento", value: "IN_PROGRESS",  count: inProgress },
    { label: "Concluída",   value: "FINISHED",     count: finished },
  ];

  const canCreate = !creating && (cooperationType === "BAU" || !!selectedPlatform);

  return (
    <div>
      <PageHeader
        title="Planilhas"
        subtitle="Acompanhe o resultado de cada operação"
        actions={
          <Button variant="primary" onClick={() => setShowModal(true)} style={{ gap: "6px" }}>
            <Plus size={14} />
            Nova Planilha
          </Button>
        }
      />

      {/* ── Filtros ── */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar planilha..."
            className="ui-input"
            style={{ paddingLeft: "32px" }}
          />
          <svg
            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="var(--text-muted)" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        {operators.length > 0 && (
          <select
            value={selectedOperator}
            onChange={(e) => setSelectedOperator(e.target.value)}
            className="ui-select"
            style={{ width: "220px", flexShrink: 0, backgroundImage: CARET, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: "32px" }}
          >
            <option value="">Todos os operadores</option>
            {operators.map((op: any) => (
              <option key={op.id} value={op.id}>{op.name || op.email}</option>
            ))}
          </select>
        )}
        <PeriodSelect
          value={period}
          onChange={(v) => setPeriod(v as "all" | "month" | "week")}
          options={[
            { value: "all",   label: "Todo o período" },
            { value: "month", label: "Este mês" },
            { value: "week",  label: "Últimos 7 dias" },
          ]}
        />
      </div>

      {/* ── Tabs ── */}
      <div className="tabs-row" style={{ marginBottom: "16px" }}>
        {tabs.map((tab) => {
          const active = activeStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveStatus(tab.value)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: active ? "600" : "400",
                color: active ? "var(--text)" : "var(--text-muted)",
                background: active ? "var(--surface-hover)" : "transparent",
                border: `1px solid ${active ? "var(--border-strong)" : "var(--border)"}`,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
              <span
                style={{
                  background: active ? "var(--border-strong)" : "var(--border)",
                  color: active ? "var(--text)" : "var(--text-muted)",
                  borderRadius: "20px",
                  padding: "1px 7px",
                  fontSize: "10px",
                  fontWeight: "600",
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Cards ── */}
      {selectedOperator !== "" ? (
        (() => {
          const filtered = operatorSheets.filter((item: any) => item.sheet.owner_id === selectedOperator || item.operator_id === selectedOperator);
          return filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
              <FileSpreadsheet size={36} style={{ marginBottom: "12px", opacity: 0.3 }} />
              <p style={{ fontSize: "13px" }}>Nenhuma planilha encontrada para este operador</p>
            </div>
          ) : (
            <div className="grid-cards">
              {filtered.map(({ sheet, operator_name }: { sheet: Sheet; operator_name: string }) => {
              const total     = sheet.result;
              const isPositive = total > 0;
              const isNeutral  = total === 0;
              const deposited  = sheet.lines.reduce((acc: number, l: any) => acc + l.deposit, 0);
              const roiRatio   = deposited > 0 ? (total / deposited) : 0;

              return (
                <Card
                  key={sheet.id}
                  onClick={() => router.push(`/sheets/${sheet.id}`)}
                  style={{
                    padding: "18px",
                    cursor: "pointer",
                    transition: "border-color 0.2s, transform 0.2s",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-strong)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ marginBottom: "10px" }}>
                    <Badge variant="neutral">{operator_name}</Badge>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div style={{ flex: 1, marginRight: "8px" }}>
                      <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {sheet.name}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>
                        {new Date(sheet.created_at).toLocaleDateString("pt-BR")}
                      </p>
                      <StatusDot status={sheet.status} size={6} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px", flex: 1 }}>
                    {sheet.cooperation_type === "META" ? (
                      <div style={{ background: "var(--surface-hover)", borderRadius: "8px", padding: "10px 12px" }}>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>Meta</p>
                        {(() => {
                          const filledLines = sheet.lines.filter((l: any) => l.deposit > 0 || l.withdrawal > 0).length;
                          const pct = sheet.goal > 0 ? Math.min((filledLines / sheet.goal) * 100, 100) : 0;
                          return (
                            <>
                              <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)", marginBottom: "6px" }}>
                                {sheet.goal > 0 ? `${filledLines}/${sheet.goal}` : "—"}
                              </p>
                              <div style={{ background: "var(--border)", borderRadius: "100px", height: "4px", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "var(--positive)" : "var(--accent)", borderRadius: "100px" }} />
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div style={{ background: "var(--surface-hover)", borderRadius: "8px", padding: "10px 12px" }}>
                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                          {sheet.cooperation_type === "BAU" ? "Ciclos" : "Contas"}
                        </p>
                        <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)", marginBottom: "6px" }}>
                          {sheet.lines.filter((l: any) => l.deposit > 0 || l.withdrawal > 0).length}
                        </p>
                        <div style={{ height: "4px" }} />
                      </div>
                    )}
                    <div style={{ background: "var(--surface-hover)", borderRadius: "8px", padding: "10px 12px" }}>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>ROI</p>
                      <p style={{ fontSize: "13px", fontWeight: "600", color: roiRatio > 0 ? "var(--positive)" : roiRatio < 0 ? "var(--negative-text)" : "var(--text-muted)" }}>
                        {formatSignedPercent(roiRatio * 100)}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Total</span>
                    <span style={{ fontSize: "16px", fontWeight: "700", fontVariantNumeric: "tabular-nums", color: isPositive ? "var(--positive)" : isNeutral ? "var(--text-muted)" : "var(--negative-text)" }}>
                      {formatSignedBRL(total)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        );
      })()
      ) : loading ? (
        <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Carregando...</p>
      ) : sheets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
          <FileSpreadsheet size={36} style={{ marginBottom: "12px", opacity: 0.3 }} />
          <p style={{ fontSize: "13px" }}>Nenhuma planilha encontrada</p>
        </div>
      ) : (
        <div className="grid-cards">
          {sheets.map((sheet) => {
            const total      = sheet.result;
            const isPositive = total > 0;
            const isNeutral  = total === 0;
            const deposited  = sheet.lines.reduce((acc, l) => acc + l.deposit, 0);
            const roiRatio   = deposited > 0 ? (total / deposited) : 0;

            return (
              <Card
                key={sheet.id}
                onClick={() => router.push(`/sheets/${sheet.id}`)}
                style={{
                  padding: "18px",
                  cursor: "pointer",
                  transition: "border-color 0.2s, transform 0.2s",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-strong)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div style={{ flex: 1, marginRight: "8px" }}>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {sheet.name}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>
                      {new Date(sheet.created_at).toLocaleDateString("pt-BR")}
                    </p>
                    <StatusDot status={sheet.status} size={6} />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === sheet.id ? null : sheet.id);
                    }}
                    title="Opções"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: "2px",
                      borderRadius: "4px",
                      transition: "color 0.15s",
                      marginLeft: "4px",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>

                {/* Dropdown de opções */}
                {menuOpen === sheet.id && (
                  <>
                    <div
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(null); }}
                      style={{ position: "fixed", inset: 0, zIndex: 40 }}
                    />
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        top: "48px",
                        right: "16px",
                        background: "var(--surface-hover)",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        padding: "4px",
                        minWidth: "140px",
                        boxShadow: "var(--shadow-popover)",
                        zIndex: 41,
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(null);
                          setDeleteTarget(sheet);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: "7px",
                          background: "transparent",
                          border: "none",
                          color: "var(--negative-text)",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--negative-subtle)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <Trash2 size={14} />
                        Excluir
                      </button>
                    </div>
                  </>
                )}

                {/* Métricas */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px", flex: 1 }}>
                  {sheet.cooperation_type === "META" ? (
                    <div style={{ background: "var(--surface-hover)", borderRadius: "8px", padding: "10px 12px" }}>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>Meta</p>
                      {(() => {
                        const filledLines = sheet.lines.filter((l) => l.deposit > 0 || l.withdrawal > 0).length;
                        const pct = sheet.goal > 0 ? Math.min((filledLines / sheet.goal) * 100, 100) : 0;
                        return (
                          <>
                            <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)", marginBottom: "6px" }}>
                              {sheet.goal > 0 ? `${filledLines}/${sheet.goal}` : "—"}
                            </p>
                            <div style={{ background: "var(--border)", borderRadius: "100px", height: "4px", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${pct}%`, background: pct >= 100 ? "var(--positive)" : "var(--accent)", borderRadius: "100px" }} />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div style={{ background: "var(--surface-hover)", borderRadius: "8px", padding: "10px 12px" }}>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                        {sheet.cooperation_type === "BAU" ? "Ciclos" : "Contas"}
                      </p>
                      <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)", marginBottom: "6px" }}>
                        {sheet.lines.filter((l) => l.deposit > 0 || l.withdrawal > 0).length}
                      </p>
                      <div style={{ height: "4px" }} />
                    </div>
                  )}
                  <div style={{ background: "var(--surface-hover)", borderRadius: "8px", padding: "10px 12px" }}>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>ROI</p>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: roiRatio > 0 ? "var(--positive)" : roiRatio < 0 ? "var(--negative-text)" : "var(--text-muted)" }}>
                      {formatSignedPercent(roiRatio * 100)}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Total</span>
                  <span style={{ fontSize: "16px", fontWeight: "700", fontVariantNumeric: "tabular-nums", color: isPositive ? "var(--positive)" : isNeutral ? "var(--text-muted)" : "var(--negative-text)" }}>
                    {formatSignedBRL(total)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Carregar mais ── */}
      {!loading && hasMore && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <Button variant="secondary" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Carregando..." : "Carregar mais"}
          </Button>
        </div>
      )}

      {/* ── Modal — Nova Planilha ── */}
      <Modal
        open={showModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowModal(false);
            setCreateError("");
            setCooperationType("META");
          }
        }}
      >
        <ModalContent title="Nova Planilha" maxWidth={380}>
          <ModalBody>
            {/* Plataforma */}
            {cooperationType !== "BAU" && (
              <div>
                <label style={MODAL_LABEL}>Plataforma</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  autoFocus
                  className="ui-select"
                  style={{ backgroundImage: CARET, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "36px" }}
                >
                  <option value="" disabled>Selecione a plataforma</option>
                  {platforms.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Tipo de Cooperação */}
            <div>
              <label style={MODAL_LABEL}>Tipo de Cooperação</label>
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "4px",
                }}
              >
                {(["META", "BAU", "RECARGA"] as const).map((type) => {
                  const active = cooperationType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setCooperationType(type)}
                      style={{
                        flex: 1,
                        padding: "7px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "600",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        background: active ? "var(--surface-hover)" : "transparent",
                        color: active ? "var(--text)" : "var(--text-muted)",
                        transition: "all 0.15s",
                      }}
                    >
                      {type === "META" ? "Meta" : type === "BAU" ? "Baú" : "Recarga"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meta */}
            {cooperationType === "META" && (
              <div>
                <label style={MODAL_LABEL}>Meta</label>
                <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                  {[20, 30, 40, 50].map((g) => {
                    const active = newGoal === g;
                    return (
                      <button
                        key={g}
                        onClick={() => setNewGoal(g)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                          border: `1px solid ${active ? "var(--border-strong)" : "var(--border)"}`,
                          background: active ? "var(--surface-hover)" : "var(--bg)",
                          color: active ? "var(--text)" : "var(--text-muted)",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "all 0.15s",
                        }}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
                <NumberInput
                  value={newGoal}
                  onChange={setNewGoal}
                  min={0}
                  placeholder="Ex.: 30"
                  className="ui-input"
                />
              </div>
            )}

            {/* Modo: linhas vs colar */}
            {cooperationType === "META" && (
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "4px",
                }}
              >
                {[
                  { label: "Linhas vazias", value: false },
                  { label: "Colar depósitos", value: true },
                ].map(({ label, value }) => {
                  const active = pasteMode === value;
                  return (
                    <button
                      key={label}
                      onClick={() => setPasteMode(value)}
                      style={{
                        flex: 1,
                        padding: "7px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "600",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        background: active ? "var(--surface-hover)" : "transparent",
                        color: active ? "var(--text)" : "var(--text-muted)",
                        transition: "all 0.15s",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Linhas / textarea */}
            {cooperationType === "META" ? (
              !pasteMode ? (
                <div>
                  <label style={MODAL_LABEL}>Linhas iniciais</label>
                  <NumberInput
                    value={newLines}
                    onChange={setNewLines}
                    min={1}
                    max={200}
                    className="ui-input"
                  />
                </div>
              ) : (
                <div>
                  <label style={MODAL_LABEL}>
                    Cole os depósitos{pasteText.trim() ? ` (${parseDeposits(pasteText).length} linhas)` : ""}
                  </label>
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder={"R$ 120,00\nR$ 21,00\nR$ 90,00\n..."}
                    rows={6}
                    className="ui-textarea"
                  />
                </div>
              )
            ) : (
              <div>
                <label style={MODAL_LABEL}>Linhas iniciais</label>
                <NumberInput
                  value={newLines}
                  onChange={setNewLines}
                  min={1}
                  max={200}
                  className="ui-input"
                />
              </div>
            )}

            {/* Erro */}
            {createError && (
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
                {createError}
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="ghost">Cancelar</Button>
            </ModalClose>
            <Button variant="primary" onClick={handleCreate} disabled={!canCreate}>
              {creating ? "Criando..." : "Criar"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ── Modal — Confirmar exclusão ── */}
      <Modal
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open && !deleting) setDeleteTarget(null); }}
      >
        <ModalContent maxWidth={360}>
          <ModalBody style={{ textAlign: "center" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "var(--negative-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Trash2 size={22} color="var(--negative-text)" />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text)", marginBottom: "8px" }}>
              Excluir planilha?
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              A planilha <strong style={{ color: "var(--text)" }}>{deleteTarget?.name}</strong> será removida da sua lista. Esta ação pode ser revertida pelo suporte.
            </p>
          </ModalBody>
          <ModalFooter>
            <ModalClose asChild>
              <Button variant="ghost" disabled={deleting}>Cancelar</Button>
            </ModalClose>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Excluindo..." : "Excluir"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
