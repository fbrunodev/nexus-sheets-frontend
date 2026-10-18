"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { formatSignedBRL, formatBRL } from "@/lib/format";

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

const BAR_H = 72;
const VAL_H = 22;

function shortLabel(month: string) {
  return MONTH_SHORT[month.slice(5)] ?? month.slice(5);
}

function fullLabel(month: string) {
  const [yyyy, mm] = month.split("-");
  return `${MONTH_FULL[mm] ?? mm} ${yyyy}`;
}

function costsDisplay(costs: number) {
  return costs > 0 ? `−${formatBRL(costs)}` : "−R$ 0,00";
}

export function MonthlyProfitSkeleton() {
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
          <div className="skeleton" style={{ width: "260px", height: "12px", borderRadius: "5px", marginTop: "6px" }} />
        </div>
        <div className="skeleton mc-desktop-only" style={{ width: "190px", height: "12px", borderRadius: "5px" }} />
      </div>
      <div style={{ display: "flex", gap: "4px" }}>
        {[0.65, 1, 0.9, 0, 0, 0.55].map((ratio, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ height: `${BAR_H}px`, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              {ratio > 0 && (
                <div className="skeleton" style={{ width: "100%", height: `${Math.round(ratio * BAR_H)}px`, borderRadius: "3px 3px 0 0" }} />
              )}
            </div>
            <div style={{ width: "100%", height: "1px", background: "var(--border-strong)" }} />
            <div style={{ height: `${BAR_H}px` }} />
            <div className="skeleton" style={{ width: "24px", height: "10px", borderRadius: "3px", marginTop: "8px" }} />
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
      .get("/sheets/monthly?months=6")
      .then(({ data }) => {
        setEntries(data);
        if (data.length > 0) setSelected(data[data.length - 1].month);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const maxAbs = entries.length > 0
    ? Math.max(...entries.map((e) => Math.abs(e.profit)), 1)
    : 1;

  const sel = entries.find((e) => e.month === selected) ?? null;

  function bh(profit: number) {
    return Math.max(2, (Math.abs(profit) / maxAbs) * BAR_H);
  }

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
            Últimos 6 meses · resultado das planilhas menos custos do mês
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
              {sel.profit === 0 ? "R$ 0,00" : formatSignedBRL(sel.profit)}
            </span>
          </p>
        )}
      </div>

      {/* ── Barras ── */}
      <div style={{ display: "flex", gap: "4px" }}>
        {entries.map((entry) => {
          const isSel = entry.month === selected;
          const isPos = entry.profit > 0;
          const isNeg = entry.profit < 0;
          const h = bh(entry.profit);

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
                padding: "4px 2px 6px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontFamily: "inherit",
                transition: "background 0.15s",
                minHeight: "44px",
              }}
            >
              {/* Valor acima (positivo) — oculto no mobile */}
              <div
                className="mc-value"
                style={{
                  height: `${VAL_H}px`,
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: "3px",
                  width: "100%",
                }}
              >
                {isPos && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--positive)",
                      whiteSpace: "nowrap",
                      lineHeight: 1,
                    }}
                  >
                    {formatSignedBRL(entry.profit)}
                  </span>
                )}
              </div>

              {/* Área positiva */}
              <div
                style={{
                  height: `${BAR_H}px`,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                {isPos && (
                  <div
                    style={{
                      width: "100%",
                      height: `${h}px`,
                      background: "var(--positive)",
                      borderRadius: "3px 3px 0 0",
                      opacity: isSel ? 1 : 0.55,
                      transition: "opacity 0.15s",
                    }}
                  />
                )}
              </div>

              {/* Linha zero */}
              <div
                style={{
                  width: "100%",
                  height: "1px",
                  background: "var(--border-strong)",
                  flexShrink: 0,
                }}
              />

              {/* Área negativa */}
              <div
                style={{
                  height: `${BAR_H}px`,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >
                {isNeg && (
                  <div
                    style={{
                      width: "100%",
                      height: `${h}px`,
                      background: "var(--negative-bar)",
                      borderRadius: "0 0 3px 3px",
                      opacity: isSel ? 1 : 0.55,
                      transition: "opacity 0.15s",
                    }}
                  />
                )}
              </div>

              {/* Valor abaixo (negativo ou zero) — oculto no mobile */}
              <div
                className="mc-value"
                style={{
                  height: `${VAL_H}px`,
                  alignItems: "flex-start",
                  justifyContent: "center",
                  paddingTop: "3px",
                  width: "100%",
                }}
              >
                {isNeg ? (
                  <span
                    style={{
                      fontSize: "11px",
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--negative-text)",
                      whiteSpace: "nowrap",
                      lineHeight: 1,
                    }}
                  >
                    {formatSignedBRL(entry.profit)}
                  </span>
                ) : !isPos ? (
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1 }}>
                    —
                  </span>
                ) : null}
              </div>

              {/* Rótulo do mês */}
              <span
                style={{
                  fontSize: "11px",
                  color: isSel ? "var(--text)" : "var(--text-muted)",
                  fontWeight: isSel ? "600" : "400",
                  marginTop: "4px",
                  lineHeight: 1,
                }}
              >
                {shortLabel(entry.month)}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Composição (mobile — abaixo do gráfico) ── */}
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
                color: sel.sheets_result >= 0 ? "var(--text)" : "var(--negative-text)",
                bold: false,
              },
              {
                label: "Custos",
                value: sel.costs > 0 ? `−${formatBRL(sel.costs)}` : "—",
                color: sel.costs > 0 ? "var(--negative-text)" : "var(--text-muted)",
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
