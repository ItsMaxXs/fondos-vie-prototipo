// ============================================================
// Encabezados · títulos de página, títulos de sección y migas de pan
// ============================================================
import { Fragment } from "react";
import { ChevronRight } from "lucide-react";

// Título grande al inicio de cada pantalla (con acciones opcionales a la derecha)
export function EncabezadoPagina({ eyebrow, title, description, actions }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

// Título de una sección dentro de una pantalla
export function TituloSeccion({ title, description, action }) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

// Migas de pan: recibe una lista de textos
export function Migas({ items = [] }) {
  return (
    <nav className="breadcrumbs" aria-label="Migas de pan">
      {items.map((item, i) => (
        <Fragment key={item}>
          <span>{item}</span>
          {i < items.length - 1 && <ChevronRight size={14} />}
        </Fragment>
      ))}
    </nav>
  );
}
