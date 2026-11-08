// ============================================================
// Componentes comunes · estado vacío
// Mensaje con ícono cuando una lista no tiene elementos.
// ============================================================
import { MessageSquareText } from "lucide-react";

export function Vacio({ titulo, texto }) {
  return (
    <div className="empty-state small">
      <MessageSquareText size={28} />
      <strong>{titulo}</strong>
      <span>{texto}</span>
    </div>
  );
}
