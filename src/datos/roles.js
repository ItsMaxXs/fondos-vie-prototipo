// ============================================================
// Datos · roles del sistema
// ROLES: los 12 roles (id, nombre largo y corto). ROL_NOMBRE / ROL_CORTO: búsquedas rápidas por id.
// ERS: CU-01, CU-17 (RF-USR-06 a RF-USR-11).
// ============================================================

export const ROLES = [
  { id: "vie_publicacion", label: "VIE — Publicación", short: "VIE" },
  { id: "investigador", label: "Persona Investigadora Coordinadora", short: "Investigador" },
  { id: "vinculacion", label: "Centro de Vinculación", short: "Vinculación" },
  { id: "comite_asistente", label: "Asistente del Comité Técnico", short: "Asistente Comité" },
  {
    id: "comite_evaluador",
    label: "Cuerpo Evaluador del Comité Técnico",
    short: "Evaluador Comité",
  },
  {
    id: "consejo_asistente",
    label: "Asistente del Consejo de Escuela",
    short: "Asistente Consejo",
  },
  { id: "consejo", label: "Consejo de Profesores", short: "Consejo" },
  { id: "direccion_escuela", label: "Dirección de Escuela", short: "Dirección Escuela" },
  { id: "gestora_vie", label: "Persona Gestora VIE", short: "Gestora VIE" },
  { id: "cie", label: "Consejo de Investigación y Extensión (CIE)", short: "CIE" },
  {
    id: "direccion_investigacion",
    label: "Dirección de Investigación",
    short: "Dirección Investigación",
  },
  { id: "admin", label: "Super Administrador", short: "Super Admin" },
];

// ---------- Roles ----------
// (vr es la lista de roles del prototipo original; aquí se agregan los textos de ayuda)
export const ROL_NOMBRE = Object.fromEntries(ROLES.map((r) => [r.id, r.label]));

export const ROL_CORTO = Object.fromEntries(ROLES.map((r) => [r.id, r.short]));
