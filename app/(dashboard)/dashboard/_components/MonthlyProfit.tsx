"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { formatSignedBRL, formatBRL, formatCompactBRL } from "@/lib/format";

interface MonthlyEntry {
  month: string;
  sheets_result: number;
  costs: number;
  profit: number;
  sheets_count: number;
}

const MONTH_SHORT: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
  "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

const MONTH_FULL: Record<string, string> = {
  "01": "Janeiro",   "02": "Fevereiro", "03": "Março",    "04": "Abril",
  "05": "Maio",      "06": "Junho",     "07": "Julho",    "08": "Agosto",
  "09": "Setembro",  "10": "Outubro",   "11": "Novembro", "12": "Dezembro",
};

const CHART_MAX_H = 80;
const LABEL_H     = 16;
const LABEL_GAP   = 4;
const LABEL_AREA  = LABEL_H + LABEL_GAP + 6;

function shortLabel(month: string) {
  return MONTH_SHORT[month.slice(5)] ?? month.slice(5);
}

function fullLabel(month: string) {
  const [yyyy, mm] = month.split("-");
  return `${MONTH_FULL[mm] ?? mm} ${yyyy}`;
}

function costsDisplay(costs: number) {
  return costs > 0 ? `−${formatBRL(costs)}` : "−R$ 0,00";
}

function defaultSelected(data: MonthlyEntry[]): string {
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const current = data.find((e) => e.month === currentKey);
  if (current && current.profit !== 0) return currentKey;
  const withMovement = data.filter((e) => e.profit !== 0);
  if (withMovement.length > 0) return withMovement[withMovement.length - 1].month;
  return data[data.length - 1].month;
}

