// ============================================================
// Tablas · tabla de datos y línea de tiempo de etapas
// Tabla: columns = [{ key, label, render?(valor, fila) }], rows = filas, onRowClick opcional.
// LineaTiempo: muestra las etapas del proceso y marca la actual (current = índice).
// ============================================================
import { Check } from "lucide-react";

export function Tabla({ columns, rows, onRowClick }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((fila, i) => (
            <tr
              key={fila.id || i}
              className={onRowClick ? "clickable" : ""}
              onClick={() => onRowClick?.(fila)}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(fila[col.key], fila) : fila[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LineaTiempo({ stages, current = 1, piRequired = true }) {
  return (
    <div className="timeline">
      {stages.map((etapa, i) => {
        const hecha = i < current;
        const activa = i === current;
        const noRequerida = etapa === "Vinculación" && !piRequired;
        return (
          <div
            key={etapa}
            className={`timeline-step ${hecha ? "done" : ""} ${activa ? "active" : ""}`}
          >
            <div className="timeline-marker">{hecha ? <Check size={14} /> : i + 1}</div>
            <div className="timeline-copy">
              <strong>{etapa}</strong>
              <span>
                {noRequerida
                  ? "No requerida"
                  : hecha
                    ? "Completada"
                    : activa
                      ? "Etapa actual"
                      : "Pendiente"}
              </span>
            </div>
            {i < stages.length - 1 && <div className="timeline-line" />}
          </div>
        );
      })}
    </div>
  );
}
