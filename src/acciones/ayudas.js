// ============================================================
// Acciones · funciones de apoyo
// requiere: valida el rol de quien ejecuta la acción. exigirRecepcion: bloquea si la recepción cerró.
// bit: registra en la bitácora. evento: cambia el estado y deja la línea de tiempo. notificar: crea notificaciones y correos simulados.
// sincronizarResumen / nuevaVersion: mantienen el resumen y las versiones de la propuesta.
// ERS: RF-ADM-04 (bitácora), RF-NOT-01 a RF-NOT-05, RF-FOR-46.
// ============================================================
import { ROL_CORTO } from "../datos/roles.js";
import { nombreInstancia } from "../reglas/alcance.js";
import { paramsDe, requierePI, usuarioPorId } from "../reglas/consultas.js";
import { fallo } from "../reglas/errores.js";
import { etapaDe } from "../reglas/estados.js";
import { presupuestoTexto } from "../reglas/presupuesto.js";
import { cierreRecepcion, recepcionAbierta } from "../reglas/recepcion.js";
import { fechaHora } from "../utilidades/fechas.js";
import { clone, uid } from "../utilidades/ids.js";
import { textos as T } from "../textos/acciones/ayudas.js";

export function requiere(ctx, roles) {
  if (ctx.sistema) return;
  if (!roles.includes(ctx.rol) && ctx.rol !== "admin") fallo(T.suRolNoTienePermiso);
}

export const exigirRecepcion = (d, convId, ahora) => {
  if (!recepcionAbierta(d, convId, ahora)) {
    const cierre = cierreRecepcion(d, convId);
    fallo(
      `El período de recepción de propuestas cerró el ${fechaHora(cierre)}. Pasada la fecha límite no se admiten propuestas nuevas, ediciones ni documentos adicionales.`,
    );
  }
};

// ---- Bitácora, actividad del expediente y notificaciones ----
export function bit(d, ctx, accion, propId, anterior, nuevo) {
  d.bitacora.push({
    id: uid("b"),
    fecha: ctx.ahora,
    usuario: ctx.real?.nombre || ctx.user?.nombre || "Sistema",
    rol: ctx.rol || "sistema",
    enNombreDe:
      ctx.real && ctx.user && ctx.real.id !== ctx.user.id
        ? `${ctx.user.nombre} (${ROL_CORTO[ctx.rol] || ctx.rol})`
        : "",
    accion,
    propId: propId || "",
    anterior:
      anterior === undefined
        ? ""
        : typeof anterior === "string"
          ? anterior
          : JSON.stringify(anterior),
    nuevo: nuevo === undefined ? "" : typeof nuevo === "string" ? nuevo : JSON.stringify(nuevo),
  });
}

export function evento(d, p, ctx, titulo, detalle, estadoNuevo) {
  const anterior = p.estado;
  if (estadoNuevo && estadoNuevo !== p.estado) {
    p.estado = estadoNuevo;
    p.etapa = etapaDe(estadoNuevo);
    p.historialEstados = [...(p.historialEstados || []), { estado: estadoNuevo, fecha: ctx.ahora }];
  }
  p.timeline = [
    ...(p.timeline || []),
    { fecha: ctx.ahora, titulo, detalle, por: ctx.user?.nombre || "Sistema" },
  ];
  bit(
    d,
    ctx,
    titulo,
    p.id,
    anterior !== p.estado ? anterior : undefined,
    anterior !== p.estado ? p.estado : undefined,
  );
}

function destinatarios(d, destinos, instancia) {
  const ids = new Set();
  destinos.forEach((x) => {
    if (typeof x === "string" && x.startsWith("u_")) ids.add(x);
    else if (typeof x === "string")
      d.users
        .filter(
          (u) =>
            u.estado === "Activo" &&
            u.roles.some(
              (r) => r.rol === x && (!instancia || !r.instancia || r.instancia === instancia),
            ),
        )
        .forEach((u) => ids.add(u.id));
  });
  return [...ids];
}

export function notificar(d, ctx, destinos, titulo, detalle, propId, instancia) {
  destinatarios(d, destinos, instancia).forEach((uidDest) => {
    d.notifications.unshift({
      id: uid("n"),
      userId: uidDest,
      titulo,
      detalle,
      fecha: ctx.ahora,
      propId: propId || "",
      leida: false,
    });
    const u = usuarioPorId(d, uidDest);
    d.correos.unshift({
      id: uid("c"),
      fecha: ctx.ahora,
      para: u?.email || "",
      asunto: titulo,
      resultado: "Enviado",
    });
  });
}

export function sincronizarResumen(p, d) {
  const f = p.form;
  p.titulo = f.titulo;
  p.modalidad = f.modalidad;
  p.escuela = nombreInstancia(d, f.instancia);
  p.instancia = f.instancia;
  p.presupuesto = presupuestoTexto(f, paramsDe(d, p.convocatoriaId));
  p.piRequired = requierePI(f);
}

export function nuevaVersion(p, ctx, motivo) {
  const n = (p.versiones?.length || 0) + 1;
  p.versiones = [
    ...(p.versiones || []),
    { n, fecha: ctx.ahora, motivo, por: ctx.user?.nombre, form: clone(p.form) },
  ];
  return n;
}
