"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";
import { Bell, ChevronDown, Menu } from "lucide-react";
import MobileNav from "@/components/layout/MobileNav";
import { registerPushSubscription } from "@/lib/push";

const pageTitles: Record<string, string> = {
  "/dashboard": "Visão geral",
  "/sheets": "Planilhas",
  "/operators": "Operadores",
  "/settings": "Configurações",
  "/admin": "Painel Admin",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [currentDate, setCurrentDate] = useState("");
  const [currentDateShort, setCurrentDateShort] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }));
    setCurrentDateShort(now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }));
  }, []);

  useEffect(() => {
    registerPushSubscription().catch(console.error);
  }, []);

  if (!hasHydrated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const pageTitle = Object.entries(pageTitles).find(([key]) =>
    pathname.startsWith(key)
  )?.[1] || "Nexus Sheets";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sidebar — escondida no mobile via CSS */}
      {sidebarOpen && (
        <div className="app-sidebar">
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="app-content" style={{ marginLeft: sidebarOpen ? undefined : "0", flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Topbar */}
        <div
          style={{
            height: "52px",
            background: "var(--bg)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="topbar-menu-btn"
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", alignItems: "center", padding: "4px" }}
                title="Mostrar menu"
              >
                <Menu size={18} />
              </button>
            )}
            {!pathname.startsWith("/dashboard") && (
              <div style={{ fontSize: "15px", fontWeight: "600", color: "#fff" }}>
                {pageTitle}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Date picker: oculto no /dashboard — período controlado pela própria página */}
            {!pathname.startsWith("/dashboard") && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                }}
              >
                <span className="date-long">{currentDate}</span>
                <span className="date-short">{currentDateShort}</span>
                <ChevronDown size={12} color="var(--text-secondary)" />
              </div>
            )}

            <button
              aria-label="Notificações"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Bell size={15} color="var(--text-secondary)" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <main className="app-main" style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>

      {/* Menu inferior — visível só no mobile via CSS */}
      <div className="app-mobile-nav">
        <MobileNav />
      </div>
    </div>
  );
}