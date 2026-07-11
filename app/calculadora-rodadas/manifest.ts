import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nexus Calculadora de Rodadas",
    short_name: "NX Calc",
    description: "Calculadora de rodadas para ciclos de contas iGaming",
    start_url: "/calculadora-rodadas",
    scope: "/calculadora-rodadas",
    display: "standalone",
    background_color: "#080810",
    theme_color: "#3b82f6",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
