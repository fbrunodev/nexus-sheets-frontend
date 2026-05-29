"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import { DashboardData } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const periods = [
  { label: "Todos", value: "all" },
  { label: "Este mês", value: "month" },
  { label: "Esta semana", value: "week" },
  { label: "Hoje", value: "today" },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchDashboard();
  }, [period]);

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px" }}
        >
          Dashboard
        </h1>
        <p style={{ color: "#6060a0", fontSize: "13px" }}>
          Visão geral das suas planilhas e resultados
        </p>
      </div>

      {/* Filtros de período */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            style={{
              padding: "7px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              border: period === p.value ? "none" : "1px solid #1a1a2e",
              background:
                period === p.value ? "#3b82f6" : "transparent",
              color: period === p.value ? "#ffffff" : "#6060a0",
              transition: "all 0.15s",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: "#6060a0", fontSize: "14px" }}>Carregando...</div>
      ) : data ? (
        <>
          {/* Cards principais */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {/* Total depositado */}
            <div
              style={{
                background: "#0f0f1a",
                border: "1px solid #1a1a2e",
                borderRadius: "14px",
                padding: "20px",
              }}
            >
              <p style={{ fontSize: "11px", color: "#6060a0", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Total depositado
              </p>
              <p style={{ fontSize: "26px", fontWeight: "700", color: "#f87171" }}>
                {formatCurrency(data.total_deposited)}
              </p>
            </div>

            {/* Total recebido */}
            <div
              style={{
                background: "#0f0f1a",
                border: "1px solid #1a1a2e",
                borderRadius: "14px",
                padding: "20px",
              }}
            >
              <p style={{ fontSize: "11px", color: "#6060a0", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Total recebido
              </p>
              <p style={{ fontSize: "26px", fontWeight: "700", color: "#22d3a5" }}>
                +{formatCurrency(data.total_received)}
              </p>
            </div>

            {/* Resultado final */}
            <div
              style={{
                background: data.final_result >= 0 ? "rgba(59,130,246,0.06)" : "rgba(248,113,113,0.06)",
                border: `1px solid ${data.final_result >= 0 ? "rgba(59,130,246,0.3)" : "rgba(248,113,113,0.3)"}`,
                borderRadius: "14px",
                padding: "20px",
                boxShadow: data.final_result >= 0 ? "0 0 24px rgba(59,130,246,0.08)" : "none",
              }}
            >
              <p style={{ fontSize: "11px", color: "#6060a0", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Resultado final
              </p>
              <p
                style={{
                  fontSize: "26px",
                  fontWeight: "700",
                  color: data.final_result >= 0 ? "#3b82f6" : "#f87171",
                }}
              >
                {data.final_result >= 0 ? "+" : ""}
                {formatCurrency(data.final_result)}
              </p>
            </div>
          </div>

          {/* Custos + contadores */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            {[
              { label: "Proxy", value: data.costs.proxy },
              { label: "SMS", value: data.costs.sms },
              { label: "Bot", value: data.costs.bot },
              { label: "Fintech", value: data.costs.fintech },
              { label: "Total custos", value: data.costs.total },
            ].map((cost) => (
              <div
                key={cost.label}
                style={{
                  background: "#0f0f1a",
                  border: "1px solid #1a1a2e",
                  borderRadius: "10px",
                  padding: "14px",
                }}
              >
                <p style={{ fontSize: "11px", color: "#6060a0", marginBottom: "4px" }}>
                  {cost.label}
                </p>
                <p style={{ fontSize: "15px", fontWeight: "600", color: cost.value > 0 ? "#fbbf24" : "#3a3a5c" }}>
                  {formatCurrency(cost.value)}
                </p>
              </div>
            ))}
          </div>

          {/* Total planilhas + operações */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "24px",
              marginTop: "12px",
            }}
          >
            <div
              style={{
                background: "#0f0f1a",
                border: "1px solid #1a1a2e",
                borderRadius: "14px",
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ fontSize: "11px", color: "#6060a0", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Total de planilhas
                </p>
                <p style={{ fontSize: "32px", fontWeight: "700" }}>
                  {data.total_sheets}
                </p>
              </div>
            </div>
            <div
              style={{
                background: "#0f0f1a",
                border: "1px solid #1a1a2e",
                borderRadius: "14px",
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ fontSize: "11px", color: "#6060a0", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Total de operações
                </p>
                <p style={{ fontSize: "32px", fontWeight: "700" }}>
                  {data.total_operations}
                </p>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            {/* Performance mensal */}
            <div
              style={{
                background: "#0f0f1a",
                border: "1px solid #1a1a2e",
                borderRadius: "14px",
                padding: "20px",
              }}
            >
              <p style={{ fontSize: "13px", fontWeight: "600", marginBottom: "16px" }}>
                Performance mensal
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.monthly_performance}>
                  <XAxis dataKey="month" stroke="#3a3a5c" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#3a3a5c" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f0f1a",
                      border: "1px solid #1a1a2e",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line type="monotone" dataKey="deposited" stroke="#f87171" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="received" stroke="#22d3a5" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="result" stroke="#3b82f6" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Distribuição de custos */}
            <div
              style={{
                background: "#0f0f1a",
                border: "1px solid #1a1a2e",
                borderRadius: "14px",
                padding: "20px",
              }}
            >
              <p style={{ fontSize: "13px", fontWeight: "600", marginBottom: "16px" }}>
                Distribuição de custos
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={[
                    { name: "Proxy", value: data.costs.proxy },
                    { name: "SMS", value: data.costs.sms },
                    { name: "Bot", value: data.costs.bot },
                    { name: "Fintech", value: data.costs.fintech },
                  ]}
                >
                  <XAxis dataKey="name" stroke="#3a3a5c" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#3a3a5c" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f0f1a",
                      border: "1px solid #1a1a2e",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}