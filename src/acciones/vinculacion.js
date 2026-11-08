// ============================================================
// Acciones · Dictamen del Centro de Vinculación
// Casos de uso del ERS: CU-06.
// Acciones incluidas: iniciarRevisionPI, emitirDictamenPI.
// Cada acción recibe (d, p, ctx): d = copia de la base, p = datos enviados por la pantalla, ctx = usuario, rol y hora. Si incumple una regla lanza fallo("mensaje").
// ============================================================
import { evento, notificar, requiere } from "./ayudas.js";
import { propDe } from "../reglas/consultas.js";
import { fallo } from "../reglas/errores.js";
import { textos as T } from "../textos/acciones/vinculacion.js";

export const accionesVinculacion = {
  iniciarRevisionPI(d, p, ctx) {
    requiere(ctx, ["vinculacion"]);
    const prop = propDe(d, p.id);
    if (prop.estado !== "Pendiente de dictamen PI") fallo(T.laPropuestaNoEstaPendiente);
    prop.pi.estado = "En revisión";
    evento(d, prop, ctx, T.revisionDePiIniciada, T.elCentroDeVinculacionEsta);
    return T.revisionIniciada;
  },
  emitirDictamenPI(d, p, ctx) {
    requiere(ctx, ["vinculacion"]);
    const prop = propDe(d, p.id);
    if (prop.estado !== "Pendiente de dictamen PI") fallo(T.laPropuestaNoEstaPendiente);
    const x = p.dictamen;
    const falta = [
      "tipoActivo",
      "tipoPI",
      "novedad",
      "titularidad",
      "divulgacion",
      "confidencialidad",
      "analisis",
      "recomendaciones",
      "oficio",
      "fecha",
    ].filter((k) => !String(x[k] || "").trim());
    if (falta.length) fallo(T.completeTodosLosCamposDel);
    prop.pi = { estado: "Emitido", dictamen: x, oficio: x.oficio, fecha: x.fecha };
    (prop.form.activosPI || []).forEach((a) => (a.consecutivo = x.oficio));
    evento(
      d,
      prop,
      ctx,
      T.dictamenPiEmitido,
      `Centro de Vinculación registró el oficio ${x.oficio}.`,
      "En revisión de completitud",
    );
    notificar(
      d,
      ctx,
      [prop.coordinadorId],
      T.dictamenEmitido,
      `${prop.id}: el Centro de Vinculación emitió el dictamen (${x.oficio}).`,
      prop.id,
    );
    notificar(
      d,
      ctx,
      ["comite_asistente"],
      T.propuestaListaParaCompletitud,
      `${prop.id} continúa a revisión de completitud.`,
      prop.id,
      prop.instancia,
    );
    return T.dictamenEmitidoYOficioAgregado;
  },
};
