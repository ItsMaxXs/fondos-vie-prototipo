// ============================================================
// Datos · modalidades de proyecto
// Las 5 modalidades de la convocatoria. esFort / esDT identifican fortalecimiento y desarrollo tecnológico, que tienen reglas propias.
// ERS: RF-CON-06, RF-FOR-02.
// ============================================================

// ---------- Parámetros normativos por defecto (RF-CON-06, RF-CON-11) ----------
export const MODALIDADES = [
  "Actividad de fortalecimiento",
  "Investigación básica",
  "Investigación aplicada",
  "Investigación básica y aplicada",
  "Desarrollo tecnológico",
];

export const esFort = (m) => m === "Actividad de fortalecimiento";

export const esDT = (m) => m === "Desarrollo tecnológico";
