// ============================================================
// Acciones · Revisión de completitud por el Comité Técnico
// Casos de uso del ERS: CU-07.
// Acciones incluidas: devolverPropuesta, enviarAEvaluacion, marcarNoAdmitida.
// Cada acción recibe (d, p, ctx): d = copia de la base, p = datos enviados por la pantalla, ctx = usuario, rol y hora. Si incumple una regla lanza fallo("mensaje").
// ============================================================
import { evento, notificar, requiere } from "./ayudas.js";
import { nombreUsuario, propDe } from "../reglas/consultas.js";
import { fallo } from "../reglas/errores.js";
import { norm } from "../reglas/formulario.js";
import { recepcionAbierta } from "../reglas/recepcion.js";
import { textos as T } from "../textos/acciones/completitud.js";

export const accionesCompletitud = {
  devolverPropuesta(d, p, ctx) {
    requiere(ctx, ["comite_asistente", "gestora_vie"]);
    const prop = propDe(d, p.id);
    if (prop.estado !== "En revisión de completitud") fallo(T.soloSePuedeDevolverUna);
    if (!String(p.motivo || "").trim()) fallo(T.elMotivoDeLaDevolucion);
    prop.completitud = prop.completitud || { devoluciones: [] };
    prop.completitud.devoluciones.push({
      fecha: ctx.ahora,
      motivo: p.motivo,
      secciones: p.secciones || [],
      por: ctx.user.nombre,
    });
    prop.observaciones.push({
      autor: ctx.user.nombre + " · Asistente del Comité",
      texto: p.motivo,
      fecha: ctx.ahora,
      fuente: "Comité",
      secciones: p.secciones || [],
    });
    evento(d, prop, ctx, T.propuestaDevuelta, p.motivo, "Devuelta por faltantes");
    const abierta = recepcionAbierta(d, prop.convocatoriaId, ctx.ahora);
    notificar(
      d,
      ctx,
      [prop.coordinadorId],
      T.propuestaDevuelta,
      `${prop.id}: ${p.motivo}${abierta ? "" : " (el plazo de recepción ya cerró)"}`,
      prop.id,
    );
    return T.propuestaDevueltaConObservaciones;
  },
  enviarAEvaluacion(d, p, ctx) {
    requiere(ctx, ["comite_asistente"]);
    const prop = propDe(d, p.id);
    if (prop.estado !== "En revisión de completitud") fallo(T.laPropuestaNoEstaEn);
    const checks = p.checks || {};
    if (!Object.values(checks).length || !Object.values(checks).every(Boolean))
      fallo(T.verifiqueTodosLosElementosDe);
    prop.completitud = {
      ...(prop.completitud || { devoluciones: [] }),
      checks,
      verificada: ctx.ahora,
    };
    const comite = d.comites[prop.instancia] || fallo(T.laInstanciaNoTieneUn);
    const nombresEquipo = (prop.form.equipo || []).map((x) => norm(x.nombre));
    const integrantes = comite.integrantes.filter((i) => i.activo !== false);
    const excluidos = integrantes.filter((i) =>
      nombresEquipo.includes(norm(nombreUsuario(d, i.userId))),
    );
    prop.evaluaciones = integrantes
      .filter((i) => !excluidos.includes(i))
      .map((i) => ({
        evaluadorId: i.userId,
        estado: "Pendiente",
        scores: {},
        reasons: {},
        nota: null,
        resultado: "",
        historial: [],
      }));
    prop.comiteExcluidos = excluidos.map((i) => ({
      userId: i.userId,
      motivo: "Participa en el equipo de la propuesta (conflicto de interés)",
    }));
    if (!prop.evaluaciones.length) fallo(T.noQuedanIntegrantesDelComite);
    evento(
      d,
      prop,
      ctx,
      T.expedienteCompleto,
      `Remitido a ${prop.evaluaciones.length} integrantes del Comité Técnico${excluidos.length ? `; se excluyó por conflicto de interés a ${excluidos.length}` : ""}.`,
      "En evaluación",
    );
    notificar(
      d,
      ctx,
      prop.evaluaciones.map((e) => e.evaluadorId),
      T.propuestaAsignadaParaEvaluacion,
      `${prop.id} está lista para su evaluación individual.`,
      prop.id,
    );
    return T.propuestaEnviadaAlCuerpoEvaluador;
  },
  marcarNoAdmitida(d, p, ctx) {
    requiere(ctx, ["comite_asistente", "gestora_vie"]);
    const prop = propDe(d, p.id);
    if (!String(p.motivo || "").trim()) fallo(T.indiqueElMotivo);
    prop.final = true;
    evento(d, prop, ctx, T.propuestaNoAdmitida, p.motivo, "No admitida");
    notificar(
      d,
      ctx,
      [prop.coordinadorId],
      T.propuestaNoAdmitida,
      `${prop.id}: ${p.motivo}`,
      prop.id,
    );
    return T.propuestaMarcadaComoNoAdmitida;
  },
};
