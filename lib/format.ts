const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const num = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const formatBRL = (v: number) => brl.format(v);

export const formatSignedBRL = (v: number) =>
  `${v >= 0 ? "+" : "−"}${brl.format(Math.abs(v))}`;

export const formatPercent = (v: number) => pct.format(v / 100);

export const formatNumber = (v: number) => num.format(v);

export const formatSignedPercent = (v: number) =>
  v === 0 ? pct.format(0) : `${v > 0 ? "+" : "−"}${pct.format(Math.abs(v) / 100)}`;
