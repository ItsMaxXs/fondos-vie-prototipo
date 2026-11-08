// ============================================================
// Componentes comunes · campo con etiqueta
// Campo: envuelve un control con su etiqueta, ayuda y error.
// ============================================================
import { GrupoCampo } from "../ui/Campos.jsx";

export function Campo({ label, hint, error, children }) {
  return (
    <GrupoCampo label={label} hint={hint} error={error}>
      {children}
    </GrupoCampo>
  );
}
