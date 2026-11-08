// ============================================================
// Datos · estados y etapas de una propuesta
// ESTADOS: estados posibles y la etapa a la que pertenecen (ERS sección 3.7). ETAPAS: las 7 etapas que muestra la línea de tiempo.
// ESTADOS_FINALES: estados en los que el proceso termina.
// ============================================================

// ---------- Estados de la propuesta (ERS 3.7) ----------
// etapa visible (0..6): Formulación, Vinculación, Comité Técnico, Consejo, VIE, CIE, Resolución
export const ESTADOS = {
  Borrador: 0,
  Enviada: 1,
  "Pendiente de dictamen PI": 1,
  "En revisión de completitud": 2,
  "Devuelta por faltantes": 0,
  "No admitida": 6,
  "Lista para evaluación": 2,
  "En evaluación": 2,
  Evaluada: 2,
  "No recomendada por el Comité": 2,
  "En trámite de aval": 3,
  "No avalada": 6,
  Avalada: 3,
  "Comunicada a la VIE": 4,
  "En revisión VIE": 4,
  "Con observaciones": 4,
  "Lista para CIE": 5,
  "En resolución": 5,
  Aprobada: 6,
  "Aprobada con condiciones": 6,
  Rechazada: 6,
  Notificada: 6,
};

export const ESTADOS_FINALES = ["No admitida", "No avalada", "Notificada"];

export const ETAPAS = [
  "Formulación",
  "Vinculación",
  "Comité Técnico",
  "Consejo de Escuela",
  "VIE",
  "CIE",
  "Resolución",
];
