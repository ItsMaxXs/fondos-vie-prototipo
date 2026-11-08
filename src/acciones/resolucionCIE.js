// ============================================================
// Acciones · Resolución del CIE
// Casos de uso del ERS: CU-13.
// Acciones incluidas: abrirResolucionCIE, guardarRubricaCIE, resolverCIE.
// Cada acción recibe (d, p, ctx): d = copia de la base, p = datos enviados por la pantalla, ctx = usuario, rol y hora. Si incumple una regla lanza fallo("mensaje").
// ============================================================
import { bit, evento, notificar, requiere } from "./ayudas.js";
import { propDe } from "../reglas/consultas.js";
import { fallo } from "../reglas/errores.js";
import { pad } from "../utilidades/formato.js";
import { textos as T } from "../textos/acciones/resolucionCIE.js";

export const accionesResolucionCIE = {
  abrirResolucionCIE(d, p, ctx) {
    requiere(ctx, ["cie"]);
    const prop = propDe(d, p.id);
    if (prop.estado !== "Lista para CIE") fallo(T.elExpedienteNoEstaListo);
    evento(d, prop, ctx, T.cieInicioElAnalisis, T.elExpedienteEstaEnResolucion, "En resolución");
    return T.expedienteAbiertoParaResolucion;
  },
  guardarRubricaCIE(d, p, ctx) {
    requiere(ctx, ["cie"]);
    const prop = propDe(d, p.id);
    prop.cie = { ...(prop.cie || {}), rubrica: { scores: p.scores, reasons: p.reasons } };
    bit(d, ctx, T.rubricaDeApoyoDelCie, prop.id);
    return T.evaluacionDelCieGuardada;
  },
  resolverCIE(d, p, ctx) {
    requiere(ctx, ["cie"]);
    const prop = propDe(d, p.id);
    if (prop.estado !== "En resolución") fallo(T.elExpedienteNoEstaEn);
    if (!["Aprobada", "Aprobada con condiciones", "Rechazada"].includes(p.resultado))
      fallo(T.elijaLaResolucion);
    if (!String(p.justificacion || "").trim()) fallo(T.laJustificacionEsObligatoria);
    if (p.resultado === "Aprobada con condiciones" && !String(p.condiciones || "").trim())
      fallo(T.indiqueLasCondicionesDeLa);
    if (!p.sesion?.trim() || !p.fecha) fallo(T.indiqueLaSesionYLa);
    const numero = `CIE-RES-${pad(++d.contador.resolucion)}-2026`;
    prop.cie = {
      ...(prop.cie || {}),
      resolucion: {
        resultado: p.resultado,
        justificacion: p.justificacion,
        condiciones: p.condiciones || "",
        numero,
        sesion: p.sesion,
        fecha: p.fecha,
        por: ctx.user.nombre,
      },
    };
    if (p.resultado !== "Rechazada") prop.carta = { requerida: true, recibida: false };
    prop.resolucion = numero;
    evento(
      d,
      prop,
      ctx,
      `CIE: ${p.resultado}`,
      `Resolución ${numero}. ${p.justificacion}`,
      p.resultado,
    );
    notificar(
      d,
      ctx,
      ["direccion_investigacion"],
      T.resolucionEmitida,
      `${prop.id}: ${p.resultado} (${numero}). Pendiente de notificar.`,
      prop.id,
    );
    return `Resolución ${numero} emitida.`;
  },
};
