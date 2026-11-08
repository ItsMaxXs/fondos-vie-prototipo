// ============================================================
// Reglas · búsquedas en la base
// Funciones cortas para encontrar una propuesta, convocatoria, usuario o los parámetros de una convocatoria.
// requierePI: ¿la propuesta necesita dictamen de propiedad intelectual?
// ============================================================
import { esDT } from "../datos/modalidades.js";
import { PARAMS_2027 } from "../datos/parametros.js";
import { fallo } from "./errores.js";

export const propDe = (d, id) =>
  d.proposals.find((x) => x.id === id) || fallo("No se encontró la propuesta.");

export const convDe = (d, id) => d.convocatorias.find((c) => c.id === id);

export const paramsDe = (d, convId) => d.params[convId] || PARAMS_2027;

export const usuarioPorId = (d, id) => d.users.find((u) => u.id === id);

export const nombreUsuario = (d, id) => usuarioPorId(d, id)?.nombre || "—";

// ---- Utilidades de propuesta ----
export const requierePI = (f) => esDT(f.modalidad) || f.q.pi.r === "Sí";
