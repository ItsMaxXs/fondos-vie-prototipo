// ============================================================
// Reglas · informes pendientes (morosidad)
// buscarMoroso: ¿la persona tiene informes pendientes? equipoMorosos: quiénes del equipo. recalcularMorosidad: actualiza las propuestas en trámite.
// ERS: CU-15 (RF-MOR-01 a RF-MOR-06).
// ============================================================
import { esFinal } from "./estados.js";
import { norm } from "./formulario.js";

// ---------- Personas con informes pendientes (CU-15) ----------
export function buscarMoroso(db, persona) {
  const n = norm(persona.nombre);
  const ced = String(persona.cedula || "").replace(/\D/g, "");
  return (db.morosos || []).find(
    (m) =>
      m.estado === "Pendiente" &&
      ((n && norm(m.nombre) === n) || (ced && String(m.cedula || "").replace(/\D/g, "") === ced)),
  );
}

export const equipoMorosos = (d, f) =>
  (f.equipo || [])
    .map((p) => ({ p, m: buscarMoroso(d, p) }))
    .filter((x) => x.m)
    .map((x) => x.p.nombre);

export function recalcularMorosidad(d) {
  d.proposals.forEach((p) => {
    if (p.historico || !p.form || esFinal(p)) return;
    p.morosidad = equipoMorosos(d, p.form);
  });
}
