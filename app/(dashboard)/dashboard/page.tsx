// O que muda:
// 1. Consome /sheets/stats em vez de /dashboard/ (que não existe)
// 2. Remove pieChart de custos e todos os campos cost_*
// 3. Remove "Depositado" e "Recebido" dos cards — só mostra Resultado e Planilhas
// 4. Tabela de planilhas recentes: calcula total sem cost_*
// 5. Gráfico mensal simplificado: só "Resultado" por planilha (sem deposited/received)

"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, FileSpreadsheet, ArrowUpRight } from "lucide-react";

// Tipagem do retorno de /sheets/stats
interface SheetStats {
  total: number;
  not_started: number;
  in_progress: number;
  finished: number;
  grand_total: number;
}

// Tipagem simplificada de planilha para a tabela recente
interface RecentSheet {
  id: string;
  name: string;
  status: string;
  created_at: string;
  salary: number;
  lines: { deposit: number; withdrawal: number; chest: number }[];
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  NOT_STARTED: { label: "Não iniciada", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  IN_PROGRESS: { label: "Iniciada",     color: "#3b82f6", bg: "rgba(59,130,246,0.1)"  },
  FINISHED:    { label: "Concluída",    color: "#22d3a5", bg: "rgba(34,211,165,0.1)"  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<SheetStats | null>(null);
  const [sheets, setSheets] = useState<RecentSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    fetchRecentSheets().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStats();
  }, [period]);

  async function fetchStats() {
    try {
      const { data } = await api.get(`/sheets/stats?period=${period}`);
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar stats:", err);
    }
  }

  async function fetchRecentSheets() {
    try {
      const { data } = await api.get("/sheets/?limit=5&offset=0");
      setSheets(data.items);
    } catch (err) {
      console.error("Erro ao carregar planilhas:", err);
    }
  }

