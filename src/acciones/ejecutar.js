// ============================================================
// Acciones · ejecución de una acción
// ejecutarAccion(db, nombre, payload, ctx): copia la base, ejecuta ACCIONES[nombre] y devuelve { db, msg } o { db, error }. Todas las pantallas llaman a las acciones a través de esta función (act en el contexto).
// ============================================================
import { ACCIONES } from "./index.js";
import { fallo } from "../reglas/errores.js";
import { clone } from "../utilidades/ids.js";

// Ejecuta una acción sobre una copia de la base y devuelve { db, msg, error }
export function ejecutarAccion(db, nombre, payload, ctx) {
  const d = clone(db);
  const c = { ...ctx, ahora: db.clock };
  try {
    const f = ACCIONES[nombre] || fallo(`Acción desconocida: ${nombre}`);
    const msg = f(d, payload || {}, c);
    return { db: d, msg, resultado: c.resultado };
  } catch (e) {
    return { db, error: e.message };
  }
}
