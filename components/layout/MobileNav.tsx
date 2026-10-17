"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  FileSpreadsheet,
  DollarSign,
  MoreHorizontal,
  Calculator,
  Users,
  Settings,
  ShieldAlert,
  X,
} from "lucide-react";

const PRIMARY_TABS = [
  { label: "Visão geral", href: "/dashboard", icon: LayoutDashboard },
  { label: "Planilhas",   href: "/sheets",    icon: FileSpreadsheet },
  { label: "Custos",      href: "/costs",     icon: DollarSign },
];

const MORE_ITEMS = [
  { label: "Calculadora",   href: "/calculadora-rodadas", icon: Calculator,  newTab: true },
  { label: "Operadores",    href: "/operators",           icon: Users,        operadorHide: true },
  { label: "Admin",         href: "/admin",               icon: ShieldAlert,  adminOnly: true },
  { label: "Configurações", href: "/settings",            icon: Settings },
];

export default function MobileNav() {
  const pathname  = usePathname();
  const { user }  = useAuthStore();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreBtnRef  = useRef<HTMLButtonElement>(null);
  const drawerRef   = useRef<HTMLDivElement>(null);

  const moreItems = MORE_ITEMS.filter(
    (item) =>
      (!item.adminOnly    || user?.role === "ADMIN") &&
      (!item.operadorHide || user?.role !== "OPERADOR")
  );

  const isMoreActive = moreItems.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  // Foco no primeiro item do drawer ao abrir; retorna ao botão ao fechar
  useEffect(() => {
    if (moreOpen) {
      const t = setTimeout(() => {
        const first = drawerRef.current?.querySelector<HTMLElement>("a, button");
        first?.focus();
      }, 40);
      return () => clearTimeout(t);
    } else {
      moreBtnRef.current?.focus();
    }
  }, [moreOpen]);

  // Fecha com Esc
  useEffect(() => {
    if (!moreOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMoreOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  function close() {
    setMoreOpen(false);
  }

  return (
    <>
      {/* Backdrop */}
      {moreOpen && (
        <div className="more-backdrop" onClick={close} aria-hidden="true" />
      )}

      {/* Drawer "Mais" */}
      {moreOpen && (
        <div
          ref={drawerRef}
          className="more-drawer"
          role="dialog"
          aria-label="Mais opções"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4px 4px 8px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              Mais
            </span>
            <button
              onClick={close}
              aria-label="Fechar menu"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={16} />
            </button>
          </div>

          {moreItems.map((item) => {
            const Icon     = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            if (item.newTab) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="more-item"
                  style={{ color: "var(--text-secondary)" }}
                  onClick={close}
                >
                  <Icon size={18} color="var(--text-muted)" strokeWidth={1.8} />
                  {item.label}
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="more-item"
                style={{ color: isActive ? "var(--text)" : "var(--text-secondary)" }}
                onClick={close}
              >
                <Icon
                  size={18}
                  color={isActive ? "var(--accent)" : "var(--text-muted)"}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Tab bar */}
      <nav className="tab-bar" aria-label="Navegação principal">
        {PRIMARY_TABS.map((tab) => {
          const Icon     = tab.icon;
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");

          return (
            <Link key={tab.href} href={tab.href} className="tab-item">
              <Icon
                size={20}
                color={isActive ? "var(--accent)" : "var(--text-muted)"}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className="tab-label"
                style={{ color: isActive ? "var(--accent)" : "var(--text-muted)" }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* Botão Mais */}
        <button
          ref={moreBtnRef}
          className="tab-item"
          aria-expanded={moreOpen}
          aria-haspopup="dialog"
          onClick={() => setMoreOpen((o) => !o)}
        >
          <MoreHorizontal
            size={20}
            color={isMoreActive || moreOpen ? "var(--accent)" : "var(--text-muted)"}
            strokeWidth={isMoreActive || moreOpen ? 2.5 : 1.8}
          />
          <span
            className="tab-label"
            style={{ color: isMoreActive || moreOpen ? "var(--accent)" : "var(--text-muted)" }}
          >
            Mais
          </span>
        </button>
      </nav>
    </>
  );
}
