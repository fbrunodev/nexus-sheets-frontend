function Bone({
  w = "100%",
  h = "14px",
  r = "6px",
  mt = "0",
}: {
  w?: string;
  h?: string;
  r?: string;
  mt?: string;
}) {
  return (
    <div
      className="skeleton"
      style={{ width: w, height: h, borderRadius: r, marginTop: mt }}
    />
  );
}

export function KpiStripSkeleton() {
  return (
    <div
      className="kpi-strip"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        marginBottom: "16px",
      }}
    >
      <div className="kpi-col-main">
        <Bone w="70px" h="13px" />
        <Bone w="180px" h="40px" r="8px" mt="12px" />
      </div>
      <div className="kpi-col kpi-col-avg">
        <Bone w="70px" h="13px" />
        <Bone w="110px" h="24px" r="6px" mt="12px" />
      </div>
      <div className="kpi-col kpi-col-sheets">
        <Bone w="70px" h="13px" />
        <Bone w="50px" h="24px" r="6px" mt="12px" />
        <Bone w="100%" h="4px" r="2px" mt="12px" />
        <Bone w="140px" h="12px" mt="8px" />
      </div>
      <div className="kpi-col kpi-col-profit">
        <Bone w="70px" h="13px" />
        <Bone w="60px" h="24px" r="6px" mt="12px" />
        <Bone w="100px" h="12px" mt="8px" />
      </div>
    </div>
  );
}

export function ChartsSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "16px",
      }}
    >
      {/* OperationResults skeleton */}
      <div
        style={{
          flex: "2 1 280px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "18px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <Bone w="160px" h="15px" />
          <Bone w="120px" h="12px" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}
          >
            <Bone w="110px" h="13px" />
            <div style={{ flex: 1 }}>
              <Bone w="60%" h="8px" r="3px" />
            </div>
            <Bone w="80px" h="13px" />
          </div>
        ))}
      </div>

      {/* CostBreakdown skeleton */}
      <div
        style={{
          flex: "1 1 200px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "18px",
        }}
      >
        <Bone w="60px" h="15px" />
        <Bone w="80px" h="13px" mt="16px" />
        <Bone w="130px" h="24px" r="6px" mt="8px" />
        <Bone w="100%" h="10px" r="5px" mt="16px" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}
          >
            <Bone w="8px" h="8px" r="2px" />
            <div style={{ flex: 1 }}>
              <Bone h="13px" />
            </div>
            <Bone w="60px" h="13px" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecentSheetsSkeleton() {
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
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <Bone w="140px" h="15px" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "16px",
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 2 }}>
            <Bone h="14px" />
          </div>
          <Bone w="70px" h="13px" />
          <Bone w="90px" h="13px" />
          <Bone w="60px" h="13px" />
          <Bone w="80px" h="14px" />
        </div>
      ))}
      <div style={{ padding: "10px 20px", borderTop: "1px solid var(--border)" }}>
        <Bone w="300px" h="12px" />
      </div>
    </div>
  );
}
