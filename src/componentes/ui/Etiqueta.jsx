// ============================================================
// Etiqueta · "badge" pequeño de color (neutral, primary, success, warning, danger)
// ============================================================
export function Etiqueta({ children, tone = "neutral" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
