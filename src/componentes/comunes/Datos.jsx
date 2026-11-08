// ============================================================
// Componentes comunes · datos de solo lectura
// Dato: pareja título-valor. Parrafo: bloque de texto largo con título.
// ============================================================

// ---------- Resumen de contenido del formulario ----------
export function Dato({ k, v }) {
  return (
    <div>
      <span>{k}</span>
      <strong style={{ fontWeight: 600 }}>{v || "—"}</strong>
    </div>
  );
}

export function Parrafo({ titulo, texto }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12.5, opacity: 0.7, marginBottom: 2 }}>{titulo}</div>
      <div style={{ whiteSpace: "pre-wrap", fontSize: 14.5, lineHeight: 1.5 }}>{texto || "—"}</div>
    </div>
  );
}
