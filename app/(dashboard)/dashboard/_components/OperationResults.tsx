"use client";
import { useEffect, useRef, useState } from "react";

interface SheetLine {
  deposit: number;
  withdrawal: number;
  chest: number;
  bonus: number;
}

interface RecentSheet {
  id: string;
  name: string;
  status: string;
  created_at: string;
  salary: number;
  lines: SheetLine[];
}

interface Props {
  sheets: RecentSheet[];
  calcSheetResult: (sheet: RecentSheet) => number;
}

import { formatSignedBRL } from "@/lib/format";

export default function OperationResults({ sheets, calcSheetResult }: Props) {
  const grouped: Record<string, { result: number; count: number }> = {};
  for (const sheet of sheets) {
    const r = calcSheetResult(sheet);
    if (!grouped[sheet.name]) grouped[sheet.name] = { result: 0, count: 0 };
    grouped[sheet.name].result += r;
    grouped[sheet.name].count += 1;
  }

  const items = Object.entries(grouped)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.result - a.result);

  const balance   = items.reduce((s, i) => s + i.result, 0);
  const hasNeg    = items.some((i) => i.result < 0);
  const maxPos    = Math.max(...items.map((i) => Math.max(i.result, 0)), 0);
  const maxNeg    = Math.max(...items.map((i) => Math.max(-i.result, 0)), 0);
  const totalSpan = hasNeg ? maxPos + maxNeg : maxPos || 1;
  const axisLeft  = hasNeg ? (maxNeg / totalSpan) * 100 : 0;

  // Single axis line spanning all rows.
  // barRef measures the bar column of the first row; containerRef is the
  // items wrapper. On every resize we recompute the pixel x of the zero axis
  // so the line stays aligned regardless of viewport or column width changes.
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef       = useRef<HTMLDivElement>(null);
  const [axisXPx, setAxisXPx] = useState<number | null>(null);

  useEffect(() => {
    if (!hasNeg) { setAxisXPx(null); return; }

    function measure() {
      if (!barRef.current || !containerRef.current) return;
      const barRect  = barRef.current.getBoundingClientRect();
      const contRect = containerRef.current.getBoundingClientRect();
      setAxisXPx(barRect.left - contRect.left + barRect.width * (axisLeft / 100));
    }

    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [hasNeg, axisLeft, items.length]);

  return (
    <div
      style={{
        flex: "2 1 280px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "18px",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "6px",
        }}
      >
        <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--text)" }}>
          Resultado por operação
        </p>
        <span
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          Últimas {sheets.length} planilhas · saldo{" "}
          {formatSignedBRL(balance)}
        </span>
      </div>

      {/* Conteúdo */}
      {items.length === 0 ? (
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            textAlign: "center",
            padding: "40px 0",
            flex: 1,
          }}
        >
          Nenhuma planilha para exibir
        </p>
      ) : (
        <div
          ref={containerRef}
          style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, position: "relative" }}
        >
          {/* Linha do eixo zero — desktop only (hidden on mobile via CSS) */}
          {hasNeg && axisXPx !== null && (
            <div
              aria-hidden
              className="op-axis-container-line"
              style={{
                position: "absolute",
                left: `${axisXPx}px`,
                top: 0,
                bottom: 0,
                width: "1px",
                background: "var(--border-strong)",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
          )}

          {items.map((item, index) => {
            const isPos  = item.result >= 0;
            const barPct = totalSpan > 0
              ? (Math.abs(item.result) / totalSpan) * 100
              : 0;

            return (
              <div key={item.name} className="op-item">
                {/* Nome */}
                <div className="op-item-label">
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.name}
                  </p>
                  {item.count > 1 && (
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
                      {item.count} planilhas
                    </p>
                  )}
                </div>

                {/* Área da barra — ref apenas no primeiro item para medir posição */}
                <div
                  ref={index === 0 ? barRef : undefined}
                  className="op-item-bar"
                  style={{ zIndex: 1 }}
                >
                  {/* Segmento do eixo zero — mobile only (hidden on desktop via CSS) */}
                  {hasNeg && (
                    <div
                      aria-hidden
                      className="op-axis-bar-line"
                      style={{
                        position: "absolute",
                        left: `${axisLeft}%`,
                        top: "-4px",
                        bottom: "-4px",
                        width: "1px",
                        background: "var(--border-strong)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  {isPos ? (
                    <div
                      style={{
                        position: "absolute",
                        left: `${axisLeft}%`,
                        top: "50%",
                        transform: "translateY(-50%)",
                        height: "8px",
                        width: `${barPct}%`,
                        background: "var(--positive)",
                        borderRadius: "0 3px 3px 0",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: "absolute",
                        right: `${100 - axisLeft}%`,
                        top: "50%",
                        transform: "translateY(-50%)",
                        height: "8px",
                        width: `${barPct}%`,
                        background: "var(--negative-bar)",
                        borderRadius: "3px 0 0 3px",
                      }}
                    />
                  )}
                </div>

                {/* Valor */}
                <div className="op-item-value">
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      fontVariantNumeric: "tabular-nums",
                      color: isPos ? "var(--positive)" : "var(--negative-text)",
                    }}
                  >
                    {formatSignedBRL(item.result)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Nota de rodapé */}
      <p
        style={{
          fontSize: "12px",
          color: "var(--text-muted)",
          marginTop: "16px",
          paddingTop: "12px",
          borderTop: "1px solid var(--border)",
        }}
      >
        Valores por planilha não incluem custos, que são descontados no lucro líquido.
      </p>
    </div>
  );
}
