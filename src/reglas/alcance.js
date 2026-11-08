// ============================================================
// Reglas · qué ve y qué le toca a cada rol
// instanciasDe / alcanza: instancias del usuario y si una propuesta cae en su alcance. visiblesPara: expedientes que puede ver. pendienteDe: los que esperan una acción suya.
// También: roles de una persona y persona efectiva al cambiar de rol.
// ERS: RF-USR-06 a RF-USR-11.
// ============================================================
import { esFinal, etapaDe } from "./estados.js";
import { norm } from "./formulario.js";

export const rolesDeUsuario = (u) => [...new Set(u.roles.map((r) => r.rol))];

const rolDeUsuario = (u, rol) => u.roles.find((r) => r.rol === rol);

export function usuarioEfectivo(db, real, rol) {
  if (rol === "admin" || real.roles.some((r) => r.rol === rol)) return real;
  return db.users.find((u) => u.estado === "Activo" && u.roles.some((r) => r.rol === rol)) || real;
}

export const nombreInstancia = (db, id) => db.instancias.find((i) => i.id === id)?.nombre || id;

// ---------- Qué le toca hacer a cada rol (bandeja) ----------
function instanciasDe(u, rol) {
  const r = u.roles.filter((x) => x.rol === rol);
  return r.map((x) => x.instancia).filter(Boolean);
}

function alcanza(u, rol, p) {
  // El Comité, el Consejo y la Dirección de Escuela solo ven propuestas de su instancia
  if (
    ![
      "comite_asistente",
      "comite_evaluador",
      "consejo_asistente",
      "consejo",
      "direccion_escuela",
    ].includes(rol)
  )
    return true;
  const ins = instanciasDe(u, rol);
  if (!ins.length) return true;
  const todas = [p.instancia, ...(p.form?.participantes || [])];
  return rol.startsWith("comite") ? ins.includes(p.instancia) : todas.some((i) => ins.includes(i));
}

export function pendienteDe(db, u, rol, p) {
  if (p.historico) return false;
  const e = p.estado;
  switch (rol) {
    case "investigador":
      return (
        p.coordinadorId === u.id &&
        (["Borrador", "Devuelta por faltantes", "Con observaciones"].includes(e) ||
          (p.carta?.requerida && !p.carta.recibida && e === "Notificada"))
      );
    case "vinculacion":
      return e === "Pendiente de dictamen PI";
    case "comite_asistente":
      return (
        alcanza(u, rol, p) &&
        (e === "En revisión de completitud" ||
          e === "Evaluada" ||
          (e === "En evaluación" && p.evaluaciones?.every((x) => x.estado === "Finalizada")))
      );
    case "comite_evaluador":
      return (
        alcanza(u, rol, p) &&
        ((e === "En evaluación" &&
          p.evaluaciones?.some((x) => x.evaluadorId === u.id && x.estado !== "Finalizada")) ||
          (e === "Evaluada" &&
            p.consolidacion &&
            !p.consolidacion.firmas[u.id] &&
            p.evaluaciones?.some((x) => x.evaluadorId === u.id)))
      );
    case "consejo_asistente":
      return (
        alcanza(u, rol, p) && (e === "No recomendada por el Comité" || e === "En trámite de aval")
      );
    case "consejo": {
      if (!alcanza(u, rol, p)) return false;
      const c = p.consejo?.consulta;
      const pres = u.roles.some((r) => r.rol === "consejo" && r.preside);
      return (
        e === "En trámite de aval" &&
        c &&
        ((c.abierta && !c.votaron.includes(u.id)) ||
          (!c.abierta && c.cerrada === undefined) ||
          (pres && c.abierta))
      );
    }
    case "direccion_escuela":
      return alcanza(u, rol, p) && e === "Avalada";
    case "gestora_vie":
      return (
        ["Comunicada a la VIE", "En revisión VIE"].includes(e) ||
        (e === "Borrador" && !p.vencida && false)
      );
    case "cie":
      return ["Lista para CIE", "En resolución"].includes(e);
    case "direccion_investigacion":
      return (
        (["En revisión VIE", "Con observaciones"].includes(e) && !p.vie?.dictamenDI?.emitido) ||
        ["Aprobada", "Aprobada con condiciones", "Rechazada"].includes(e) ||
        (p.carta?.recibida && !p.carta.confirmada)
      );
    default:
      return !esFinal(p);
  }
}

export function visiblesPara(db, u, rol) {
  const todas = db.proposals.filter((p) => !p.historico || false);
  if (rol === "investigador")
    return todas.filter(
      (p) =>
        p.coordinadorId === u.id ||
        (p.form?.equipo || []).some((x) => norm(x.nombre) === norm(u.nombre)),
    );
  if (["comite_asistente", "comite_evaluador"].includes(rol))
    return todas.filter(
      (p) =>
        alcanza(u, rol, p) &&
        !["Borrador"].includes(p.estado) &&
        (rol !== "comite_evaluador" ||
          p.evaluaciones?.some((e) => e.evaluadorId === u.id) ||
          p.estado === "En revisión de completitud"),
    );
  if (["consejo_asistente", "consejo", "direccion_escuela"].includes(rol))
    return todas.filter(
      (p) => alcanza(u, rol, p) && etapaDe(p.estado) >= 2 && p.estado !== "Borrador",
    );
  if (rol === "vinculacion") return todas.filter((p) => p.pi && p.pi.estado !== "No requerido");
  if (["gestora_vie", "direccion_investigacion", "cie"].includes(rol))
    return todas.filter(
      (p) => p.estado !== "Borrador" && (rol === "cie" ? etapaDe(p.estado) >= 4 : true),
    );
  return todas;
}
