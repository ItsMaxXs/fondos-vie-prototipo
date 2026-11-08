// ============================================================
// Utilidades · formato de números y textos
// num: convierte texto a número. colones: formatea ₡. pad: rellena con ceros. palabras/lineas: cuentan palabras y líneas (límites del formulario). esc: escapa HTML.
// ============================================================

export const num = (x) => Number(String(x ?? "").replace(/[^\d.-]/g, "")) || 0;

export const colones = (x) =>
  `₡${new Intl.NumberFormat("es-CR").format(Math.round(Number(x || 0)))}`;

export const pad = (n, l = 3) => String(n).padStart(l, "0");

export const palabras = (s) => (String(s || "").trim() ? String(s).trim().split(/\s+/).length : 0);

export const lineas = (s) =>
  String(s || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

export const esc = (s) =>
  String(s ?? "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
