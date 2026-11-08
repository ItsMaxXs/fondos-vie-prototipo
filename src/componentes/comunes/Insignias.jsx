// ============================================================
// Componentes comunes · insignias
// Insignia: etiqueta de color. EstadoInsignia: elige el color según el estado de la propuesta.
// ============================================================

export function Insignia({ tono = "neutral", children }) {
  const m = {
    primary: ["#e4effa", "#0b4f8a"],
    danger: ["#fdecec", "#9b1c1c"],
    warning: ["#fff3d6", "#8a5a00"],
    success: ["#e3f5ea", "#17653a"],
    neutral: ["#eceff3", "#46515e"],
  }[tono] || ["#eceff3", "#46515e"];
  return (
    <span
      style={{
        background: m[0],
        color: m[1],
        borderRadius: 999,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export const EstadoInsignia = ({ estado }) => (
  <Insignia
    tono={
      /No |Rechazada|Devuelta|observ/i.test(estado)
        ? "danger"
        : /Aprobada|Notificada|Avalada|Lista/.test(estado)
          ? "success"
          : /Pendiente|Borrador/.test(estado)
            ? "warning"
            : "primary"
    }
  >
    {estado}
  </Insignia>
);
