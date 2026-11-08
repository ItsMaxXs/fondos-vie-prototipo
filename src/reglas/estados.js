// ============================================================
// Reglas · estados de la propuesta
// etapaDe: etapa (0-6) de un estado. esFinal: ¿el estado termina el proceso? tonoEstado: color sugerido para mostrarlo.
// ERS: sección 3.7 (máquina de estados).
// ============================================================
import { ESTADOS, ESTADOS_FINALES } from "../datos/estados.js";

export const etapaDe = (estado) => ESTADOS[estado] ?? 0;

export const esFinal = (p) => ESTADOS_FINALES.includes(p.estado) || p.historico === true;

const tonoEstado = (e) =>
  /Aprobada|Notificada|Avalada|Lista|Emitido/.test(e) && !/No /.test(e)
    ? "primary"
    : /No |Rechazada|Devuelta|observ/i.test(e)
      ? "danger"
      : "neutral";
