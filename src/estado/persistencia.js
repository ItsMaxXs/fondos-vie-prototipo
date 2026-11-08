// ============================================================
// Estado · guardado en el navegador
// Lee y escribe la base y la sesión en localStorage. Si no hay base guardada crea la inicial.
// Para reiniciar la demo: Administración → Sistema → Restablecer.
// ============================================================
import { dbInicial } from "../datos/semilla.js";

export const DB_KEY = "vie-ers-v1";

export const SESSION_KEY = "vie-ers-session";

// ---------- Persistencia ----------
export function cargarBase() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && d.version === 1) return d;
    }
  } catch (e) {}
  return dbInicial();
}

export function guardarBase(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {}
}

export const leerSesion = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch (e) {
    return null;
  }
};
