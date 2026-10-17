"use client";

import { useRouter } from "next/navigation";

interface SheetLine {
  deposit: number;
  withdrawal: number;
  chest: number;
  bonus: number;
}

interface RecentSheet {
  id: string;
  name: string;
  status: string;
  created_at: string;
  salary: number;
  lines: SheetLine[];
}

interface Props {
  sheets: RecentSheet[];
  totalCount: number;
  calcSheetResult: (sheet: RecentSheet) => number;
}

const STATUS_MAP: Record<string, { label: string; dot: string }> = {
  NOT_STARTED: { label: "Não iniciada",  dot: "#5A5A62" },
  IN_PROGRESS: { label: "Em andamento",  dot: "var(--accent)" },
  FINISHED:    { label: "Concluída",     dot: "var(--text-muted)" },
};

const TABLE_HEADERS = ["Operação", "Data", "Status", "Linhas", "Resultado"];

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Math.abs(v)
  );

const FOOTER_NOTE =
  "Valores por planilha não incluem custos, que são descontados no lucro líquido.";

export default function RecentSheets({ sheets, totalCount, calcSheetResult }: Props) {
  const router = useRouter();

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        overflow: "hidden",
        marginBottom: "16px",
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--text)" }}>
          Últimas planilhas
        </p>
        <button
          onClick={() => router.push("/sheets")}
          style={{
            fontSize: "13px",
            color: "var(--accent)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Ver todas →
        </button>
      </div>

      {/* ── Tabela — desktop ── */}
      <div className="dash-table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "640px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {TABLE_HEADERS.map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 20px",
                    textAlign: h === "Resultado" ? "right" : "left",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "var(--text-muted)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheets.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "32px 20px",
                    textAlign: "center",
                    fontSize: "13px",
                    color: "var(--text-muted)",
                  }}
                >
                  Nenhuma planilha encontrada
                </td>
              </tr>
            ) : (
              sheets.map((sheet) => {
                const result = calcSheetResult(sheet);
                const filled = sheet.lines.filter(
                  (l) => l.deposit > 0 || l.withdrawal > 0
                ).length;
                const s = STATUS_MAP[sheet.status] ?? {
                  label: sheet.status,
                  dot: "var(--text-muted)",
                };
                return (
                  <tr
                    key={sheet.id}
                    onClick={() => router.push(`/sheets/${sheet.id}`)}
                    style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--surface-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "12px 20px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "var(--text)",
                      }}
                    >
                      {sheet.name}
                    </td>
                    <td
                      style={{
                        padding: "12px 20px",
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {new Date(sheet.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: s.dot,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                          {s.label}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 20px",
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {filled} de {sheet.lines.length}
                    </td>
                    <td
                      style={{
                        padding: "12px 20px",
                        textAlign: "right",
                        fontSize: "14px",
                        fontWeight: "600",
                        fontVariantNumeric: "tabular-nums",
                        color: result === 0
                          ? "var(--text-muted)"
                          : result > 0 ? "var(--positive)" : "var(--negative-text)",
                      }}
                    >
                      {result === 0 ? "—" : `${result > 0 ? "+" : "−"}${fmt(result)}`}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Lista — mobile ── */}
      <div className="dash-list">
        {sheets.length === 0 ? (
          <p
            style={{
              padding: "32px 16px",
              textAlign: "center",
              fontSize: "13px",
              color: "var(--text-muted)",
            }}
          >
            Nenhuma planilha encontrada
          </p>
        ) : (
          sheets.slice(0, 5).map((sheet) => {
            const result = calcSheetResult(sheet);
            const filled = sheet.lines.filter(
              (l) => l.deposit > 0 || l.withdrawal > 0
            ).length;
            const s = STATUS_MAP[sheet.status] ?? {
              label: sheet.status,
              dot: "var(--text-muted)",
            };
            return (
              <div
                key={sheet.id}
                onClick={() => router.push(`/sheets/${sheet.id}`)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  minHeight: "64px",
                  gap: "12px",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "var(--text)",
                      marginBottom: "4px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {sheet.name}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {new Date(sheet.created_at).toLocaleDateString("pt-BR")} · {s.label} ·{" "}
                    {filled} de {sheet.lines.length}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    fontVariantNumeric: "tabular-nums",
                    color: result === 0
                      ? "var(--text-muted)"
                      : result > 0 ? "var(--positive)" : "var(--negative-text)",
                    flexShrink: 0,
                  }}
                >
                  {result === 0 ? "—" : `${result > 0 ? "+" : "−"}${fmt(result)}`}
                </span>
              </div>
            );
          })
        )}

        {totalCount > 5 && (
          <button
            onClick={() => router.push("/sheets")}
            style={{
              width: "100%",
              padding: "14px",
              textAlign: "center",
              fontSize: "13px",
              color: "var(--accent)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Ver todas as {totalCount} planilhas →
          </button>
        )}
      </div>

      {/* Nota de rodapé */}
      <div
        style={{
          padding: "10px 20px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{FOOTER_NOTE}</p>
      </div>
    </div>
  );
}
