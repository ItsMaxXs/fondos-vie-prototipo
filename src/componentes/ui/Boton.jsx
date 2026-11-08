// ============================================================
// Boton · botón de la aplicación
// Variantes: primary, secondary, ghost, danger (ver estilos/componentes.css, clases .btn-*).
// Uso:  <Boton variant="secondary" icon={Plus} onClick={...}>Texto</Boton>
// ============================================================
export function Boton({ children, variant = "primary", icon: Icono, className = "", ...resto }) {
  return (
    <button className={`btn btn-${variant} ${className}`.trim()} {...resto}>
      {Icono && <Icono size={17} strokeWidth={2} />}
      <span>{children}</span>
    </button>
  );
}
