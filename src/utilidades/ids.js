// ============================================================
// Utilidades · identificadores y copias
// uid: genera un id único con prefijo. clone: copia profunda de un objeto (se usa en cada acción para no modificar la base original).
// ============================================================

// ---------- Utilidades generales ----------
export const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 9)}`;

export const clone = (x) => JSON.parse(JSON.stringify(x));
