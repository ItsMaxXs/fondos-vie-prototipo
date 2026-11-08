// ============================================================
// Acciones · Verificación de la VIE y dictamen institucional
// Casos de uso del ERS: CU-12.
// Acciones incluidas: observacionPreventiva, guardarRevisionVIE, observarVIE, emitirDictamenDI, marcarListaCIE.
// Cada acción recibe (d, p, ctx): d = copia de la base, p = datos enviados por la pantalla, ctx = usuario, rol y hora. Si incumple una regla lanza fallo("mensaje").
// ============================================================
import { bit, evento, notificar, requiere } from "./ayudas.js";
import { propDe } from "../reglas/consultas.js";
import { fallo } from "../reglas/errores.js";
import { recepcionAbierta } from "../reglas/recepcion.js";
import { pad } from "../utilidades/formato.js";
import { textos as T } from "../textos/acciones/verificacionVIE.js";

export const accionesVerificacionVIE = {
  observacionPreventiva(d, p, ctx) {
    requiere(ctx, ["gestora_vie"]);
    const prop = propDe(d, p.id);
    if (prop.estado !== "Borrador") fallo(T.soloSePuedenDejarObservaciones);
    if (!recepcionAbierta(d, prop.convocatoriaId, ctx.ahora))
      fallo(T.laFuncionDeObservacionesPreventivas);
    if (!String(p.texto || "").trim()) fallo(T.escribaLaObservacion);
    prop.observaciones.push({
      autor: ctx.user.nombre + " · Gestora VIE",
      texto: p.texto,
      fecha: ctx.ahora,
      fuente: "VIE (preventiva)",
    });
    bit(d, ctx, T.observacionPreventiva, prop.id, undefined, p.texto);
    notificar(
      d,
      ctx,
      [prop.coordinadorId],
      T.observacionPreventivaDeLaGestora,
      `${prop.id}: ${p.texto}`,
      prop.id,
    );
    return T.observacionPreventivaEnviada;
  },
  guardarRevisionVIE(d, p, ctx) {
    requiere(ctx, ["gestora_vie"]);
    const prop = propDe(d, p.id);
    prop.vie = { ...(prop.vie || { observaciones: [] }), checks: p.checks };
    bit(d, ctx, T.verificacionVieGuardada, prop.id);
    return T.verificacionGuardada;
  },
  observarVIE(d, p, ctx) {
    requiere(ctx, ["gestora_vie"]);
    const prop = propDe(d, p.id);
    if (prop.estado !== "En revisión VIE") fallo(T.laPropuestaNoEstaEn);
    const obs = (p.observaciones || []).filter((o) => String(o.texto || "").trim());
    if (!obs.length) fallo(T.escribaAlMenosUnaObservacion);
    prop.vie = {
      ...(prop.vie || {}),
      observaciones: [
        ...(prop.vie?.observaciones || []),
        ...obs.map((o) => ({ ...o, fecha: ctx.ahora, por: ctx.user.nombre })),
      ],
    };
    obs.forEach((o) =>
      prop.observaciones.push({
        autor: ctx.user.nombre + " · Gestora VIE",
        texto: `${o.seccion}: ${o.texto}`,
        fecha: ctx.ahora,
        fuente: "VIE",
      }),
    );
    evento(
      d,
      prop,
      ctx,
      T.observacionDeLaVie,
      obs.map((o) => `${o.seccion}: ${o.texto}`).join(" | "),
      "Con observaciones",
    );
    notificar(
      d,
      ctx,
      [prop.coordinadorId],
      T.observacionDeLaGestoraVie,
      `${prop.id} requiere correcciones antes de continuar.`,
      prop.id,
    );
    return T.observacionEnviadaAlEquipoInvestigador;
  },
  emitirDictamenDI(d, p, ctx) {
    requiere(ctx, ["direccion_investigacion"]);
    const prop = propDe(d, p.id);
    if (!["En revisión VIE", "Con observaciones", "Lista para CIE"].includes(prop.estado))
      fallo(T.elExpedienteAunNoEsta);
    const v = p.verificaciones;
    const incompletas = Object.values(v).some((x) => x.ok === null || x.ok === undefined);
    if (incompletas) fallo(T.resuelvaTodasLasVerificacionesGuiadas);
    const falla = Object.entries(v).filter(([, x]) => !x.ok);
    prop.vie = {
      ...(prop.vie || { checks: {}, observaciones: [] }),
      dictamenDI: {
        emitido: true,
        verificaciones: v,
        resultado: falla.length ? "Con hallazgos" : "Favorable",
        oficio: `DI-${pad(++d.contador.oficioDI)}-2026`,
        fecha: ctx.ahora,
        por: ctx.user.nombre,
        comentario: p.comentario || "",
      },
    };
    evento(
      d,
      prop,
      ctx,
      T.dictamenDeLaDireccionDe,
      `${prop.vie.dictamenDI.oficio}: ${prop.vie.dictamenDI.resultado}.`,
    );
    notificar(
      d,
      ctx,
      ["gestora_vie"],
      T.dictamenInstitucionalEmitido,
      `${prop.id}: resultado ${prop.vie.dictamenDI.resultado}.`,
      prop.id,
    );
    return T.dictamenEmitido;
  },
  marcarListaCIE(d, p, ctx) {
    requiere(ctx, ["gestora_vie"]);
    const prop = propDe(d, p.id);
    if (prop.estado !== "En revisión VIE") fallo(T.laPropuestaNoEstaEn);
    const ch = prop.vie?.checks || {};
    if (!Object.values(ch).length || !Object.values(ch).every(Boolean))
      fallo(T.verifiqueTodosLosElementosDe);
    if (!prop.vie?.dictamenDI?.emitido) fallo(T.faltaElDictamenDeLa);
    evento(d, prop, ctx, T.expedienteListoParaElCie, T.laVieVerificoElExpediente, "Lista para CIE");
    notificar(
      d,
      ctx,
      ["cie"],
      T.expedienteDisponibleParaResolucion,
      `${prop.id} está lista para el CIE.`,
      prop.id,
    );
    return T.expedienteEnviadoAlCie;
  },
};
