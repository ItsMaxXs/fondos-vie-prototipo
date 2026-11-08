// ============================================================
// Acciones · Reloj de demostración, consultas y notificaciones leídas
// Casos de uso del ERS: CU-18, RF-NOT.
// Acciones incluidas: fijarReloj, registrarConsulta, marcarLeida, marcarTodasLeidas.
// Cada acción recibe (d, p, ctx): d = copia de la base, p = datos enviados por la pantalla, ctx = usuario, rol y hora. Si incumple una regla lanza fallo("mensaje").
// ============================================================
import { bit, requiere } from "./ayudas.js";
import { avanzarTiempo } from "./tiempo.js";
import { fechaHora } from "../utilidades/fechas.js";
import { textos as T } from "../textos/acciones/sistema.js";

export const accionesSistema = {
  fijarReloj(d, p, ctx) {
    requiere(ctx, ["admin"]);
    d.clock = p.iso;
    ctx.ahora = p.iso;
    bit(d, ctx, T.fechaDeDemostracionModificada, "", undefined, p.iso);
    avanzarTiempo(d, ctx);
    return `Fecha simulada: ${fechaHora(p.iso)}.`;
  },
  registrarConsulta(d, p, ctx) {
    bit(d, ctx, p.accion || T.consultaDeExpediente, p.id || "", undefined, p.detalle || "");
    return "";
  },
  marcarLeida(d, p, ctx) {
    const n = d.notifications.find((x) => x.id === p.id);
    if (n) n.leida = true;
    return "";
  },
  marcarTodasLeidas(d, p, ctx) {
    d.notifications.filter((n) => n.userId === ctx.user.id).forEach((n) => (n.leida = true));
    return T.todasLasNotificacionesQuedaronComo;
  },
};
