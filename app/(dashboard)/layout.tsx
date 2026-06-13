"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";
import { Bell, ChevronDown, Menu } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    const date = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    setCurrentDate(date);
  }, []);

  if (!hasHydrated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#080810" }}>
        <p style={{ color: "#6060a0", fontSize: "14px" }}>Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const pageTitle = Object.entries(pageTitles).find(([key]) =>
    pathname.startsWith(key)
  )?.[1] || "Nexus Sheets";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080810" }}>
      {/* Sidebar — só renderiza se aberta, e recebe a função de fechar */}
      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      <div style={{ marginLeft: sidebarOpen ? "200px" : "0", flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.2s" }}>

        {/* Topbar */}
        <div
          style={{
            height: "52px",
            background: "#080810",
            borderBottom: "1px solid #1a1a2e",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          {/* Esquerda: botão menu (só quando sidebar fechada) + título */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{ background: "transparent", border: "none", color: "#6060a0", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px" }}
                title="Mostrar menu"
              >
                <Menu size={18} />
              </button>
            )}
            <div style={{ fontSize: "15px", fontWeight: "600", color: "#fff" }}>
              {pageTitle}
            </div>
          </div>

          {/* Direita: data + sino */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#0f0f1a",
                border: "1px solid #1a1a2e",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "12px",
                color: "#6060a0",
              }}
            >
              {currentDate}
              <ChevronDown size={12} color="#6060a0" />
            </div>

            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "#0f0f1a",
                border: "1px solid #1a1a2e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Bell size={15} color="#6060a0" />
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}