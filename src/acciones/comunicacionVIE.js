// ============================================================
// Acciones · Comunicar el aval a la VIE
// Casos de uso del ERS: CU-11.
// Acciones incluidas: comunicarAvalAVIE, confirmarRecepcionVIE.
// Cada acción recibe (d, p, ctx): d = copia de la base, p = datos enviados por la pantalla, ctx = usuario, rol y hora. Si incumple una regla lanza fallo("mensaje").
// ============================================================
import { evento, notificar, requiere } from "./ayudas.js";
import { propDe } from "../reglas/consultas.js";
import { fallo } from "../reglas/errores.js";
import { textos as T } from "../textos/acciones/comunicacionVIE.js";

export const accionesComunicacionVIE = {
  comunicarAvalAVIE(d, p, ctx) {
    requiere(ctx, ["direccion_escuela"]);
    const prop = propDe(d, p.id);
    if (prop.estado !== "Avalada") fallo(T.laPropuestaNoEstaAvalada);
    if (prop.consejo.avales.some((a) => a.estado !== "Aprobado"))
      fallo(T.hayAvalesPendientesNoPuede);
    prop.comunicacionVIE = {
      oficio: prop.oficioAval,
      fecha: ctx.ahora,
      por: ctx.user.nombre,
      adjuntos: ["Acuerdo(s) de aval", `Nota del Comité ${prop.consolidacion.nota} %`],
      confirmada: false,
    };
    evento(
      d,
      prop,
      ctx,
      T.avalComunicadoALaVie,
      `Memorando ${prop.oficioAval} enviado a la Dirección de Investigación con el acuerdo y la nota.`,
      "Comunicada a la VIE",
    );
    notificar(
      d,
      ctx,
      ["gestora_vie", "direccion_investigacion"],
      T.avalComunicado,
      `${prop.id}: ${prop.escuela} comunicó el aval (${prop.oficioAval}).`,
      prop.id,
    );
    return T.memorandoEnviadoALaVie;
  },
  confirmarRecepcionVIE(d, p, ctx) {
    requiere(ctx, ["gestora_vie"]);
    const prop = propDe(d, p.id);
    if (prop.estado !== "Comunicada a la VIE") fallo(T.laPropuestaNoEstaPendiente);
    prop.comunicacionVIE.confirmada = true;
    prop.comunicacionVIE.confirmadaEn = ctx.ahora;
    prop.vie = prop.vie || { checks: {}, observaciones: [] };
    evento(
      d,
      prop,
      ctx,
      T.recepcionConfirmadaPorLaVie,
      T.laPersonaGestoraConfirmoLa,
      "En revisión VIE",
    );
    notificar(
      d,
      ctx,
      ["direccion_escuela"],
      T.recepcionConfirmada,
      `${prop.id}: la VIE confirmó la recepción del aval.`,
      prop.id,
      prop.instancia,
    );
    return T.recepcionConfirmadaElExpedientePasa;
  },
};
