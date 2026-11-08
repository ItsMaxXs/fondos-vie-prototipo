// ============================================================
// Ventanas · ventana modal y aviso flotante
// Ventana: diálogo centrado; se cierra con la X o al hacer clic fuera.
// AvisoFlotante: mensaje corto abajo a la derecha (lo usa toast() de la aplicación).
// ============================================================
import { Check, X } from "lucide-react";

export function Ventana({ open, title, description, children, footer, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={19} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function AvisoFlotante({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="toast">
      <Check size={18} />
      <span>{message}</span>
      <button onClick={onClose} aria-label="Cerrar">
        <X size={16} />
      </button>
    </div>
  );
}
