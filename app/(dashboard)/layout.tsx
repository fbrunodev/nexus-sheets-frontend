"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";
import { Bell, Plus, ChevronDown } from "lucide-react";
import Link from "next/link";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/sheets": "Planilhas",
  "/operators": "Operadores",
  "/settings": "Configurações",
  "/admin": "Painel Admin",
  "/notes": "Anotações",
  "/activities": "Atividades",
  "/chat": "Chat",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, hasHydrated } = useAuthStore();
  const [currentDate, setCurrentDate] = useState("");

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
      <Sidebar />
      <div style={{ marginLeft: "200px", flex: 1, display: "flex", flexDirection: "column" }}>

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
          {/* Título da página */}
          <div style={{ fontSize: "15px", fontWeight: "600", color: "#fff" }}>
            {pageTitle}
          </div>

          {/* Direita */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Data */}
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
                cursor: "pointer",
              }}
            >
              {currentDate}
              <ChevronDown size={12} color="#6060a0" />
            </div>

            {/* Nova planilha */}
            <Link
              href="/sheets"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#3b82f6",
                border: "none",
                borderRadius: "8px",
                padding: "7px 14px",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "600",
                textDecoration: "none",
                transition: "background 0.15s",
              }}
            >
              <Plus size={14} />
              Nova Planilha
            </Link>

            {/* Sino */}
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