export function MonthlyProfitSkeleton() {
  const ratios = [0.5, 0.8, 1, 0.6, 0.3, 0.7, 0.9, 0.4, 0.6, 0.1, 0.5, 0.75];
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "18px",
        marginBottom: "16px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <div className="skeleton" style={{ width: "120px", height: "15px", borderRadius: "6px" }} />
          <div className="skeleton" style={{ width: "220px", height: "12px", borderRadius: "5px", marginTop: "6px" }} />
        </div>
        <div className="skeleton mc-desktop-only" style={{ width: "190px", height: "12px", borderRadius: "5px" }} />
      </div>
      <div style={{ display: "flex", gap: "4px", alignItems: "flex-end", height: "116px" }}>
        {ratios.map((ratio, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div
              className="skeleton"
              style={{ width: "min(40%, 40px)", height: `${Math.max(4, Math.round(ratio * 80))}px`, borderRadius: "3px 3px 0 0" }}
            />
            <div className="skeleton" style={{ width: "20px", height: "10px", borderRadius: "3px" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MonthlyProfit() {
  const [entries, setEntries] = useState<MonthlyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/sheets/monthly?months=12")
      .then(({ data }) => {
        setEntries(data);
        if (data.length > 0) setSelected(defaultSelected(data));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const totalSum  = entries.reduce((s, e) => s + e.profit, 0);
  const maxPos    = entries.length > 0 ? Math.max(0, ...entries.map((e) => e.profit))  : 0;
  const maxNeg    = entries.length > 0 ? Math.max(0, ...entries.map((e) => -e.profit)) : 0;
  const maxAbs    = Math.max(maxPos, maxNeg, 1);
  const posBarMax = (maxPos / maxAbs) * CHART_MAX_H;
  const negBarMax = (maxNeg / maxAbs) * CHART_MAX_H;
  const posAreaH  = posBarMax + LABEL_AREA;
  const negAreaH  = maxNeg > 0 ? negBarMax + LABEL_AREA : 0;
  const totalH    = posAreaH + 1 + negAreaH;

  function bh(profit: number): number {
    if (profit === 0) return 0;
    return Math.max(2, (Math.abs(profit) / maxAbs) * CHART_MAX_H);
  }

  const sel = entries.find((e) => e.month === selected) ?? null;

  if (loading) return <MonthlyProfitSkeleton />;

  if (error) {
    return (
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "18px",
          marginBottom: "16px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Não foi possível carregar
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "18px",
        marginBottom: "16px",
      }}
    >
      {/* ── Cabeçalho ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
          gap: "12px",
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)", marginBottom: "2px" }}>
            Lucro por mês
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Últimos 12 meses · soma{" "}
            <span style={{ color: "var(--text-secondary)" }}>
              {formatSignedBRL(totalSum)}
            </span>
          </p>
        </div>

        {sel && (
          <p
            className="mc-desktop-only"
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              textAlign: "right",
              lineHeight: "1.7",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>{fullLabel(sel.month)}</span>
            {" · Planilhas "}
            {formatSignedBRL(sel.sheets_result)}
            {" · Custos "}
            {costsDisplay(sel.costs)}
            {" · Lucro "}
            <span
              style={{
                color: sel.profit > 0
                  ? "var(--positive)"
                  : sel.profit < 0
                  ? "var(--negative-text)"
                  : "var(--text-muted)",
                fontWeight: "600",
              }}
            >
              {sel.profit === 0 ? "R$ 0,00" : formatSignedBRL(sel.profit)}
            </span>
          </p>
        )}
      </div>

      {/* ── Barras ── */}
      <div style={{ display: "flex", gap: "4px" }}>
        {entries.map((entry, idx) => {
          const isSel    = entry.month === selected;
          const isPos    = entry.profit > 0;
          const isNeg    = entry.profit < 0;
          const h        = bh(entry.profit);
          const showYear = idx === 0 || entry.month.slice(5) === "01";

          return (
            <button
              key={entry.month}
              aria-label={`${fullLabel(entry.month)}: ${entry.profit === 0 ? "R$ 0,00" : formatSignedBRL(entry.profit)}`}
              onClick={() => setSelected(entry.month)}
              style={{
                flex: 1,
                background: isSel ? "var(--surface-hover)" : "transparent",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                padding: "4px 1px 6px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontFamily: "inherit",
                transition: "background 0.15s",
                minHeight: "44px",
                minWidth: 0,
              }}
            >
              {/* Área do gráfico */}
              <div style={{ position: "relative", width: "100%", height: `${totalH}px` }}>

                {/* Linha do zero */}
                <div style={{
                  position: "absolute",
                  top: posAreaH,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background: "var(--border-strong)",
                }} />

                {/* Barra positiva */}
                {isPos && (
                  <div style={{
                    position: "absolute",
                    top: posAreaH - h,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "min(40%, 40px)",
                    height: `${h}px`,
                    background: "var(--positive)",
                    borderRadius: "3px 3px 0 0",
                  }} />
                )}

                {/* Rótulo positivo */}
                {isPos && (
                  <div
                    className="mc-value"
                    style={{
                      position: "absolute",
                      top: posAreaH - h - LABEL_GAP - LABEL_H,
                      left: 0,
                      right: 0,
                      height: `${LABEL_H}px`,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <span style={{
                      fontSize: "11px",
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--positive)",
                      whiteSpace: "nowrap",
                      lineHeight: 1,
                    }}>
                      {formatCompactBRL(entry.profit)}
                    </span>
                  </div>
                )}

                {/* Barra negativa */}
                {isNeg && (
                  <div style={{
                    position: "absolute",
                    top: posAreaH + 1,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "min(40%, 40px)",
                    height: `${h}px`,
                    background: "var(--negative-bar)",
                    borderRadius: "0 0 3px 3px",
                  }} />
                )}

                {/* Rótulo negativo */}
                {isNeg && (
                  <div
                    className="mc-value"
                    style={{
                      position: "absolute",
                      top: posAreaH + 1 + h + LABEL_GAP,
                      left: 0,
                      right: 0,
                      height: `${LABEL_H}px`,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <span style={{
                      fontSize: "11px",
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--negative-text)",
                      whiteSpace: "nowrap",
                      lineHeight: 1,
                    }}>
                      {formatCompactBRL(entry.profit)}
                    </span>
                  </div>
                )}

                {/* Zero "—" */}
                {!isPos && !isNeg && (
                  <div
                    className="mc-value"
                    style={{
                      position: "absolute",
                      top: posAreaH - Math.round(LABEL_H / 2),
                      left: 0,
                      right: 0,
                      height: `${LABEL_H}px`,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1 }}>
                      —
                    </span>
                  </div>
                )}
              </div>

              {/* Rótulo do mês */}
              <span
                style={{
                  fontSize: "11px",
                  color: isSel ? "var(--text)" : "var(--text-muted)",
                  fontWeight: isSel ? "600" : "400",
                  marginTop: "6px",
                  lineHeight: 1,
                  overflow: "hidden",
                  maxWidth: "100%",
                }}
              >
                {shortLabel(entry.month)}
              </span>

              {/* Rótulo do ano — só no 1º mês e em janeiro; reserva espaço sempre */}
              <span
                className="mc-desktop-only"
                style={{
                  fontSize: "10px",
                  color: "var(--text-muted)",
                  marginTop: "2px",
                  lineHeight: 1,
                  visibility: showYear ? "visible" : "hidden",
                  overflow: "hidden",
                  maxWidth: "100%",
                }}
              >
                {entry.month.slice(0, 4)}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Composição do mês selecionado (mobile — abaixo do gráfico) ── */}
      {sel && (
        <div
          className="mc-mobile-only"
          style={{
            marginTop: "16px",
            paddingTop: "12px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>
            {fullLabel(sel.month)}
          </p>
          {(
            [
              {
                label: "Planilhas",
                value: formatSignedBRL(sel.sheets_result),
                color: "var(--text)",
                bold: false,
              },
              {
                label: "Custos",
                value: sel.costs > 0 ? `−${formatBRL(sel.costs)}` : "—",
                color: "var(--text)",
                bold: false,
              },
              {
                label: "Lucro",
                value: sel.profit === 0 ? "—" : formatSignedBRL(sel.profit),
                color: sel.profit > 0
                  ? "var(--positive)"
                  : sel.profit < 0
                  ? "var(--negative-text)"
                  : "var(--text-muted)",
                bold: true,
              },
            ] as const
          ).map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                minHeight: "44px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                {row.label}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontVariantNumeric: "tabular-nums",
                  color: row.color,
                  fontWeight: row.bold ? "600" : "400",
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
