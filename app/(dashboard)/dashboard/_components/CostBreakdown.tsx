interface CostItem {
  name: string;
  value: number;
}

interface Props {
  costStats: CostItem[];
  sheetCount?: number;
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

import { formatBRL, formatPercent } from "@/lib/format";

export default function CostBreakdown({ costStats, sheetCount = 0 }: Props) {
  const sorted = [...costStats].sort((a, b) => b.value - a.value);

  const displayItems: CostItem[] =
    sorted.length > 4
      ? [
          ...sorted.slice(0, 4),
          {
            name: "Outros",
            value: sorted.slice(4).reduce((s, c) => s + c.value, 0),
          },
        ]
      : sorted;

  const total = displayItems.reduce((s, c) => s + c.value, 0);

  return (
    <div
      style={{
        flex: "1 1 200px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "18px",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--text)", marginBottom: "16px" }}>
        Custos
      </p>

      {costStats.length === 0 ? (
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            textAlign: "center",
            padding: "40px 0",
            flex: 1,
          }}
        >
          Nenhum custo no período
        </p>
      ) : (
        <>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>
            Total no período
          </p>
          <p
            style={{
              fontSize: "24px",
              fontWeight: "600",
              fontVariantNumeric: "tabular-nums",
              color: "var(--text)",
              marginBottom: "16px",
            }}
          >
            {formatBRL(total)}
          </p>

          {/* Barra empilhada */}
          <div
            style={{
              display: "flex",
              height: "10px",
              borderRadius: "5px",
              overflow: "hidden",
              gap: "3px",
              marginBottom: "16px",
            }}
          >
            {displayItems.map((item, i) => {
              const pct = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <div
                  key={item.name}
                  title={`${item.name}: ${formatPercent(pct)}`}
                  style={{
                    flex: `0 0 ${pct}%`,
                    background: COLORS[i % COLORS.length],
                    borderRadius: "3px",
                    minWidth: pct > 0 ? "3px" : "0",
                  }}
                />
              );
            })}
          </div>

          {/* Legenda */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {displayItems.map((item, i) => {
              const pct = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <div
                  key={item.name}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "2px",
                      background: COLORS[i % COLORS.length],
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: "13px",
                      color: "var(--text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.name}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", flexShrink: 0 }}>
                    {formatPercent(pct)}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--text)",
                      fontVariantNumeric: "tabular-nums",
                      flexShrink: 0,
                    }}
                  >
                    {formatBRL(item.value)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Custo médio por planilha */}
          {sheetCount > 0 && (
            <>
              <div style={{ height: "1px", background: "var(--border)", margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Custo médio por planilha
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--text)",
                  }}
                >
                  {formatBRL(total / sheetCount)}
                </span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
