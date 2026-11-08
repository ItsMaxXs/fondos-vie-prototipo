// ============================================================
// Acciones · Notificar el resultado
// Casos de uso del ERS: CU-14.
// Acciones incluidas: notificarResolucion, confirmarCarta.
// Cada acción recibe (d, p, ctx): d = copia de la base, p = datos enviados por la pantalla, ctx = usuario, rol y hora. Si incumple una regla lanza fallo("mensaje").
// ============================================================
import { bit, evento, notificar, requiere } from "./ayudas.js";
import { propDe } from "../reglas/consultas.js";
import { fallo } from "../reglas/errores.js";
import { pad } from "../utilidades/formato.js";
import { textos as T } from "../textos/acciones/notificacion.js";

export const accionesNotificacion = {
  notificarResolucion(d, p, ctx) {
    requiere(ctx, ["direccion_investigacion"]);
    const prop = propDe(d, p.id);
    if (!["Aprobada", "Aprobada con condiciones", "Rechazada"].includes(prop.estado))
      fallo(T.laPropuestaNoTieneUna);
    const res = prop.cie.resolucion;
    prop.notificacion = {
      numero: `CIE-${pad(++d.contador.notificacion)}`,
      fecha: ctx.ahora,
      por: ctx.user.nombre,
      destinatarios: [prop.investigadora, prop.escuela],
    };
    prop.final = true;
    evento(
      d,
      prop,
      ctx,
      T.resolucionNotificada,
      `La Dirección de Investigación notificó formalmente el resultado (${res.resultado}). El expediente pasó al histórico.`,
      "Notificada",
    );
    notificar(
      d,
      ctx,
      [prop.coordinadorId],
      T.resolucionDelCie,
      `${prop.id}: ${res.resultado}.${prop.carta?.requerida ? " Remita la carta de aceptación de condiciones dentro del plazo del cronograma." : ""}`,
      prop.id,
    );
    notificar(
      d,
      ctx,
      ["direccion_escuela"],
      T.resolucionDelCie,
      `${prop.id}: ${res.resultado}.`,
      prop.id,
      prop.instancia,
    );
    return T.notificacionFormalRegistradaExpedienteEn;
  },
  confirmarCarta(d, p, ctx) {
    requiere(ctx, ["direccion_investigacion"]);
    const prop = propDe(d, p.id);
    if (!prop.carta?.recibida) fallo(T.laCartaTodaviaNoFue);
    prop.carta.confirmada = true;
    bit(d, ctx, T.recepcionDeCartaConfirmada, prop.id);
    return T.recepcionDeLaCartaConfirmada;
  },
};
