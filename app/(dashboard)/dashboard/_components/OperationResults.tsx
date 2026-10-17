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
  calcSheetResult: (sheet: RecentSheet) => number;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Math.abs(v)
  );

export default function OperationResults({ sheets, calcSheetResult }: Props) {
  // Agrupa por nome e soma os resultados
  const grouped: Record<string, { result: number; count: number }> = {};
  for (const sheet of sheets) {
    const r = calcSheetResult(sheet);
    if (!grouped[sheet.name]) grouped[sheet.name] = { result: 0, count: 0 };
    grouped[sheet.name].result += r;
    grouped[sheet.name].count += 1;
  }

  const items = Object.entries(grouped)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.result - a.result);

  const maxAbs = items.length > 0 ? Math.max(...items.map((i) => Math.abs(i.result))) : 1;
  const balance = items.reduce((s, i) => s + i.result, 0);

  return (
    <div
      style={{
        flex: "2 1 280px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "18px",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "6px",
        }}
      >
        <p style={{ fontSize: "15px", fontWeight: "600", color: "var(--text)" }}>
          Resultado por operação
        </p>
        <span
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          Últimas {sheets.length} planilhas · saldo{" "}
          {balance >= 0 ? "+" : "−"}{fmt(balance)}
        </span>
      </div>

      {/* Conteúdo */}
      {items.length === 0 ? (
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            textAlign: "center",
            padding: "40px 0",
            flex: 1,
          }}
        >
          Nenhuma planilha para exibir
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
          {items.map((item) => {
            const isPos = item.result >= 0;
            // Cada lado usa no máximo 47% da largura total, deixando espaço para o eixo
            const barPct = (Math.abs(item.result) / maxAbs) * 47;

            return (
              <div key={item.name} className="op-item">
                {/* Nome */}
                <div className="op-item-label">
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.name}
                  </p>
                  {item.count > 1 && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        marginTop: "1px",
                      }}
                    >
                      {item.count} planilhas
                    </p>
                  )}
                </div>

                {/* Barra divergente */}
                <div className="op-item-bar">
                  {/* Eixo zero central */}
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "3px",
                      bottom: "3px",
                      width: "1px",
                      background: "var(--border)",
                    }}
                  />
                  {isPos ? (
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translateY(-50%)",
                        height: "8px",
                        width: `${barPct}%`,
                        background: "var(--positive)",
                        borderRadius: "0 3px 3px 0",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: "absolute",
                        right: "50%",
                        top: "50%",
                        transform: "translateY(-50%)",
                        height: "8px",
                        width: `${barPct}%`,
                        background: "var(--negative-bar)",
                        borderRadius: "3px 0 0 3px",
                      }}
                    />
                  )}
                </div>

                {/* Valor */}
                <div className="op-item-value">
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      fontVariantNumeric: "tabular-nums",
                      color: isPos ? "var(--positive)" : "var(--negative-text)",
                    }}
                  >
                    {isPos ? "+" : "−"}{fmt(item.result)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Nota de rodapé */}
      <p
        style={{
          fontSize: "12px",
          color: "var(--text-muted)",
          marginTop: "16px",
          paddingTop: "12px",
          borderTop: "1px solid var(--border)",
        }}
      >
        Valores por planilha não incluem custos, que são descontados no lucro líquido.
      </p>
    </div>
  );
}
