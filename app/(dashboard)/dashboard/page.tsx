"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";
import { DashboardData } from "@/types";
import { useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  FileSpreadsheet,
  Activity,
} from "lucide-react";

const periods = [
  { label: "Todos", value: "all" },
  { label: "Mês", value: "month" },
  { label: "Semana", value: "week" },
  { label: "Hoje", value: "today" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  const [sheets, setSheets] = useState<any[]>([]);

  useEffect(() => {
    fetchSheets();
  }, []);

  async function fetchSheets() {
    try {
      const { data } = await api.get("/sheets/?limit=5&offset=0");
      setSheets(data.items); // últimas 5 (já paginado no backend)
    } catch (err) {
      console.error(err);
    }
  }


  async function fetchDashboard() {
    setLoading(true);
    try {
      const { data: res } = await api.get(`/dashboard/?period=${period}`);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function fmt(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  const pieData = data
    ? [
        { name: "Proxy", value: data.costs.proxy || 0.1 },
        { name: "SMS", value: data.costs.sms || 0.1 },
        { name: "Bot", value: data.costs.bot || 0.1 },
        { name: "Fintech", value: data.costs.fintech || 0.1 },
      ]
    : [];

  const pieColors = ["#3b82f6", "#22d3a5", "#fbbf24", "#f87171"];

  return (
    <div>
      {/* Filtros */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <div style={{ display: "flex", background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "8px", overflow: "hidden" }}>
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              style={{
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: period === p.value ? "600" : "400",
                color: period === p.value ? "#3b82f6" : "#6060a0",
                background: period === p.value ? "rgba(59,130,246,0.1)" : "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                transition: "all 0.15s",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#6060a0", fontSize: "13px" }}>Carregando...</p>
      ) : data ? (
        <>
          {/* Métricas em linha */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            {[
              {
                label: "Depositado",
                value: fmt(data.total_deposited),
                color: "#f87171",
                icon: <TrendingDown size={16} color="#f87171" />,
              },
              {
                label: "Recebido",
                value: fmt(data.total_received),
                color: "#22d3a5",
                icon: <TrendingUp size={16} color="#22d3a5" />,
              },
              {
                label: "Resultado Final",
                value: fmt(data.final_result),
                color: data.final_result >= 0 ? "#3b82f6" : "#f87171",
                icon: <ArrowUpRight size={16} color={data.final_result >= 0 ? "#3b82f6" : "#f87171"} />,
                highlight: true,
              },
              {
                label: "Planilhas",
                value: data.total_sheets.toString(),
                color: "#fff",
                icon: <FileSpreadsheet size={16} color="#6060a0" />,
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

          {/* Gráficos lado a lado */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            {/* Performance mensal */}
            <div style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "12px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <p style={{ fontSize: "13px", fontWeight: "600" }}>Performance Mensal</p>
                <span style={{ fontSize: "11px", color: "#6060a0" }}>Últimos meses</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data.monthly_performance}>
                  <XAxis dataKey="month" stroke="#3a3a5c" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#3a3a5c" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#141422",
                      border: "1px solid #1a1a2e",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <Line type="monotone" dataKey="deposited" stroke="#f87171" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="received" stroke="#22d3a5" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="result" stroke="#3b82f6" dot={false} strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                {[
                  { label: "Depositado", color: "#f87171" },
                  { label: "Recebido", color: "#22d3a5" },
                  { label: "Resultado", color: "#3b82f6" },
                ].map((l) => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "8px", height: "2px", background: l.color, borderRadius: "1px" }} />
                    <span style={{ fontSize: "10px", color: "#6060a0" }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribuição de custos */}
            <div style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "12px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <p style={{ fontSize: "13px", fontWeight: "600" }}>Distribuição de Custos</p>
                <span style={{ fontSize: "11px", color: "#6060a0" }}>Total: {fmt(data.costs.total)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={pieColors[index]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#141422",
                        border: "1px solid #1a1a2e",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { label: "Proxy", value: data.costs.proxy, color: "#3b82f6" },
                    { label: "SMS", value: data.costs.sms, color: "#22d3a5" },
                    { label: "Bot", value: data.costs.bot, color: "#fbbf24" },
                    { label: "Fintech", value: data.costs.fintech, color: "#f87171" },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: item.color }} />
                        <span style={{ fontSize: "11px", color: "#6060a0" }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: "500", color: item.value > 0 ? item.color : "#3a3a5c" }}>
                        {fmt(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabela planilhas recentes */}
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
                  {["Nome", "Data", "Status", "Linhas", "Total"].map((h) => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: "10px", fontWeight: "600", color: "#6060a0", letterSpacing: "0.07em", textTransform: "uppercase" }}>
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
                  const total = sheet.lines.reduce((acc: number, l: any) => acc + l.withdrawal + l.chest - l.deposit, 0);
                  const costs = sheet.cost_proxy + sheet.cost_sms + sheet.cost_bot + sheet.cost_fintech;
                  const finalTotal = total - costs;
                  const filled = sheet.lines.filter((l: any) => l.deposit > 0 || l.withdrawal > 0).length;
                  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
                    NOT_STARTED: { label: "Não iniciada", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
                    IN_PROGRESS: { label: "Iniciada", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
                    FINISHED: { label: "Concluída", color: "#22d3a5", bg: "rgba(34,211,165,0.1)" },
                  };
                  const status = statusMap[sheet.status];

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
                        <span style={{ background: status.bg, color: status.color, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "500" }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 20px", fontSize: "12px", color: "#6060a0" }}>
                        {filled}/{sheet.lines.length}
                      </td>
                      <td style={{ padding: "12px 20px", fontSize: "13px", fontWeight: "600", color: finalTotal >= 0 ? "#22d3a5" : "#f87171" }}>
                        {finalTotal >= 0 ? "+" : ""}{fmt(finalTotal)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}