// ============================================================
// Componentes comunes · pestañas
// Pestanas: barra de pestañas con contador opcional. items = [[clave, texto, contador]].
// ============================================================

export function Pestanas({ valor, onChange, items }) {
  return (
    <div className="tabs">
      {items.map(([k, t_, n]) => (
        <button key={k} className={valor === k ? "active" : ""} onClick={() => onChange(k)}>
          {t_}
          {n !== undefined && n !== null ? ` (${n})` : ""}
        </button>
      ))}
    </div>
  );
}
