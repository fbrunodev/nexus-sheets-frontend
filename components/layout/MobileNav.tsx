"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  Settings,
  ShieldAlert,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Planilhas", href: "/sheets", icon: FileSpreadsheet },
  { label: "Operadores", href: "/operators", icon: Users },
  { label: "Admin", href: "/admin", icon: ShieldAlert, adminOnly: true },
  { label: "Config", href: "/settings", icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const items = navItems.filter(
    (item) => !item.adminOnly || user?.role === "ADMIN"
  );

  return (
    <nav
      style={{
        position: "fixed",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        background: "rgba(15,15,26,0.92)",
        backdropFilter: "blur(12px)",
        border: "1px solid #1a1a2e",
        borderRadius: "18px",
        padding: "8px 10px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        zIndex: 100,
      }}
    >
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: isActive ? "rgba(59,130,246,0.15)" : "transparent",
              transition: "all 0.15s",
            }}
          >
            <Icon
              size={20}
              color={isActive ? "#3b82f6" : "#6060a0"}
              strokeWidth={isActive ? 2.5 : 1.8}
            />
          </Link>
        );
      })}
    </nav>
  );
}