// ============================================================
// Reglas · errores de regla de negocio
// fallo(mensaje): lanza el error que verá la persona cuando una acción incumple una regla del ERS. Las acciones lo usan y la pantalla lo muestra en un aviso.
// ============================================================

export const fallo = (msg) => {
  throw new Error(msg);
};
