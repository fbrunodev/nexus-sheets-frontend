"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Activity,
  MessageSquare,
  BookOpen,
  ShieldAlert,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Planilhas", href: "/sheets", icon: FileSpreadsheet },
  { label: "Anotações", href: "/notes", icon: BookOpen },
  { label: "Operadores", href: "/operators", icon: Users },
  { label: "Atividades", href: "/activities", icon: Activity },
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Admin", href: "/admin", icon: ShieldAlert, adminOnly: true },
  { label: "Configurações", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside
      style={{
        width: "230px",
        minHeight: "100vh",
        background: "#0a0a14",
        borderRight: "1px solid #1a1a2e",
        display: "flex",
        flexDirection: "column",
        padding: "20px 12px",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "8px 10px", marginBottom: "28px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "700", letterSpacing: "-0.02em" }}>
          <span style={{ color: "#3b82f6" }}>Nexus</span>
          <span style={{ color: "#ffffff" }}> Sheets</span>
        </h1>
        <p style={{ fontSize: "11px", color: "#3a3a5c", marginTop: "2px" }}>
          Operacional
        </p>
      </div>

      {/* Navegação */}
            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
        {navItems
            .filter((item) => !item.adminOnly || user?.role === "ADMIN")
            .map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
                <Link
                key={item.href}
                href={item.href}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 10px",
                    borderRadius: "10px",
                    marginBottom: "2px",
                    fontSize: "13px",
                    fontWeight: isActive ? "500" : "400",
                    color: isActive ? "#ffffff" : "#6060a0",
                    background: isActive ? "rgba(59,130,246,0.1)" : "transparent",
                    borderLeft: isActive ? "2px solid #3b82f6" : "2px solid transparent",
                    textDecoration: "none",
                    transition: "all 0.15s",
                    position: "relative",
                }}
                >
                <div
                    style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: isActive ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    }}
                >
                    <Icon size={15} color={isActive ? "#3b82f6" : "#6060a0"} />
                </div>

                {item.label}

                {isActive && (
                    <ChevronRight
                    size={14}
                    color="#3b82f6"
                    style={{ marginLeft: "auto" }}
                    />
                )}
                </Link>
            );
            })}
        </nav>

      {/* Usuário */}
      <div style={{ borderTop: "1px solid #1a1a2e", paddingTop: "16px" }}>
        {/* Avatar + info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px",
            borderRadius: "10px",
            marginBottom: "4px",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {/* Avatar inicial */}
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(59,130,246,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: "600",
              color: "#3b82f6",
              flexShrink: 0,
            }}
          >
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>

          <div style={{ overflow: "hidden", flex: 1 }}>
            <p
              style={{
                fontSize: "12px",
                color: "#ffffff",
                fontWeight: "500",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email}
            </p>
            <p style={{ fontSize: "10px", color: "#3a3a5c", marginTop: "1px" }}>
              {user?.role}
            </p>
          </div>
        </div>

        {/* Botão sair */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            fontSize: "13px",
            color: "#6060a0",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#f87171";
            e.currentTarget.style.background = "rgba(248,113,113,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6060a0";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LogOut size={15} />
          </div>
          Sair
        </button>
      </div>
    </aside>
  );
}