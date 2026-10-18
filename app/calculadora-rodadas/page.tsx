"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

interface Conta { id: number; deposito: string; }

function calcular(deposito: number, x: number, divisor: number, limite: number) {
  if (deposito <= 0 || x <= 0 || divisor <= 0 || limite <= 0) return null;
  const alvo = deposito * x;
  const rodadas = Math.floor(alvo / divisor);
  if (rodadas > limite) return { excede: true, rodadas };
  return { excede: false, rodadas, parar: limite - rodadas };
}


export default function CalculadoraRodadas() {
  const router = useRouter();
  const [xStr, setXStr] = useState<string>("1");
  const [limiteStr, setLimiteStr] = useState<string>("999");
  const [divisorStr, setDivisorStr] = useState<string>("");
  const x = parseFloat(xStr.replace(",", ".")) || 0;
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const saved = localStorage.getItem("calculadora-state");
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.xStr) setXStr(state.xStr);
        if (state.limiteStr) setLimiteStr(state.limiteStr);
        if (state.divisorStr) setDivisorStr(state.divisorStr);
        if (state.contas) setContas(state.contas);
      } catch (e) {}
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("calculadora-state", JSON.stringify({ xStr, limiteStr, divisorStr, contas }));
  }, [xStr, limiteStr, divisorStr, contas, mounted]);

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

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "Inter, sans-serif", padding: "20px 16px", maxWidth: "480px", margin: "0 auto", overflowX: "hidden" }}>

      {/* Fechar */}
      <button
        onClick={() => {
          window.close();
          setTimeout(() => { router.push("/dashboard"); }, 100);
        }}
        style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--negative-text)", fontSize: "12px", fontWeight: "600", background: "var(--negative-subtle)", border: "1px solid var(--negative-border)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontFamily: "Inter, sans-serif", marginBottom: "16px" }}
      >
        <span>✕</span>
        <span>Fechar</span>
      </button>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: "700", margin: 0, letterSpacing: "-0.01em" }}>
            <span style={{ color: "#3b82f6" }}>Nexus</span> Calculadora
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "4px 0 0", fontWeight: "400" }}>
            Calculadora de rodadas
          </p>
        </div>
        {deferredPrompt && (
          <button
            onClick={handleInstall}
            style={{ background: "var(--accent)", border: "none", borderRadius: "8px", padding: "8px 14px", color: "var(--bg)", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "Inter, sans-serif", flexShrink: 0 }}
          >
            + Instalar app
          </button>
        )}
      </div>

      {/* Configs globais */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { key: "x",      label: "Multiplicador", value: xStr,       onChange: setXStr,       min: 0, step: 0.1 },
          { key: "limite", label: "Limite",         value: limiteStr,  onChange: setLimiteStr,  min: 1 },
          { key: "bet",    label: "Bet",            value: divisorStr, onChange: setDivisorStr, min: 0, placeholder: "0" },
        ].map(cfg => (
          <Card key={cfg.key} variant="compact" style={{ padding: "12px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>{cfg.label}</label>
            <input
              type="number"
              value={cfg.value}
              onChange={e => cfg.onChange(e.target.value)}
              placeholder={cfg.placeholder}
              min={cfg.min}
              step={cfg.step}
              style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid var(--border)", color: "var(--text)", fontSize: "16px", fontWeight: "600", outline: "none", fontFamily: "Inter, sans-serif", padding: "4px 0", boxSizing: "border-box" as const, transition: "border-color 0.15s" }}
              onFocus={e => { e.target.style.borderBottomColor = "var(--accent)"; }}
              onBlur={e => { e.target.style.borderBottomColor = "var(--border)"; }}
            />
          </Card>
        ))}
      </div>

      {/* Header das colunas */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ width: "16px" }} />
        <span style={{ width: "80px", fontSize: "11px", color: "var(--text-secondary)" }}>Depósito</span>
        <span style={{ width: "1px" }} />
        <span style={{ flex: 1, fontSize: "11px", color: "var(--text-secondary)", textAlign: "center" as const }}>Rodadas</span>
        <span style={{ width: "1px" }} />
        <span style={{ flex: 1, fontSize: "11px", color: "var(--text-secondary)", textAlign: "center" as const }}>Parada</span>
        <span style={{ width: "24px" }} />
      </div>

      {/* Linhas de contas */}
      {contas.map((conta, i) => {
        const res = calcular(parseFloat(conta.deposito.replace(",", ".")) || 0, x, parseFloat(divisorStr.replace(",", ".")) || 0, limite);
        return (
          <div key={conta.id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>

            <span style={{ fontSize: "11px", color: "var(--text-muted)", width: "16px", flexShrink: 0 }}>{i + 1}</span>

            <input
              type="number"
              value={conta.deposito}
              onChange={e => updateConta(conta.id, e.target.value)}
              placeholder="Dep."
              style={{ width: "80px", flexShrink: 0, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 10px", color: "var(--text)", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box" as const, transition: "border-color 0.15s" }}
              onFocus={e => { e.target.style.borderColor = "var(--accent)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--border)"; }}
            />

            <span style={{ color: "var(--border)", fontSize: "16px", flexShrink: 0 }}>|</span>

            <div style={{ flex: 1, textAlign: "center" as const }}>
              {!res
                ? <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>—</span>
                : res.excede
                ? <span style={{ color: "var(--negative-text)", fontSize: "14px", fontWeight: "700" }}>{res.rodadas} rod.</span>
                : <span style={{ color: "var(--warning)", fontSize: "14px", fontWeight: "700" }}>{res.rodadas} rod.</span>
              }
            </div>

            <span style={{ color: "var(--border)", fontSize: "16px", flexShrink: 0 }}>|</span>

            <div style={{ flex: 1, textAlign: "center" as const }}>
              {!res
                ? <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>—</span>
                : res.excede
                ? <span style={{ color: "var(--negative-text)", fontSize: "12px", fontWeight: "600" }}>Excede {limite}</span>
                : <span style={{ color: "var(--positive)", fontSize: "14px", fontWeight: "700" }}>Parar em {res.parar}</span>
              }
            </div>

            <button
              onClick={() => removeConta(conta.id)}
              disabled={contas.length <= 1}
              style={{ background: "transparent", border: "none", color: contas.length <= 1 ? "var(--border)" : "var(--text-muted)", cursor: contas.length <= 1 ? "default" : "pointer", fontSize: "18px", width: "24px", flexShrink: 0, transition: "color 0.15s" }}
              onMouseEnter={e => { if (contas.length > 1) e.currentTarget.style.color = "var(--negative-text)"; }}
              onMouseLeave={e => { if (contas.length > 1) e.currentTarget.style.color = "var(--text-muted)"; }}
            >×</button>

          </div>
        );
      })}

      {/* Botões de ação */}
      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
        <button
          onClick={addConta}
          style={{ flex: 1, background: "var(--surface)", border: "1px dashed var(--border-strong)", borderRadius: "10px", padding: "12px", color: "var(--accent)", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "background 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--surface-hover)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)"; }}
        >
          + Adicionar conta
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("calculadora-state");
            setXStr("1");
            setLimiteStr("999");
            setDivisorStr("");
            setContas([
              { id: 1, deposito: "" },
              { id: 2, deposito: "" },
              { id: 3, deposito: "" },
              { id: 4, deposito: "" },
              { id: 5, deposito: "" },
            ]);
          }}
          style={{ background: "var(--negative-subtle)", border: "1px solid var(--negative-border)", borderRadius: "8px", padding: "10px 16px", color: "var(--negative-text)", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
        >
          Limpar
        </button>
      </div>
    </div>
  );
}
