"use client";

import { useState, useEffect } from "react";

/**
 * Detecta se a tela está em tamanho mobile (≤767px).
 * Escuta mudanças de tamanho para reagir a rotação/redimensionamento.
 */
export function useIsMobile(breakpoint: number = 767) {
  // Inicia como false para evitar mismatch de hidratação no SSR
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth <= breakpoint);
    }

    check(); // checa na montagem
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}