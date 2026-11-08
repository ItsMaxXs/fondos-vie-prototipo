// ============================================================
// Reglas · período de recepción
// cierreRecepcion: fecha y hora límite. recepcionAbierta: ¿se pueden enviar o editar propuestas ahora?
// ERS: RF-CON-10, RF-FOR-48.
// ============================================================
import { ETAPA_FORMULACION } from "../datos/cronograma.js";
import { convDe } from "./consultas.js";

export function cierreRecepcion(d, convId) {
  const c = convDe(d, convId);
  const e = c?.cronograma.find((x) => x.etapa === ETAPA_FORMULACION);
  return e ? `${e.fin}T23:59:59` : null;
}

export const recepcionAbierta = (d, convId, ahora) => {
  const c = convDe(d, convId);
  if (!c || c.estado !== "Publicada") return false;
  const ap = c.cronograma.find((x) => x.etapa === ETAPA_FORMULACION)?.inicio;
  const cierre = cierreRecepcion(d, convId);
  return (!ap || ahora >= `${ap}T00:00:00`) && (!cierre || ahora <= cierre);
};
