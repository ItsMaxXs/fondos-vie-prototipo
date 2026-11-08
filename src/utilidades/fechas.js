// ============================================================
// Utilidades · fechas
// Formato de fechas en español y cálculos de días y meses. El reloj simulado de la aplicación usa estas funciones.
// ============================================================
import { pad } from "./formato.js";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export const fechaCorta = (iso) => {
  if (!iso) return "—";
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00` : iso);
  if (isNaN(d)) return String(iso);
  return `${pad(d.getDate(), 2)} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
};

export const fechaHora = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return String(iso);
  return `${fechaCorta(iso)}, ${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}`;
};

export const diasEntre = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

export const mesesEntre = (a, b) => {
  const x = new Date(a),
    y = new Date(b);
  return (y.getFullYear() - x.getFullYear()) * 12 + (y.getMonth() - x.getMonth()) + 1;
};

export const sumarDias = (iso, n) => {
  const d = new Date(iso.slice(0, 16) + ":00");
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${pad(d.getDate(), 2)}T${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}`;
};

// Cuenta regresiva a una fecha (días)
export const diasHasta = (ahora, iso) => diasEntre(ahora.slice(0, 10), String(iso).slice(0, 10));
