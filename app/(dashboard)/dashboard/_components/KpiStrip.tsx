interface SheetStats {
  total: number;
  not_started: number;
  in_progress: number;
  finished: number;
  grand_total: number;
}

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
  stats: SheetStats | null;
  sheets: RecentSheet[];
  calcSheetResult: (sheet: RecentSheet) => number;
  totalCosts?: number;
}

import { formatBRL } from "@/lib/format";

export default function KpiStrip({ stats, sheets, calcSheetResult, totalCosts = 0 }: Props) {
  const grandTotal  = stats?.grand_total ?? 0;
  const total       = stats?.total ?? 0;
  const finished    = stats?.finished ?? 0;
  const inProgress  = stats?.in_progress ?? 0;

  const avgPerSheet = total > 0 ? grandTotal / total : 0;
  const finishedPct = total > 0 ? (finished / total) * 100 : 0;
  const profitable  = sheets.filter((s) => calcSheetResult(s) > 0).length;

  return (
    <div
      className="kpi-strip"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        marginBottom: "16px",
      }}
    >
      {/* 1 — Lucro líquido */}
      <div className="kpi-col-main">
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "10px" }}>
          Lucro líquido
        </p>
        <p
          style={{
            fontSize: "40px",
            fontWeight: "600",
            lineHeight: "1",
            fontVariantNumeric: "tabular-nums",
            color: grandTotal < 0 ? "var(--negative-text)" : "var(--text)",
            marginBottom: totalCosts > 0 ? "6px" : "0",
          }}
        >
          {grandTotal < 0 && "−"}{formatBRL(Math.abs(grandTotal))}
        </p>
        {totalCosts > 0 && (
          <p style={{ fontSize: "12px", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
            após {formatBRL(totalCosts)} em custos
          </p>
        )}
      </div>

      {/* 2 — Lucro médio por planilha */}
      <div className="kpi-col kpi-col-avg">
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "10px" }}>
          Lucro médio
        </p>
        <p
          style={{
            fontSize: "24px",
            fontWeight: "600",
            fontVariantNumeric: "tabular-nums",
            color: avgPerSheet < 0 ? "var(--negative-text)" : "var(--text)",
            marginBottom: "6px",
          }}
        >
          {avgPerSheet < 0 && "−"}{formatBRL(Math.abs(avgPerSheet))}
        </p>
        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>por planilha</p>
      </div>

      {/* 3 — Planilhas */}
      <div className="kpi-col kpi-col-sheets">
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "10px" }}>
          Planilhas
        </p>
        <p
          style={{
            fontSize: "24px",
            fontWeight: "600",
            fontVariantNumeric: "tabular-nums",
            color: "var(--text)",
            marginBottom: "10px",
          }}
        >
          {total}
        </p>
        <div
          style={{
            height: "4px",
            background: "var(--border)",
            borderRadius: "2px",
            marginBottom: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${finishedPct}%`,
              background: "var(--text-secondary)",
              borderRadius: "2px",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          {finished} concluídas · {inProgress} em andamento
        </p>
      </div>

      {/* 4 — Planilhas no lucro */}
      <div className="kpi-col kpi-col-profit">
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "10px" }}>
          No lucro
        </p>
        <p
          style={{
            fontSize: "24px",
            fontWeight: "600",
            fontVariantNumeric: "tabular-nums",
            color: "var(--text)",
            marginBottom: "6px",
          }}
        >
          {sheets.length > 0
            ? `${Math.round((profitable / sheets.length) * 100)}%`
            : "—"}
        </p>
        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          {profitable} de {sheets.length} últimas
        </p>
      </div>
    </div>
  );
}
