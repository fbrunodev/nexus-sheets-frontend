"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { Sheet } from "@/types";
import {
  Plus,
  FileSpreadsheet,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Trash2,
  MoreVertical,
} from "lucide-react";



const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  NOT_STARTED: { label: "Não iniciada", color: "#fbbf24", bg: "rgba(251,191,36,0.08)", dot: "#fbbf24" },
  IN_PROGRESS: { label: "Em andamento", color: "#3b82f6", bg: "rgba(59,130,246,0.08)", dot: "#3b82f6" },
  FINISHED: { label: "Concluída", color: "#22d3a5", bg: "rgba(34,211,165,0.08)", dot: "#22d3a5" },
};

export default function SheetsPage() {
  const router = useRouter();

  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [filtered, setFiltered] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLines, setNewLines] = useState(10);
  const [newGoal, setNewGoal] = useState(0);
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<Sheet | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const LIMIT = 20;




  useEffect(() => {
    let result = sheets;
    if (activeStatus !== "all") result = result.filter((s) => s.status === activeStatus);
    if (search.trim()) result = result.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [sheets, activeStatus, search]);

 useEffect(() => {
    fetchSheets();
    fetchStats();
  }, []);

  async function fetchSheets() {
    setLoading(true);
    try {
      const { data } = await api.get(`/sheets/?limit=${LIMIT}&offset=0`);
      setSheets(data.items);
      setOffset(data.items.length);
      setHasMore(data.has_more);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const { data } = await api.get(`/sheets/?limit=${LIMIT}&offset=${offset}`);
      setSheets((prev) => [...prev, ...data.items]);
      setOffset((prev) => prev + data.items.length);
      setHasMore(data.has_more);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }

  async function fetchStats() {
    try {
      const { data } = await api.get("/sheets/stats");
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  }


  useEffect(() => {
    fetchPlatforms();
  }, []);

  async function fetchPlatforms() {
    try {
      const { data } = await api.get("/platforms/");
      setPlatforms(data);
    } catch (err) {
      console.error(err);
    }
  }


  async function handleCreate() {
    if (!selectedPlatform) return;
    setCreating(true);
    try {
      // Encontra a plataforma escolhida para usar o nome dela
      const platform = platforms.find((p) => p.id === selectedPlatform);

      const payload: any = {
        name: platform ? platform.name : "Sem nome",
        goal: newGoal,
        platform_id: selectedPlatform,
      };

      if (pasteMode) {
        const deposits = parseDeposits(pasteText);
        if (deposits.length === 0) {
          setCreating(false);
          return;
        }
        payload.deposits = deposits;
      } else {
        payload.initial_lines = newLines;
      }


      const { data } = await api.post("/sheets/", payload);
      setSheets((prev) => [data, ...prev]);
      fetchStats();
      setShowModal(false);
      setSelectedPlatform("");
      setNewLines(10);
      setNewGoal(0);
      setPasteText("");
      setPasteMode(false);
      router.push(`/sheets/${data.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
          await api.delete(`/sheets/${deleteTarget.id}`);
          // Remove da lista local
          setSheets((prev) => prev.filter((s) => s.id !== deleteTarget.id));
          // Atualiza os contadores
          fetchStats();
          setDeleteTarget(null);
        } catch (err) {
          console.error(err);
        } finally {
          setDeleting(false);
        }
  }
  
  function fmt(value: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  }

  function calcTotal(sheet: Sheet) {
    const received = sheet.lines.reduce((acc, l) => acc + l.withdrawal, 0);
    const chest = sheet.lines.reduce((acc, l) => acc + l.chest, 0);
    const deposited = sheet.lines.reduce((acc, l) => acc + l.deposit, 0);
    const costs = sheet.cost_proxy + sheet.cost_sms + sheet.cost_bot + sheet.cost_fintech;
    const salary = sheet.salary || 0;

    return received - deposited + chest + salary - costs;
  }
  // Converte o texto colado em uma lista de números
  // Aceita formato "R$ 120,00" um por linha
  function parseDeposits(text: string): number[] {
    return text
      .split("\n")
      .map((line) =>
        line
          .replace(/R\$/g, "")   // remove R$
          .replace(/\./g, "")    // remove separador de milhar
          .replace(",", ".")     // vírgula decimal vira ponto
          .trim()
      )
      .filter((line) => line !== "")
      .map((line) => parseFloat(line))
      .filter((num) => !isNaN(num));
  }

  const grandTotal = stats?.grand_total ?? 0;
  const notStarted = stats?.not_started ?? 0;
  const inProgress = stats?.in_progress ?? 0;
  const finished = stats?.finished ?? 0;
  const totalSheets = stats?.total ?? 0;

  const tabs = [
    { label: "Todas", value: "all", count: totalSheets },
    { label: "Não iniciada", value: "NOT_STARTED", count: notStarted },
    { label: "Iniciada", value: "IN_PROGRESS", count: inProgress },
    { label: "Finalizada", value: "FINISHED", count: finished },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: "20px" }}>        
                <div className="page-header-search" style={{ position: "relative" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar planilha..."
            style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "7px 12px 7px 32px", color: "#fff", fontSize: "12px", outline: "none", width: "100%", fontFamily: "Inter, sans-serif" }}          />
          <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6060a0" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>

        <div className="page-header-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "8px", padding: "7px 14px", display: "flex", alignItems: "center", gap: "8px", flex: 1, justifyContent: "center" }}>
            <FileSpreadsheet size={13} color="#3b82f6" />
            <span style={{ fontSize: "12px", color: "#6060a0" }}>Total Geral</span>
            <span style={{ fontSize: "13px", fontWeight: "700", color: grandTotal >= 0 ? "#22d3a5" : "#f87171" }}>{fmt(grandTotal)}</span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "#3b82f6", border: "none", borderRadius: "8px", padding: "8px 16px", color: "#fff", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
          >
            <Plus size={14} />
            Nova Planilha
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-row" style={{ marginBottom: "16px" }}>        
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: activeStatus === tab.value ? "600" : "400", color: activeStatus === tab.value ? "#fff" : "#6060a0", background: activeStatus === tab.value ? "rgba(59,130,246,0.12)" : "transparent", border: `1px solid ${activeStatus === tab.value ? "rgba(59,130,246,0.3)" : "#1a1a2e"}`, cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "all 0.15s", flexShrink: 0, whiteSpace: "nowrap" }}
          >
            {tab.label}
            <span style={{ background: activeStatus === tab.value ? "rgba(59,130,246,0.2)" : "#1a1a2e", color: activeStatus === tab.value ? "#3b82f6" : "#6060a0", borderRadius: "20px", padding: "1px 7px", fontSize: "10px", fontWeight: "600" }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

       {/* Contadores */}
       <div className="grid-4" style={{ marginBottom: "20px" }}>
      {[
          { label: "Total", value: totalSheets, color: "#fff", icon: <FileSpreadsheet size={16} color="#6060a0" /> },
          { label: "Não Iniciadas", value: notStarted, color: "#fbbf24", icon: <Clock size={16} color="#fbbf24" /> },
          { label: "Iniciadas", value: inProgress, color: "#3b82f6", icon: <TrendingUp size={16} color="#3b82f6" /> },
          { label: "Finalizadas", value: finished, color: "#22d3a5", icon: <Trophy size={16} color="#22d3a5" /> },
        ].map((item) => (
          <div key={item.label} style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "10px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "10px", color: "#6060a0", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.07em" }}>{item.label}</p>
              <p style={{ fontSize: "22px", fontWeight: "700", color: item.color }}>{item.value}</p>
            </div>
            {item.icon}
          </div>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <p style={{ color: "#6060a0", fontSize: "13px" }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#3a3a5c" }}>
          <FileSpreadsheet size={36} style={{ marginBottom: "12px", opacity: 0.3 }} />
          <p style={{ fontSize: "13px" }}>Nenhuma planilha encontrada</p>
        </div>
      ) : (
        <div className="grid-cards">
          {filtered.map((sheet) => {
            const total = calcTotal(sheet);
            const status = statusConfig[sheet.status];
            const isPositive = total > 0;
            const isNeutral = total === 0;
            const deposited = sheet.lines.reduce((acc, l) => acc + l.deposit, 0);
            const roi = deposited > 0 ? ((total / deposited) * 100).toFixed(1) : "0.0";
            const roiNum = parseFloat(roi);

            return (
              <div
                key={sheet.id}
                onClick={() => router.push(`/sheets/${sheet.id}`)}
                style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "12px", padding: "18px", cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1a1a2e"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* Linha topo */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: isPositive ? "#22d3a5" : isNeutral ? "#3b82f6" : "#f87171", borderRadius: "12px 12px 0 0" }} />

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div style={{ flex: 1, marginRight: "8px" }}>
                    <p style={{ fontSize: "14px", fontWeight: "600", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sheet.name}</p>
                    <p style={{ fontSize: "11px", color: "#6060a0" }}>{new Date(sheet.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", background: status.bg, color: status.color, borderRadius: "20px", padding: "3px 9px", fontSize: "10px", fontWeight: "600", flexShrink: 0 }}>
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: status.dot }} />
                    {status.label}
                  </span>
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === sheet.id ? null : sheet.id);
                      }}
                      title="Opções"
                      style={{ background: "transparent", border: "none", color: "#3a3a5c", cursor: "pointer", display: "flex", alignItems: "center", padding: "2px", borderRadius: "4px", transition: "color 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#9090b0"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#3a3a5c"; }}
                    >
                      <MoreVertical size={16} />
                    </button>
                </div>
                 {/* Dropdown de opções */}
                {menuOpen === sheet.id && (
                  <>
                    {/* Overlay invisível para fechar ao clicar fora */}
                    <div
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(null); }}
                      style={{ position: "fixed", inset: 0, zIndex: 40 }}
                    />
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{ position: "absolute", top: "48px", right: "16px", background: "#141422", border: "1px solid #1a1a2e", borderRadius: "10px", padding: "4px", minWidth: "140px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 41 }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(null);
                          setDeleteTarget(sheet);
                        }}
                        style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 10px", borderRadius: "7px", background: "transparent", border: "none", color: "#f87171", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "background 0.15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <Trash2 size={14} />
                        Excluir
                      </button>
                    </div>
                  </>
                )}
      
                {/* Métricas */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
                  <div style={{ background: "#141422", borderRadius: "8px", padding: "10px 12px" }}>
                    <p style={{ fontSize: "9px", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>Meta</p>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "#fff" }}>{sheet.goal}</p>
                  </div>
                  <div style={{ background: "#141422", borderRadius: "8px", padding: "10px 12px" }}>
                    <p style={{ fontSize: "9px", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>ROI</p>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: roiNum > 0 ? "#22d3a5" : roiNum < 0 ? "#f87171" : "#6060a0" }}>
                      {roiNum > 0 ? "+" : ""}{roi}%
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #1a1a2e" }}>
                  <span style={{ fontSize: "10px", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    {isPositive ? <TrendingUp size={13} color="#22d3a5" /> : isNeutral ? <Minus size={13} color="#6060a0" /> : <TrendingDown size={13} color="#f87171" />}
                    <span style={{ fontSize: "16px", fontWeight: "700", color: isPositive ? "#22d3a5" : isNeutral ? "#6060a0" : "#f87171" }}>
                      {isPositive ? "+" : ""}{fmt(total)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Botão Carregar mais — só quando não há busca/filtro ativo */}
      {!loading && hasMore && activeStatus === "all" && !search.trim() && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            style={{
              background: "#0f0f1a",
              border: "1px solid #1a1a2e",
              borderRadius: "8px",
              padding: "10px 24px",
              color: loadingMore ? "#3a3a5c" : "#3b82f6",
              fontSize: "13px",
              fontWeight: "600",
              cursor: loadingMore ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif",
              transition: "all 0.15s",
            }}
          >
            {loadingMore ? "Carregando..." : "Carregar mais"}
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "380px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "20px" }}>Nova Planilha</h2>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#6060a0", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Plataforma</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                autoFocus
                style={{ width: "100%", background: "#080810", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "9px 12px", color: selectedPlatform ? "#fff" : "#6060a0", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", cursor: "pointer" }}
              >
                <option value="" disabled>Selecione a plataforma</option>
                {platforms.map((p) => (
                  <option key={p.id} value={p.id} style={{ color: "#fff" }}>{p.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#6060a0", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Meta</label>
              <input type="number" value={newGoal} onChange={(e) => setNewGoal(Number(e.target.value))} min={0} placeholder="0" style={{ width: "100%", background: "#080810", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "9px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif" }} />
            </div>

            <div style={{ display: "flex", gap: "4px", marginBottom: "14px", background: "#080810", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "4px" }}>
              <button onClick={() => setPasteMode(false)} style={{ flex: 1, padding: "7px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", background: !pasteMode ? "rgba(59,130,246,0.15)" : "transparent", color: !pasteMode ? "#3b82f6" : "#6060a0" }}>
                Linhas vazias
              </button>
              <button onClick={() => setPasteMode(true)} style={{ flex: 1, padding: "7px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", background: pasteMode ? "rgba(59,130,246,0.15)" : "transparent", color: pasteMode ? "#3b82f6" : "#6060a0" }}>
                Colar depósitos
              </button>
            </div>

            {!pasteMode ? (
              <div style={{ marginBottom: "22px" }}>
                <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#6060a0", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Linhas iniciais</label>
                <input type="number" value={newLines} onChange={(e) => setNewLines(Number(e.target.value))} min={1} max={200} style={{ width: "100%", background: "#080810", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "9px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif" }} />
              </div>
            ) : (
              <div style={{ marginBottom: "22px" }}>
                <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#6060a0", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Cole os depósitos {pasteText.trim() && `(${parseDeposits(pasteText).length} linhas)`}
                </label>
                <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder={"R$ 120,00\nR$ 21,00\nR$ 90,00\n..."} rows={6} style={{ width: "100%", background: "#080810", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "9px 12px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", resize: "vertical" }} />
              </div>
            )}

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "transparent", border: "1px solid #1a1a2e", color: "#6060a0", fontSize: "13px", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Cancelar</button>
               <button onClick={handleCreate} disabled={creating || !selectedPlatform} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: creating || !selectedPlatform ? "#1a1a2e" : "#3b82f6", border: "none", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: creating || !selectedPlatform ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif" }}>
                {creating ? "Criando..." : "Criar"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Pop-up de confirmação de exclusão */}
      {deleteTarget && (
        <div
          onClick={() => !deleting && setDeleteTarget(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: "20px" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#0f0f1a", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "360px", textAlign: "center" }}
          >
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(248,113,113,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={22} color="#f87171" />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>
              Excluir planilha?
            </h3>
            <p style={{ fontSize: "14px", color: "#9090b0", marginBottom: "22px", lineHeight: "1.5" }}>
              A planilha <strong style={{ color: "#fff" }}>{deleteTarget.name}</strong> será removida da sua lista. Esta ação pode ser revertida pelo suporte.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", background: "transparent", border: "1px solid #1a1a2e", color: "#6060a0", fontSize: "14px", fontWeight: "600", cursor: deleting ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ flex: 1, padding: "11px", borderRadius: "10px", background: deleting ? "#1a1a2e" : "#f87171", border: "none", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: deleting ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif" }}
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}