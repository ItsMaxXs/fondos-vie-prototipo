// ============================================================
// Acciones · Evaluar con la rúbrica
// Casos de uso del ERS: CU-08.
// Acciones incluidas: guardarEvaluacion, finalizarEvaluacion, reabrirEvaluacion.
// Cada acción recibe (d, p, ctx): d = copia de la base, p = datos enviados por la pantalla, ctx = usuario, rol y hora. Si incumple una regla lanza fallo("mensaje").
// ============================================================
import { bit, notificar, requiere } from "./ayudas.js";
import { paramsDe, propDe } from "../reglas/consultas.js";
import { fallo } from "../reglas/errores.js";
import { calcularEvaluacion, criteriosDe } from "../reglas/evaluacion.js";
import { clone } from "../utilidades/ids.js";
import { textos as T } from "../textos/acciones/evaluacion.js";

export const accionesEvaluacion = {
  guardarEvaluacion(d, p, ctx) {
    requiere(ctx, ["comite_evaluador"]);
    const prop = propDe(d, p.id);
    const ev =
      prop.evaluaciones?.find((e) => e.evaluadorId === p.evaluadorId) ||
      fallo(T.noTieneAsignadaEstaPropuesta);
    if (ev.estado === "Finalizada") fallo(T.laEvaluacionEstaFinalizadaY);
    ev.scores = p.scores;
    ev.reasons = p.reasons;
    ev.estado = "En progreso";
    ev.ultimoGuardado = ctx.ahora;
    bit(d, ctx, T.evaluacionGuardadaAvanceParcial, prop.id);
    return T.losCambiosDeLaEvaluacion;
  },
  finalizarEvaluacion(d, p, ctx) {
    requiere(ctx, ["comite_evaluador"]);
    const prop = propDe(d, p.id);
    const ev =
      prop.evaluaciones?.find((e) => e.evaluadorId === p.evaluadorId) ||
      fallo(T.noTieneAsignadaEstaPropuesta);
    if (ev.estado === "Finalizada") fallo(T.laEvaluacionYaFueFinalizada);
    ev.scores = p.scores;
    ev.reasons = p.reasons;
    const rub = d.rubricas[prop.convocatoriaId][prop.form.modalidad].secciones;
    const calc = calcularEvaluacion(rub, ev.scores, paramsDe(d, prop.convocatoriaId).umbralComite);
    if (calc.sinEvaluar.length)
      fallo(`Falta seleccionar el nivel de ${calc.sinEvaluar.length} criterios.`);
    const sinJust = criteriosDe(rub).filter(
      (c) => c.required && !String(ev.reasons[c.id] || "").trim(),
    );
    if (sinJust.length)
      fallo(`Falta la justificación escrita de ${sinJust.length} criterios obligatorios.`);
    ev.nota = calc.nota;
    ev.resultado = calc.resultado;
    ev.obligatoriosBajos = calc.obligatoriosBajos.map((c) => c.label);
    ev.estado = "Finalizada";
    ev.finalizadaEn = ctx.ahora;
    ev.historial = ev.historial || [];
    bit(d, ctx, T.evaluacionFinalizada, prop.id, undefined, `${calc.nota}% · ${calc.resultado}`);
    prop.timeline.push({
      fecha: ctx.ahora,
      titulo: "Evaluación individual finalizada",
      detalle: `${prop.evaluaciones.filter((e) => e.estado === "Finalizada").length} de ${prop.evaluaciones.length} integrantes finalizaron.`,
      por: ctx.user.nombre,
    });
    if (prop.evaluaciones.every((e) => e.estado === "Finalizada"))
      notificar(
        d,
        ctx,
        ["comite_asistente"],
        T.evaluacionesCompletas,
        `${prop.id}: todas las evaluaciones están finalizadas y pueden consolidarse.`,
        prop.id,
        prop.instancia,
      );
    return T.evaluacionFinalizadaYBloqueada;
  },
  reabrirEvaluacion(d, p, ctx) {
    requiere(ctx, ["comite_asistente"]);
    const prop = propDe(d, p.id);
    if (!String(p.motivo || "").trim()) fallo(T.indiqueElMotivoDeLa);
    if (prop.consolidacion && prop.estado !== "En evaluación") fallo(T.laPropuestaYaFueConsolidada);
    const ev = prop.evaluaciones.find((e) => e.evaluadorId === p.evaluadorId);
    ev.historial.push({
      fecha: ctx.ahora,
      motivo: p.motivo,
      por: ctx.user.nombre,
      notaAnterior: ev.nota,
      scores: clone(ev.scores),
      reasons: clone(ev.reasons),
    });
    ev.estado = "En progreso";
    ev.nota = null;
    bit(d, ctx, T.evaluacionReabierta, prop.id, "Finalizada", p.motivo);
    notificar(
      d,
      ctx,
      [ev.evaluadorId],
      T.evaluacionReabierta,
      `${prop.id}: la asistente reabrió su evaluación. Motivo: ${p.motivo}`,
      prop.id,
    );
    return T.evaluacionReabiertaLaVersionAnterior;
  },
};
