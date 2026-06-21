"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeOut = setTimeout(() => setVisible(false), 2500);
    const redirect = setTimeout(() => router.push("/login"), 2900);
    return () => {
      clearTimeout(fadeOut);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#080810",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      <div
        style={{
          textAlign: "center",
          animation: "splashIn 0.6s ease forwards",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            fontWeight: "700",
            letterSpacing: "-0.02em",
            marginBottom: "10px",
          }}
        >
          <span style={{ color: "#3b82f6" }}>Nexus</span>
          <span style={{ color: "#ffffff" }}> Sheets</span>
        </h1>

        <p
          style={{
            color: "#6060a0",
            fontSize: "14px",
            marginBottom: "36px",
          }}
        >
          Você no controle
        </p>

        {/* Barra de progresso */}
        <div
          style={{
            width: "120px",
            height: "2px",
            background: "#1a1a2e",
            borderRadius: "2px",
            margin: "0 auto",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#3b82f6",
              borderRadius: "2px",
              animation: "progressBar 2.5s linear forwards",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes splashIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
