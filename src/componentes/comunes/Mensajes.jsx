// ============================================================
// Componentes comunes · notas y avisos
// Nota: recuadro de color (info, aviso, error). Aviso: variante con el estilo original del prototipo.
// ============================================================
import { Info } from "lucide-react";

const IconInfo = Info;

// ---------- Utilidades de pantalla ----------
function Aviso({ tipo = "info", children }) {
  const cls =
    tipo === "error"
      ? "regulatory-warning prominent"
      : tipo === "aviso"
        ? "regulatory-warning"
        : "pi-scope-note";
  return (
    <div className={cls} style={{ margin: "8px 0" }}>
      <Info size={16} />
      <span>{children}</span>
    </div>
  );
}

export function Nota({ tipo = "info", children }) {
  const color = tipo === "error" ? "#9b1c1c" : tipo === "aviso" ? "#8a5a00" : "#0b4f8a";
  const fondo = tipo === "error" ? "#fdecec" : tipo === "aviso" ? "#fff6e0" : "#eaf2fa";
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        background: fondo,
        color,
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 13.5,
        margin: "8px 0",
        lineHeight: 1.45,
      }}
    >
      <IconInfo size={17} style={{ flex: "none", marginTop: 1 }} />
      <div>{children}</div>
    </div>
  );
}
