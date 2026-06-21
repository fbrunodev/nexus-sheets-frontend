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
  ShieldAlert,
  ChevronLeft,
  DollarSign,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Planilhas", href: "/sheets", icon: FileSpreadsheet },
  { label: "Custos", href: "/costs", icon: DollarSign },
  { label: "Operadores", href: "/operators", icon: Users },
  { label: "Admin", href: "/admin", icon: ShieldAlert, adminOnly: true },
  { label: "Configurações", href: "/settings", icon: Settings },
];

export default function Sidebar({ onClose }: { onClose: () => void })  {
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
        width: "200px",
        minHeight: "100vh",
        background: "#080810",
        borderRight: "1px solid #1a1a2e",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: "1px solid #1a1a2e",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: "800",
              color: "#fff",
              marginRight: "10px",
              flexShrink: 0,
            }}
          >
            N
          </div>
          <span style={{ fontSize: "15px", fontWeight: "700", color: "#fff" }}>
            Nexus
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ background: "transparent", border: "none", color: "#6060a0", cursor: "pointer", display: "flex", alignItems: "center", padding: "2px" }}
          title="Esconder menu"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: "2px" }}>
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
                  gap: "10px",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: isActive ? "500" : "400",
                  color: isActive ? "#fff" : "#6060a0",
                  background: isActive ? "rgba(59,130,246,0.12)" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "#a0a0c0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#6060a0";
                  }
                }}
              >
                <Icon
                  size={16}
                  color={isActive ? "#3b82f6" : "#6060a0"}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {item.label}
              </Link>
            );
          })}
      </nav>

      {/* User */}
      <div style={{ borderTop: "1px solid #1a1a2e", padding: "12px 8px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 10px",
            borderRadius: "8px",
            marginBottom: "2px",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "7px",
              background: "rgba(59,130,246,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "700",
              color: "#3b82f6",
              flexShrink: 0,
            }}
          >
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <p style={{ fontSize: "11px", color: "#fff", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email?.split("@")[0]}
            </p>
            <p style={{ fontSize: "10px", color: "#3a3a5c", marginTop: "1px" }}>
              {user?.role}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            padding: "8px 10px",
            borderRadius: "8px",
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
          <LogOut size={16} strokeWidth={1.8} />
          Sair
        </button>
      </div>
    </aside>
  );
}