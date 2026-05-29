"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // Redireciona para login se não estiver autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080810" }}>
      <Sidebar />
      <main
        style={{
          marginLeft: "230px",
          flex: 1,
          padding: "32px",
          overflowY: "auto",
        }}
      >
        {children}
      </main>
    </div>
  );
}