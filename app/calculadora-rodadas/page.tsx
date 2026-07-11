"use client";
import { useState, useEffect } from "react";

interface Conta { id: number; deposito: string; }

function calcular(deposito: number, x: number, divisor: number, limite: number) {
  if (deposito <= 0 || x <= 0 || divisor <= 0 || limite <= 0) return null;
  const alvo = deposito * x;
  const rodadas = Math.floor(alvo / divisor);
  if (rodadas > limite) return { excede: true, rodadas };
  return { excede: false, rodadas, parar: limite - rodadas };
}


export default function CalculadoraRodadas() {
  const [xStr, setXStr] = useState<string>("1");
  const [limiteStr, setLimiteStr] = useState<string>("999");
  const [divisorStr, setDivisorStr] = useState<string>("");
  const x = parseFloat(xStr) || 0;
  const limite = parseInt(limiteStr) || 0;
  const [contas, setContas] = useState<Conta[]>([
    { id: 1, deposito: "" },
    { id: 2, deposito: "" },
    { id: 3, deposito: "" },
    { id: 4, deposito: "" },
    { id: 5, deposito: "" },
  ]);
  const [nextContaId, setNextContaId] = useState(6);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (typeof window !== "undefined") {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }

  function addConta() {
    setContas(prev => [...prev, { id: nextContaId, deposito: "" }]);
    setNextContaId(prev => prev + 1);
  }

  function removeConta(id: number) {
    if (contas.length <= 1) return;
    setContas(prev => prev.filter(c => c.id !== id));
  }

  function updateConta(id: number, deposito: string) {
    setContas(prev => prev.map(c => c.id === id ? { ...c, deposito } : c));
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  function inputStyle(key: string): React.CSSProperties {
    const focused = focusedInput === key;
    return {
      background: "#080810",
      border: `1px solid ${focused ? "#3b82f6" : "#1a1a2e"}`,
      borderRadius: "8px",
      padding: "8px 10px",
      color: "#fff",
      fontSize: "13px",
      outline: "none",
      fontFamily: "Inter, sans-serif",
      width: "100%",
      boxSizing: "border-box",
      transition: "border-color 0.15s",
    };
  }

  const label: React.CSSProperties = {
    display: "block",
    fontSize: "10px",
    color: "#6060a0",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: "6px",
    fontWeight: "500",
  };

  const card: React.CSSProperties = {
    background: "#0f0f1a",
    border: "1px solid #1a1a2e",
    borderRadius: "10px",
    padding: "14px 16px",
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#fff", fontFamily: "Inter, sans-serif", padding: "20px 16px", maxWidth: "480px", margin: "0 auto", overflowX: "hidden" }}>

      {/* Voltar */}
      <a href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#3b82f6", fontSize: "12px", fontWeight: "600", textDecoration: "none", marginBottom: "16px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "8px", padding: "6px 12px" }}>
        <span>←</span>
        <span>Nexus Sheets</span>
      </a>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: "700", margin: 0, letterSpacing: "-0.01em" }}>
            <span style={{ color: "#3b82f6" }}>Nexus</span> Calculadora
          </h1>
          <p style={{ fontSize: "12px", color: "#6060a0", margin: "4px 0 0", fontWeight: "400" }}>
            Calculadora de Rodadas
          </p>
        </div>
        {deferredPrompt && (
          <button
            onClick={handleInstall}
            style={{ background: "#3b82f6", border: "none", borderRadius: "8px", padding: "8px 14px", color: "#fff", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "Inter, sans-serif", flexShrink: 0 }}
          >
            + Instalar App
          </button>
        )}
      </div>

      {/* Configs globais */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { key: "x",      label: "Multiplicador", value: xStr,      onChange: setXStr,      min: 0, step: 0.1 },
          { key: "limite", label: "Limite",         value: limiteStr, onChange: setLimiteStr, min: 1 },
          { key: "bet",    label: "Bet",            value: divisorStr, onChange: setDivisorStr, min: 0, placeholder: "0" },
        ].map(cfg => (
          <div key={cfg.key} style={{ background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "10px", padding: "12px" }}>
            <label style={{ display: "block", fontSize: "10px", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>{cfg.label}</label>
            <input
              type="number"
              value={cfg.value}
              onChange={e => cfg.onChange(e.target.value)}
              placeholder={cfg.placeholder}
              min={cfg.min}
              step={cfg.step}
              style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid #1a1a2e", color: "#fff", fontSize: "16px", fontWeight: "600", outline: "none", fontFamily: "Inter, sans-serif", padding: "4px 0", boxSizing: "border-box" as const }}
              onFocus={e => { e.target.style.borderBottomColor = "#3b82f6"; }}
              onBlur={e => { e.target.style.borderBottomColor = "#1a1a2e"; }}
            />
          </div>
        ))}
      </div>

      {/* Header das colunas */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid #1a1a2e" }}>
        <span style={{ width: "16px" }} />
        <span style={{ width: "80px", fontSize: "9px", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em" }}>Depósito</span>
        <span style={{ width: "1px" }} />
        <span style={{ flex: 1, fontSize: "9px", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "center" as const }}>Rodadas</span>
        <span style={{ width: "1px" }} />
        <span style={{ flex: 1, fontSize: "9px", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "center" as const }}>Parada</span>
        <span style={{ width: "24px" }} />
      </div>

      {/* Linhas de contas */}
      {contas.map((conta, i) => {
        const res = calcular(parseFloat(conta.deposito) || 0, x, parseFloat(divisorStr) || 0, limite);
        return (
          <div key={conta.id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>

            <span style={{ fontSize: "11px", color: "#3a3a5c", width: "16px", flexShrink: 0 }}>{i + 1}</span>

            <input
              type="number"
              value={conta.deposito}
              onChange={e => updateConta(conta.id, e.target.value)}
              placeholder="Dep."
              style={{ width: "80px", flexShrink: 0, background: "#0f0f1a", border: "1px solid #1a1a2e", borderRadius: "8px", padding: "8px 10px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box" as const, transition: "border-color 0.15s" }}
              onFocus={e => { e.target.style.borderColor = "#3b82f6"; }}
              onBlur={e => { e.target.style.borderColor = "#1a1a2e"; }}
            />

            <span style={{ color: "#1a1a2e", fontSize: "16px", flexShrink: 0 }}>|</span>

            <div style={{ flex: 1, textAlign: "center" as const }}>
              {!res
                ? <span style={{ color: "#3a3a5c", fontSize: "12px" }}>—</span>
                : res.excede
                ? <span style={{ color: "#f87171", fontSize: "14px", fontWeight: "700" }}>{res.rodadas} rod.</span>
                : <span style={{ color: "#fbbf24", fontSize: "14px", fontWeight: "700" }}>{res.rodadas} rod.</span>
              }
            </div>

            <span style={{ color: "#1a1a2e", fontSize: "16px", flexShrink: 0 }}>|</span>

            <div style={{ flex: 1, textAlign: "center" as const }}>
              {!res
                ? <span style={{ color: "#3a3a5c", fontSize: "12px" }}>—</span>
                : res.excede
                ? <span style={{ color: "#f87171", fontSize: "12px", fontWeight: "600" }}>Excede {limite}</span>
                : <span style={{ color: "#22d3a5", fontSize: "14px", fontWeight: "700" }}>Parar em {res.parar}</span>
              }
            </div>

            <button
              onClick={() => removeConta(conta.id)}
              disabled={contas.length <= 1}
              style={{ background: "transparent", border: "none", color: contas.length <= 1 ? "#2a2a3c" : "#3a3a5c", cursor: contas.length <= 1 ? "default" : "pointer", fontSize: "18px", width: "24px", flexShrink: 0, transition: "color 0.15s" }}
              onMouseEnter={e => { if (contas.length > 1) e.currentTarget.style.color = "#f87171"; }}
              onMouseLeave={e => { if (contas.length > 1) e.currentTarget.style.color = "#3a3a5c"; }}
            >×</button>

          </div>
        );
      })}

      {/* Botão adicionar conta */}
      <button
        onClick={addConta}
        style={{ width: "100%", marginTop: "4px", background: "rgba(59,130,246,0.08)", border: "1px dashed rgba(59,130,246,0.2)", borderRadius: "10px", padding: "12px", color: "#3b82f6", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "background 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.14)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(59,130,246,0.08)"; }}
      >
        + Adicionar Conta
      </button>
    </div>
  );
}
