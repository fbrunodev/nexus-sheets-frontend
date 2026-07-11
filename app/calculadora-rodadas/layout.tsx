import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nexus Calculadora de Rodadas",
  description: "Calculadora de rodadas para ciclos de contas iGaming",
};

export default function CalculadoraLayout({ children }: { children: React.ReactNode }) {
  return children;
}
