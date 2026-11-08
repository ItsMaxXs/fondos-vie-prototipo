// ============================================================
// Datos · cronograma de la convocatoria
// CRONOGRAMA_2027: etapas con responsable y fechas. ETAPA_FORMULACION: nombre de la etapa que controla el cierre de recepción.
// ERS: RF-CON-03, RF-CON-04, RF-CON-10.
// ============================================================

// ---------- Cronograma (Disposiciones, sección 6) ----------
export const CRONOGRAMA_2027 = [
  [
    "Comunicación de la convocatoria",
    "Vicerrectoría de Investigación y Extensión",
    "2026-07-20",
    "2026-07-27",
  ],
  ["Período de formulación de propuestas", "Grupo investigador", "2026-07-28", "2026-08-21"],
  ["Revisión por el Centro de Vinculación", "Centro de Vinculación", "2026-08-24", "2026-08-28"],
  ["Evaluación por el Comité Técnico", "Comité Técnico", "2026-08-31", "2026-09-11"],
  ["Aval de propuestas y emisión de acuerdos", "Instancia académica", "2026-09-14", "2026-09-25"],
  ["Recepción de propuestas en Orión", "Persona coordinadora", "2026-09-28", "2026-09-28"],
  ["Elaboración de dictamen", "Dirección de Investigación", "2026-09-29", "2026-10-12"],
  [
    "Análisis y resolución de nuevas propuestas",
    "Consejo de Investigación y Extensión",
    "2026-10-13",
    "2026-10-23",
  ],
  ["Comunicación de acuerdos", "Consejo de Investigación y Extensión", "2026-10-26", "2026-10-30"],
  [
    "Remisión de carta de aceptación de condiciones",
    "Persona coordinadora",
    "2026-11-02",
    "2026-11-06",
  ],
  ["Inicio de actividades", "Persona investigadora", "2027-01-01", "2027-01-01"],
].map(([etapa, responsable, inicio, fin], i) => ({
  id: `E${i + 1}`,
  etapa,
  responsable,
  inicio,
  fin,
}));

export const ETAPA_FORMULACION = "Período de formulación de propuestas";
