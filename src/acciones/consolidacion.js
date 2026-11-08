// ============================================================
// Acciones · Consolidar y firmar el documento del Comité
// Casos de uso del ERS: CU-09.
// Acciones incluidas: consolidarComite, firmarDocumentoComite, enviarAlConsejo.
// Cada acción recibe (d, p, ctx): d = copia de la base, p = datos enviados por la pantalla, ctx = usuario, rol y hora. Si incumple una regla lanza fallo("mensaje").
// ============================================================
import { bit, evento, notificar, requiere } from "./ayudas.js";
import { paramsDe, propDe } from "../reglas/consultas.js";
import { fallo } from "../reglas/errores.js";
import { criteriosDe, resumenProductos } from "../reglas/evaluacion.js";
import { pad } from "../utilidades/formato.js";
import { textos as T } from "../textos/acciones/consolidacion.js";

export const accionesConsolidacion = {
  consolidarComite(d, p, ctx) {
    requiere(ctx, ["comite_asistente"]);
    const prop = propDe(d, p.id);
    if (prop.estado !== "En evaluación") fallo(T.laPropuestaNoEstaEn);
    if (!prop.evaluaciones.every((e) => e.estado === "Finalizada"))
      fallo(T.todaviaHayEvaluacionesSinFinalizar);
    const params = paramsDe(d, prop.convocatoriaId);
    const rub = d.rubricas[prop.convocatoriaId][prop.form.modalidad].secciones;
    const notas = prop.evaluaciones.map((e) => e.nota);
    const dif = Math.max(...notas) - Math.min(...notas);
    if (dif > params.difMaxNotas && !p.confirmarDiferencia)
      fallo(
        `DIFERENCIA: la diferencia entre la nota más alta y la más baja es de ${dif.toFixed(1)} puntos y supera el máximo configurado (${params.difMaxNotas}). El Comité debe discutirla antes de consolidar.`,
      );
    const nota = Math.round((notas.reduce((s, x) => s + x, 0) / notas.length) * 10) / 10;
    const crit = criteriosDe(rub);
    const promedios = {};
    crit.forEach(
      (c) =>
        (promedios[c.id] =
          prop.evaluaciones.reduce((s, e) => s + Number(e.scores[c.id] || 0), 0) /
          prop.evaluaciones.length),
    );
    const bajos = crit.filter((c) => c.required && promedios[c.id] < 8);
    const subtotales = {};
    crit.forEach(
      (c) =>
        (subtotales[c.seccion] = (subtotales[c.seccion] || 0) + c.weight * (promedios[c.id] / 10)),
    );
    const recomienda = nota >= params.umbralComite && bajos.length === 0;
    prop.consolidacion = {
      nota,
      resultado: recomienda ? "Recomienda" : "No recomienda",
      dictamen: recomienda ? "Dictamen técnico favorable" : "Dictamen técnico desfavorable",
      obligatoriosBajos: bajos.map((c) => c.label),
      subtotales,
      detalle: prop.evaluaciones.map((e) => ({ evaluadorId: e.evaluadorId, nota: e.nota })),
      diferencia: dif,
      fecha: ctx.ahora,
      oficio: `CT-${pad(++d.contador.oficioComite)}-2026`,
      firmas: {},
      productos: resumenProductos(prop.form, params),
    };
    evento(
      d,
      prop,
      ctx,
      T.comiteTecnicoConsolidoLaEvaluacion,
      `Nota consolidada ${nota} %. Resultado: ${prop.consolidacion.resultado}. Oficio ${prop.consolidacion.oficio}.`,
      "Evaluada",
    );
    return T.evaluacionConsolidadaYDocumentoDel;
  },
  firmarDocumentoComite(d, p, ctx) {
    requiere(ctx, ["comite_evaluador"]);
    const prop = propDe(d, p.id);
    if (!prop.consolidacion) fallo(T.aunNoHayDocumentoDel);
    prop.consolidacion.firmas[ctx.user.id] = ctx.ahora;
    bit(d, ctx, T.documentoDelComiteFirmado, prop.id);
    return T.firmaRegistradaEnElDocumento;
  },
  enviarAlConsejo(d, p, ctx) {
    requiere(ctx, ["comite_asistente"]);
    const prop = propDe(d, p.id);
    if (prop.estado !== "Evaluada") fallo(T.laPropuestaNoEstaEvaluada);
    const comite = d.comites[prop.instancia];
    const coord = comite.integrantes.find((i) => i.coordina)?.userId;
    if (coord && !prop.consolidacion.firmas[coord]) fallo(T.faltaLaFirmaDeLa);
    if (prop.consolidacion.resultado === "Recomienda") {
      evento(
        d,
        prop,
        ctx,
        T.expedienteEnviadoAlConsejo,
        `La asistente del Consejo recibió la nota y el oficio ${prop.consolidacion.oficio}.`,
        "En trámite de aval",
      );
      notificar(
        d,
        ctx,
        ["consejo_asistente"],
        T.avalPendiente,
        `${prop.id}: llegó la nota (${prop.consolidacion.nota} %) y el oficio del Comité.`,
        prop.id,
        prop.instancia,
      );
    } else {
      evento(
        d,
        prop,
        ctx,
        T.dictamenDesfavorableDelComite,
        `Resultado: No recomienda (${prop.consolidacion.nota} %). Se envía al Consejo para su conocimiento.`,
        "No recomendada por el Comité",
      );
      notificar(
        d,
        ctx,
        ["consejo_asistente", "consejo"],
        T.dictamenDesfavorableParaConocimiento,
        `${prop.id}: el Comité no recomienda la propuesta.`,
        prop.id,
        prop.instancia,
      );
      notificar(
        d,
        ctx,
        [prop.coordinadorId],
        T.resultadoDelComiteTecnico,
        `${prop.id}: el Comité no recomendó la propuesta.`,
        prop.id,
      );
    }
    return T.documentoDelComiteEnviadoAl;
  },
};
