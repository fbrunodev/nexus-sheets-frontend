"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { MoneyInput } from "@/components/ui/money-input";
import { NumberInput } from "@/components/ui/number-input";

interface Conta { id: number; deposito: number; }

function calcular(deposito: number, x: number, divisor: number, limite: number) {
  if (deposito <= 0 || x <= 0 || divisor <= 0 || limite <= 0) return null;
  const alvo = deposito * x;
  const rodadas = Math.floor(alvo / divisor);
  if (rodadas > limite) return { excede: true, rodadas };
  return { excede: false, rodadas, parar: limite - rodadas };
}


export default function CalculadoraRodadas() {
  const router = useRouter();
  const [x, setX] = useState<number>(1);
  const [limite, setLimite] = useState<number>(999);
  const [divisor, setDivisor] = useState<number>(0);
  const [contas, setContas] = useState<Conta[]>([
    { id: 1, deposito: 0 },
    { id: 2, deposito: 0 },
    { id: 3, deposito: 0 },
    { id: 4, deposito: 0 },
    { id: 5, deposito: 0 },
  ]);
  const [nextContaId, setNextContaId] = useState(6);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    let raw = localStorage.getItem("calculadora-state-v2");
    if (!raw) {
      const v1 = localStorage.getItem("calculadora-state");
      if (v1) {
        try {
          const s = JSON.parse(v1);
          const migrated = {
            x:       parseFloat((s.xStr       || "1").replace(",", ".")) || 1,
            limite:  parseInt(s.limiteStr     || "999")                  || 999,
            divisor: parseFloat((s.divisorStr || "0").replace(",", ".")) || 0,
            contas:  (s.contas || []).map((c: any) => ({
              id:       c.id,
              deposito: parseFloat((c.deposito || "0").replace(",", ".")) || 0,
            })),
          };
          raw = JSON.stringify(migrated);
          localStorage.setItem("calculadora-state-v2", raw);
          localStorage.removeItem("calculadora-state");
        } catch (e) {}
      }
    }
    if (raw) {
      try {
        const state = JSON.parse(raw);
        if (state.x       !== undefined) setX(state.x);
        if (state.limite  !== undefined) setLimite(state.limite);
        if (state.divisor !== undefined) setDivisor(state.divisor);
        if (state.contas)                setContas(state.contas);
      } catch (e) {}
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("calculadora-state-v2", JSON.stringify({ x, limite, divisor, contas }));
  }, [x, limite, divisor, contas, mounted]);

  if (typeof window !== "undefined") {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }

  function addConta() {
    setContas(prev => [...prev, { id: nextContaId, deposito: 0 }]);
    setNextContaId(prev => prev + 1);
  }

  function removeConta(id: number) {
    if (contas.length <= 1) return;
    setContas(prev => prev.filter(c => c.id !== id));
  }

  function updateConta(id: number, deposito: number) {
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
          { key: "x",      label: "Multiplicador", value: x,       onChange: setX,       min: 0, allowDecimal: true  },
          { key: "limite", label: "Limite",         value: limite,  onChange: setLimite,  min: 1, allowDecimal: false },
          { key: "bet",    label: "Bet",            value: divisor, onChange: setDivisor, min: 0, allowDecimal: true, placeholder: "0" },
        ].map(cfg => (
          <Card key={cfg.key} variant="compact" style={{ padding: "12px" }}>
            <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>{cfg.label}</label>
            <NumberInput
              value={cfg.value}
              onChange={cfg.onChange}
              min={cfg.min}
              allowDecimal={cfg.allowDecimal}
              placeholder={(cfg as any).placeholder}
              className="calc-input"
            />
          </Card>
        ))}
      </div>

      {/* Header das colunas */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ width: "16px" }} />
        <span style={{ width: "100px", fontSize: "11px", color: "var(--text-secondary)" }}>Depósito</span>
        <span style={{ width: "1px" }} />
        <span style={{ flex: 1, fontSize: "11px", color: "var(--text-secondary)", textAlign: "center" as const }}>Rodadas</span>
        <span style={{ width: "1px" }} />
        <span style={{ flex: 1, fontSize: "11px", color: "var(--text-secondary)", textAlign: "center" as const }}>Parada</span>
        <span style={{ width: "24px" }} />
      </div>

      {/* Linhas de contas */}
      {contas.map((conta, i) => {
        const res = calcular(conta.deposito, x, divisor, limite);
        return (
          <div key={conta.id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>

            <span style={{ fontSize: "11px", color: "var(--text-muted)", width: "16px", flexShrink: 0 }}>{i + 1}</span>

            <MoneyInput
              value={conta.deposito}
              onBlur={(v) => updateConta(conta.id, v)}
              style={{ width: "100px", flexShrink: 0 }}
              inputStyle={{ fontSize: "13px", padding: "8px 0" }}
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
            localStorage.removeItem("calculadora-state-v2");
            setX(1);
            setLimite(999);
            setDivisor(0);
            setContas([
              { id: 1, deposito: 0 },
              { id: 2, deposito: 0 },
              { id: 3, deposito: 0 },
              { id: 4, deposito: 0 },
              { id: 5, deposito: 0 },
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
