// ============================================================
// Datos · descripción de permisos por rol
// PERMISOS: texto que explica qué puede hacer cada rol (tabla de Administración → Roles).
// ERS: RF-USR-06, RF-USR-07.
// ============================================================

// ---------- Administración ----------
export const PERMISOS = {
  vie_publicacion: "Crea, edita y publica convocatorias; ajusta el cronograma.",
  investigador:
    "Formula, guarda y envía propuestas; atiende devoluciones y observaciones; carga la carta de aceptación.",
  vinculacion: "Emite el dictamen de propiedad intelectual de las propuestas que lo requieren.",
  comite_asistente:
    "Revisa la completitud, devuelve o envía a evaluación, reabre evaluaciones, consolida y envía al Consejo.",
  comite_evaluador:
    "Evalúa de forma independiente con la rúbrica y firma el documento del Comité. No ve las notas de otras personas.",
  consejo_asistente:
    "Registra sesiones y consultas, abre la votación y registra los avales y acuerdos.",
  consejo:
    "Vota en consultas formales (voto secreto). Quien preside cierra la votación y tiene voto doble en empate.",
  direccion_escuela: "Comunica el aval a la VIE con el memorando y el acuerdo.",
  gestora_vie:
    "Confirma la recepción, verifica el expediente, observa, envía al CIE y consulta reportes.",
  cie: "Abre el expediente, usa la rúbrica de apoyo y emite la resolución.",
  direccion_investigacion:
    "Emite el dictamen institucional, notifica la resolución y administra las personas con informes pendientes.",
  admin:
    "Administra usuarios, comités, parámetros, rúbricas y catálogos; consulta todo y puede operar como otro rol con registro en la bitácora.",
};
