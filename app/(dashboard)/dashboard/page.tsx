"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { Bell } from "lucide-react";
import { PeriodSelect } from "@/components/ui/period-select";
import KpiStrip from "./_components/KpiStrip";
import OperationResults from "./_components/OperationResults";
import CostBreakdown from "./_components/CostBreakdown";
import RecentSheets from "./_components/RecentSheets";
import MonthlyProfit from "./_components/MonthlyProfit";
import {
  KpiStripSkeleton,
  ChartsSkeleton,
  RecentSheetsSkeleton,
} from "./_components/Skeletons";

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

const PERIOD_OPTIONS = [
  { value: "all",   label: "Todo o período" },
  { value: "month", label: "Este mês" },
  { value: "week",  label: "Últimos 7 dias" },
  { value: "today", label: "Hoje" },
] as const;



export default function DashboardPage() {
  const [stats, setStats]         = useState<SheetStats | null>(null);
  const [sheets, setSheets]       = useState<RecentSheet[]>([]);
  const [costStats, setCostStats] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading]     = useState(true);
  const [period, setPeriod]       = useState("all");

  // Declaradas antes dos useEffects para satisfazer a regra de hoisting do lint
  async function fetchStats(p: string) {
    try {
      const { data } = await api.get(`/sheets/stats?period=${p}`);
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar stats:", err);
    }
  }

  async function fetchCostStats(p: string) {
    try {
      const { data } = await api.get(`/costs/stats?period=${p}`);
      setCostStats(data);
    } catch (err) {
      console.error("Erro ao carregar custos:", err);
    }
  }

  async function fetchRecentSheets(p: string) {
    try {
      const periodParam = p !== "all" ? `&period=${p}` : "";
      const { data } = await api.get(`/sheets/?limit=10&offset=0${periodParam}`);
      setSheets(data.items);
    } catch (err) {
      console.error("Erro ao carregar planilhas:", err);
    }
  }

  function calcSheetResult(sheet: RecentSheet): number {
    const linesTotal = sheet.lines.reduce(
      (acc, l) => acc + l.withdrawal - l.deposit + l.chest + (l.bonus || 0),
      0
    );
    return linesTotal + (sheet.salary ?? 0);
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchStats(period),
      fetchRecentSheets(period),
      fetchCostStats(period),
    ]).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);


  return (
    <div
      style={{
        maxWidth: "1440px",
        width: "100%",
        fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
      }}
    >
      {/* ── Header ── */}
      <div className="dash-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: "600",
              color: "var(--text)",
              lineHeight: "1.2",
              marginBottom: "4px",
            }}
          >
            Visão geral
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            Resultado consolidado de todas as operações
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Sino — desktop only; mobile usa o da topbar */}
          <button
            aria-label="Notificações"
            className="dash-bell-btn"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "var(--surface)",
              border: "1px solid var(--border-strong)",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Bell size={16} color="var(--text-secondary)" />
          </button>

          {/* Seletor de período */}
          <PeriodSelect
            value={period}
            onChange={setPeriod}
            options={PERIOD_OPTIONS as unknown as { value: string; label: string }[]}
          />

        </div>
      </div>

      {/* ── Conteúdo ── */}
      {loading ? <KpiStripSkeleton /> : (
        <KpiStrip
          stats={stats}
          sheets={sheets}
          calcSheetResult={calcSheetResult}
          totalCosts={costStats.reduce((s, c) => s + c.value, 0)}
        />
      )}

      <MonthlyProfit />

      {loading ? (
        <>
          <ChartsSkeleton />
          <RecentSheetsSkeleton />
        </>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <OperationResults sheets={sheets} calcSheetResult={calcSheetResult} />
            <CostBreakdown costStats={costStats} sheetCount={stats?.total ?? 0} />
          </div>

          <RecentSheets
            sheets={sheets}
            totalCount={stats?.total ?? 0}
            calcSheetResult={calcSheetResult}
          />
        </>
      )}
    </div>
  );
}
