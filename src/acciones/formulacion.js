// ============================================================
// Acciones · Formular y enviar la propuesta
// Casos de uso del ERS: CU-04, CU-05.
// Acciones incluidas: guardarBorrador, enviarPropuesta, responderObservacionesVIE, registrarCartaAceptacion.
// Cada acción recibe (d, p, ctx): d = copia de la base, p = datos enviados por la pantalla, ctx = usuario, rol y hora. Si incumple una regla lanza fallo("mensaje").
// ============================================================
import {
  bit,
  evento,
  exigirRecepcion,
  notificar,
  nuevaVersion,
  requiere,
  sincronizarResumen,
} from "./ayudas.js";
import { convDe, paramsDe, propDe, requierePI } from "../reglas/consultas.js";
import { fallo } from "../reglas/errores.js";
import { equipoMorosos } from "../reglas/morosidad.js";
import { validarPropuesta } from "../reglas/validaciones.js";
import { fechaCorta } from "../utilidades/fechas.js";
import { pad } from "../utilidades/formato.js";
import { textos as T } from "../textos/acciones/formulacion.js";

export const accionesFormulacion = {
  guardarBorrador(d, p, ctx) {
    requiere(ctx, ["investigador"]);
    const conv = p.convocatoriaId || d.convocatorias.find((c) => c.estado === "Publicada")?.id;
    exigirRecepcion(d, conv, ctx.ahora);
    let prop = p.id ? d.proposals.find((x) => x.id === p.id) : null;
    if (prop && !["Borrador", "Devuelta por faltantes", "Con observaciones"].includes(prop.estado))
      fallo(T.laPropuestaYaFueEnviada);
    if (!prop) {
      let nb;
      do nb = `BOR-${pad(++d.contador.borrador)}`;
      while (d.proposals.some((x) => x.id === nb));
      prop = {
        id: nb,
        convocatoriaId: conv,
        coordinadorId: ctx.user.id,
        investigadora: ctx.user.nombre,
        estado: "Borrador",
        etapa: 0,
        creada: ctx.ahora,
        form: p.form,
        versiones: [],
        timeline: [
          {
            fecha: ctx.ahora,
            titulo: "Borrador creado",
            detalle: "La persona coordinadora inició la formulación.",
            por: ctx.user.nombre,
          },
        ],
        observaciones: [],
        morosidad: [],
        documentos: [],
      };
      d.proposals.unshift(prop);
      bit(d, ctx, T.borradorCreado, prop.id);
    }
    prop.form = p.form;
    prop.ultimoGuardado = ctx.ahora;
    sincronizarResumen(prop, d);
    prop.morosidad = equipoMorosos(d, prop.form);
    ctx.resultado = prop.id;
    return T.borradorGuardado;
  },
  enviarPropuesta(d, p, ctx) {
    requiere(ctx, ["investigador"]);
    const prop = propDe(d, p.id);
    const reenvio = prop.estado === "Devuelta por faltantes";
    if (!["Borrador", "Devuelta por faltantes"].includes(prop.estado))
      fallo(T.laPropuestaYaFueEnviada2);
    exigirRecepcion(d, prop.convocatoriaId, ctx.ahora);
    if (p.form) prop.form = p.form;
    const params = paramsDe(d, prop.convocatoriaId);
    const errores = validarPropuesta(prop.form, { db: d, params, propId: prop.id }).filter(
      (x) => x.nivel === "error",
    );
    if (errores.length)
      fallo(
        `Hay ${errores.length} elementos obligatorios incompletos. Revise el resumen del último paso.`,
      );
    const mor = equipoMorosos(d, prop.form);
    if (mor.length && params.politicaMorosidad === "bloquear")
      fallo(`No se puede enviar: ${mor.join(", ")} figura con informes pendientes ante la VIE.`);
    prop.morosidad = mor;
    prop.form.declaracion.fecha = ctx.ahora;
    sincronizarResumen(prop, d);
    const pi = requierePI(prop.form);
    if (!reenvio) {
      prop.id = `PROP-2027-${pad(++d.contador.prop)}`;
      prop.enviada = ctx.ahora;
    }
    const n = nuevaVersion(prop, ctx, reenvio ? "Corrección tras devolución" : "Envío inicial");
    prop.progreso = 100;
    if (reenvio) {
      evento(
        d,
        prop,
        ctx,
        T.propuestaCorregidaYReenviada,
        `Versión ${n} enviada dentro del plazo vigente.`,
        "En revisión de completitud",
      );
      notificar(
        d,
        ctx,
        ["comite_asistente"],
        T.propuestaReenviada,
        `${prop.id} fue corregida y reenviada.`,
        prop.id,
        prop.instancia,
      );
    } else {
      prop.pi = pi
        ? { estado: "Pendiente" }
        : {
            estado: "No requerido",
            constancia: `Constancia de no requerido emitida automáticamente el ${fechaCorta(ctx.ahora)}.`,
          };
      evento(
        d,
        prop,
        ctx,
        T.propuestaEnviada,
        pi ? T.enviadaAlCentroDeVinculacion : T.sinPotencialDePropiedadIntelectual,
        pi ? "Pendiente de dictamen PI" : "En revisión de completitud",
      );
      if (pi)
        notificar(
          d,
          ctx,
          ["vinculacion"],
          T.dictamenDePiPendiente,
          `${prop.id} espera revisión del Centro de Vinculación.`,
          prop.id,
        );
      else
        notificar(
          d,
          ctx,
          ["comite_asistente"],
          T.nuevaPropuestaPorRevisar,
          `${prop.id} llegó a revisión de completitud.`,
          prop.id,
          prop.instancia,
        );
    }
    notificar(
      d,
      ctx,
      [prop.coordinadorId],
      T.propuestaEnviada,
      `${prop.id} quedó registrada${mor.length ? ` con una observación de morosidad (${mor.join(", ")})` : ""}.`,
      prop.id,
    );
    ctx.resultado = prop.id;
    return `Propuesta ${prop.id} enviada correctamente.`;
  },
  responderObservacionesVIE(d, p, ctx) {
    requiere(ctx, ["investigador"]);
    const prop = propDe(d, p.id);
    if (prop.estado !== "Con observaciones") fallo(T.laPropuestaNoTieneObservaciones);
    if (p.form) prop.form = p.form;
    const errores = validarPropuesta(prop.form, {
      db: d,
      params: paramsDe(d, prop.convocatoriaId),
      propId: prop.id,
    }).filter((x) => x.nivel === "error");
    if (errores.length) fallo(`Hay ${errores.length} elementos obligatorios incompletos.`);
    sincronizarResumen(prop, d);
    const n = nuevaVersion(prop, ctx, "Respuesta a observaciones de la VIE");
    prop.observaciones.forEach((o) => o.fuente === "VIE" && (o.resuelta = true));
    evento(
      d,
      prop,
      ctx,
      T.observacionesAtendidas,
      `Versión ${n} enviada a la persona gestora.`,
      "En revisión VIE",
    );
    notificar(
      d,
      ctx,
      ["gestora_vie"],
      T.observacionesAtendidas,
      `${prop.id} fue corregida por el equipo investigador.`,
      prop.id,
    );
    return T.correccionEnviadaALaPersona;
  },
  registrarCartaAceptacion(d, p, ctx) {
    requiere(ctx, ["investigador"]);
    const prop = propDe(d, p.id);
    if (!prop.carta?.requerida) fallo(T.estaPropuestaNoRequiereCarta);
    const e = convDe(d, prop.convocatoriaId)?.cronograma.find((x) =>
      /carta de aceptación/i.test(x.etapa),
    );
    if (e && ctx.ahora > `${e.fin}T23:59:59`)
      fallo(`El plazo para remitir la carta cerró el ${fechaCorta(e.fin)}.`);
    prop.carta = {
      ...prop.carta,
      recibida: true,
      archivo: p.archivo || "Carta_aceptacion.pdf",
      fecha: ctx.ahora,
    };
    evento(d, prop, ctx, T.cartaDeAceptacionCargada, `Archivo ${prop.carta.archivo}.`);
    notificar(
      d,
      ctx,
      ["direccion_investigacion"],
      T.cartaDeAceptacionRecibida,
      `${prop.id}: la persona coordinadora cargó la carta.`,
      prop.id,
    );
    return T.cartaDeAceptacionRegistrada;
  },
};