  function fmt(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  // Calcula o resultado de uma planilha individual para a tabela
  // Fórmula: sum(withdrawal) - sum(deposit) + sum(chest) + salary
  function calcSheetResult(sheet: RecentSheet): number {
    const linesTotal = sheet.lines.reduce(
      (acc, l) => acc + l.withdrawal - l.deposit + l.chest,
      0
    );
    return linesTotal + (sheet.salary ?? 0);
  }

  // Monta dados do gráfico a partir das planilhas recentes
  // X = nome da planilha, Y = resultado
  const chartData = sheets.map((s) => ({
    name: s.name.length > 12 ? s.name.slice(0, 12) + "…" : s.name,
    resultado: parseFloat(calcSheetResult(s).toFixed(2)),
  }));

  const grandTotal = stats?.grand_total ?? 0;
  const isPositive = grandTotal >= 0;

  return (
    <div style={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
      {loading ? (
        <p style={{ color: "#6060a0", fontSize: "13px" }}>Carregando...</p>
      ) : (
        <>
          {/* ── Filtro de período ── */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
            {[
              { label: "Todos", value: "all" },
              { label: "Mês", value: "month" },
              { label: "Semana", value: "week" },
              { label: "Hoje", value: "today" },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: period === p.value ? "600" : "400",
                  color: period === p.value ? "#fff" : "#6060a0",
                  background: period === p.value ? "rgba(59,130,246,0.12)" : "transparent",
                  border: `1px solid ${period === p.value ? "rgba(59,130,246,0.3)" : "#1a1a2e"}`,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  transition: "all 0.15s",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* ── Cards de métricas ── */}
          <div className="grid-4" style={{ marginBottom: "16px" }}>
            {[
              {
                label: "Resultado Total",
                value: fmt(grandTotal),
                color: isPositive ? "#22d3a5" : "#f87171",
                icon: isPositive
                  ? <TrendingUp size={16} color="#22d3a5" />
                  : <TrendingDown size={16} color="#f87171" />,
                highlight: true,
              },
              {
                label: "Planilhas",
                value: String(stats?.total ?? 0),
                color: "#fff",
                icon: <FileSpreadsheet size={16} color="#6060a0" />,
              },
              {
                label: "Em Andamento",
                value: String(stats?.in_progress ?? 0),
                color: "#3b82f6",
                icon: <ArrowUpRight size={16} color="#3b82f6" />,
              },
              {
                label: "Concluídas",
                value: String(stats?.finished ?? 0),
                color: "#22d3a5",
                icon: <ArrowUpRight size={16} color="#22d3a5" />,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: item.highlight ? "rgba(59,130,246,0.06)" : "#0f0f1a",
                  border: `1px solid ${item.highlight ? "rgba(59,130,246,0.25)" : "#1a1a2e"}`,
                  borderRadius: "10px",
                  padding: "14px 16px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <span style={{ fontSize: "11px", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {item.label}
                  </span>
                  {item.icon}
                </div>
                <p style={{ fontSize: "18px", fontWeight: "700", color: item.color }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* ── Gráfico de performance ── */}
          <div
            style={{
              background: "#0f0f1a",
              border: "1px solid #1a1a2e",
              borderRadius: "12px",
              padding: "18px",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <p style={{ fontSize: "13px", fontWeight: "600" }}>Resultado por Planilha</p>
              <span style={{ fontSize: "11px", color: "#6060a0" }}>Últimas {sheets.length}</span>
            </div>
            {chartData.length === 0 ? (
              <p style={{ fontSize: "12px", color: "#3a3a5c", textAlign: "center", padding: "40px 0" }}>
                Nenhuma planilha para exibir
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" stroke="#3a3a5c" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#3a3a5c" tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(v) => [fmt(Number(v ?? 0)), "Resultado"]}
                    contentStyle={{
                      background: "#141422",
                      border: "1px solid #1a1a2e",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="resultado"
                    stroke="#3b82f6"
                    dot={{ fill: "#3b82f6", r: 3 }}
                    strokeWidth={2.5}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Tabela de planilhas recentes ── */}
          <div style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #1a1a2e" }}>
              <p style={{ fontSize: "13px", fontWeight: "600" }}>Últimas Planilhas</p>
              <button
                onClick={() => router.push("/sheets")}
                style={{ fontSize: "12px", color: "#3b82f6", background: "transparent", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
              >
                Ver todas →
              </button>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1a1a2e" }}>
                  {["Nome", "Data", "Status", "Linhas", "Resultado"].map((h) => (
                    <th
                      key={h}
                      style={{ padding: "10px 20px", textAlign: "left", fontSize: "10px", fontWeight: "600", color: "#6060a0", letterSpacing: "0.07em", textTransform: "uppercase" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sheets.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "24px 20px", textAlign: "center", fontSize: "13px", color: "#3a3a5c" }}>
                      Nenhuma planilha encontrada
                    </td>
                  </tr>
                ) : (
                  sheets.map((sheet) => {
                    const result = calcSheetResult(sheet);
                    const filled = sheet.lines.filter((l) => l.deposit > 0 || l.withdrawal > 0).length;
                    const s = STATUS_MAP[sheet.status];

                    return (
                      <tr
                        key={sheet.id}
                        onClick={() => router.push(`/sheets/${sheet.id}`)}
                        style={{ borderBottom: "1px solid #1a1a2e", cursor: "pointer" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.01)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "12px 20px", fontSize: "13px", fontWeight: "500" }}>{sheet.name}</td>
                        <td style={{ padding: "12px 20px", fontSize: "12px", color: "#6060a0" }}>
                          {new Date(sheet.created_at).toLocaleDateString("pt-BR")}
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "500" }}>
                            {s.label}
                          </span>
                        </td>
                        <td style={{ padding: "12px 20px", fontSize: "12px", color: "#6060a0" }}>
                          {filled}/{sheet.lines.length}
                        </td>
                        <td style={{ padding: "12px 20px", fontSize: "13px", fontWeight: "600", color: result >= 0 ? "#22d3a5" : "#f87171" }}>
                          {result >= 0 ? "+" : ""}{fmt(result)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}