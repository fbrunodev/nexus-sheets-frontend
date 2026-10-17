"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/services/api";
import { ChevronDown, Bell } from "lucide-react";
import KpiStrip from "./_components/KpiStrip";
import OperationResults from "./_components/OperationResults";
import CostBreakdown from "./_components/CostBreakdown";
import RecentSheets from "./_components/RecentSheets";
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

function getPeriodLabel(period: string): string {
  const now = new Date();
  const d = (dt: Date) =>
    dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  switch (period) {
    case "today":
      return `Hoje · ${d(now)}`;
    case "week": {
      const from = new Date(now);
      from.setDate(from.getDate() - 7);
      return `Últimos 7 dias · ${d(from)} – ${d(now)}`;
    }
    case "month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return `Este mês · ${d(from)} – ${d(now)}`;
    }
    default:
      return "Todo o período";
  }
}

export default function DashboardPage() {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [stats, setStats]         = useState<SheetStats | null>(null);
  const [sheets, setSheets]       = useState<RecentSheet[]>([]);
  const [costStats, setCostStats] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading]     = useState(true);
  const [period, setPeriod]       = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    if (!dropdownOpen) return;
    function onOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [dropdownOpen]);

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
          <div ref={dropdownRef} className="period-wrap">
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="period-btn"
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                background: "var(--surface)",
                border: "1px solid var(--border-strong)",
                color: "var(--text)",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {getPeriodLabel(period)}
              <ChevronDown
                size={14}
                color="var(--text-muted)"
                style={{ flexShrink: 0 }}
              />
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 4px)",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  overflow: "hidden",
                  zIndex: 20,
                  minWidth: "210px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                }}
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setPeriod(opt.value);
                      setDropdownOpen(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px 14px",
                      textAlign: "left",
                      fontSize: "13px",
                      color:
                        period === opt.value
                          ? "var(--text)"
                          : "var(--text-secondary)",
                      background:
                        period === opt.value ? "var(--surface-hover)" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                      if (period !== opt.value)
                        e.currentTarget.style.background = "var(--surface-hover)";
                    }}
                    onMouseLeave={(e) => {
                      if (period !== opt.value)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Conteúdo ── */}
      {loading ? (
        <>
          <KpiStripSkeleton />
          <ChartsSkeleton />
          <RecentSheetsSkeleton />
        </>
      ) : (
        <>
          <KpiStrip
            stats={stats}
            sheets={sheets}
            calcSheetResult={calcSheetResult}
            totalCosts={costStats.reduce((s, c) => s + c.value, 0)}
          />

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
