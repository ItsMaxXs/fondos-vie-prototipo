// ============================================================
// Caja y Estadistica · contenedores visuales
// Caja: tarjeta blanca con borde (clase .card).
// Estadistica: tarjeta con un número grande, una etiqueta y una nota opcional.
// ============================================================
export function Caja({ children, className = "", interactive = false, ...resto }) {
  return (
    <section
      className={`card ${interactive ? "card-interactive" : ""} ${className}`.trim()}
      {...resto}
    >
      {children}
    </section>
  );
}

export function Estadistica({ label, value, hint }) {
  return (
    <Caja className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </Caja>
  );
}
