// ============================================================
// Acciones · Convocatoria, parámetros y rúbricas
// Casos de uso del ERS: CU-02, CU-03.
// Acciones incluidas: crearConvocatoria, publicarConvocatoria, editarEtapa, guardarParametros, guardarRubrica, guardarCatalogo.
// Cada acción recibe (d, p, ctx): d = copia de la base, p = datos enviados por la pantalla, ctx = usuario, rol y hora. Si incumple una regla lanza fallo("mensaje").
// ============================================================
import { bit, notificar, requiere } from "./ayudas.js";
import { CRONOGRAMA_2027, ETAPA_FORMULACION } from "../datos/cronograma.js";
import { PARAMS_2027 } from "../datos/parametros.js";
import { convDe } from "../reglas/consultas.js";
import { fallo } from "../reglas/errores.js";
import { fechaCorta } from "../utilidades/fechas.js";
import { num, pad } from "../utilidades/formato.js";
import { clone } from "../utilidades/ids.js";
import { textos as T } from "../textos/acciones/convocatoria.js";

export const accionesConvocatoria = {
  crearConvocatoria(d, p, ctx) {
    requiere(ctx, ["vie_publicacion"]);
    if (!p.nombre?.trim() || !p.apertura || !p.cierre) fallo(T.indiqueElNombreYLas);
    if (p.cierre <= p.apertura) fallo(T.laFechaDeCierreDebe);
    const anio = new Date(p.apertura).getFullYear() + 1;
    const nn = d.convocatorias.filter((c) => c.id.startsWith(`VIE-${anio}-`)).length + 1;
    const id = `VIE-${anio}-${pad(nn, 2)}`;
    const origen = p.copiarDe ? convDe(d, p.copiarDe) : null;
    const cron = (origen ? origen.cronograma : CRONOGRAMA_2027).map((e) => ({ ...e }));
    const f = cron.find((e) => e.etapa === ETAPA_FORMULACION);
    if (f) {
      f.inicio = p.apertura;
      f.fin = p.cierre;
    }
    d.convocatorias.unshift({
      id,
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      apertura: p.apertura,
      cierre: p.cierre,
      estado: p.estado || "Borrador",
      cronograma: cron,
      cambios: [],
    });
    d.params[id] = clone(origen ? d.params[origen.id] : PARAMS_2027);
    d.rubricas[id] = clone(origen ? d.rubricas[origen.id] : Object.values(d.rubricas)[0]);
    bit(
      d,
      ctx,
      T.convocatoriaCreada,
      "",
      undefined,
      `${id}${origen ? ` (copiada de ${origen.id})` : ""}`,
    );
    ctx.resultado = id;
    return `Convocatoria ${id} guardada${p.estado === "Programada" ? " como programada" : " como borrador"}.`;
  },
  publicarConvocatoria(d, p, ctx) {
    requiere(ctx, ["vie_publicacion"]);
    const c = convDe(d, p.id);
    if (c.estado === "Publicada") fallo(T.laConvocatoriaYaEstaPublicada);
    if (c.cronograma.some((e) => !e.inicio || !e.fin || e.fin < e.inicio))
      fallo(T.completeElCronogramaTodasLas);
    if (!d.params[c.id] || !d.rubricas[c.id]) fallo(T.configureLosParametrosNormativosY);
    c.estado = ctx.ahora >= `${c.apertura}T00:00:00` ? "Publicada" : "Programada";
    bit(d, ctx, T.convocatoriaPublicada, "", undefined, c.id);
    if (c.estado === "Publicada")
      notificar(
        d,
        ctx,
        ["investigador"],
        T.convocatoriaPublicada,
        `${c.nombre} ya está abierta para formular propuestas hasta el ${fechaCorta(c.cierre)}.`,
        "",
      );
    return c.estado === "Publicada"
      ? T.convocatoriaPublicadaYPersonasInvestigadoras
      : T.convocatoriaProgramadaSePublicaraEn;
  },
  editarEtapa(d, p, ctx) {
    requiere(ctx, ["vie_publicacion"]);
    const c = convDe(d, p.convId);
    const e = c.cronograma.find((x) => x.id === p.etapaId);
    if (!String(p.motivo || "").trim()) fallo(T.indiqueElMotivoDelCambio);
    if (!p.inicio || !p.fin || p.fin < p.inicio) fallo(T.lasFechasDeLaEtapa);
    const antes = `${e.inicio} a ${e.fin}`;
    e.inicio = p.inicio;
    e.fin = p.fin;
    if (e.etapa === ETAPA_FORMULACION) {
      c.apertura = p.inicio;
      c.cierre = p.fin;
    }
    c.cambios.push({
      fecha: ctx.ahora,
      etapa: e.etapa,
      antes,
      despues: `${p.inicio} a ${p.fin}`,
      motivo: p.motivo,
      por: ctx.user.nombre,
    });
    bit(
      d,
      ctx,
      T.cronogramaModificado,
      "",
      `${e.etapa}: ${antes}`,
      `${p.inicio} a ${p.fin} · ${p.motivo}`,
    );
    notificar(
      d,
      ctx,
      ["investigador"],
      T.cambioEnElCronograma,
      `${e.etapa}: nuevas fechas ${fechaCorta(p.inicio)} a ${fechaCorta(p.fin)}. ${p.motivo}`,
      "",
    );
    return T.fechasActualizadasYRegistradasCon;
  },
  guardarParametros(d, p, ctx) {
    requiere(ctx, ["admin"]);
    const antes = d.params[p.convId];
    d.params[p.convId] = p.params;
    bit(
      d,
      ctx,
      T.parametrosNormativosModificados,
      "",
      JSON.stringify(antes).slice(0, 300),
      JSON.stringify(p.params).slice(0, 300),
    );
    return T.parametrosGuardadosLasValidacionesUsan;
  },
  guardarRubrica(d, p, ctx) {
    requiere(ctx, ["admin"]);
    const total = p.secciones.reduce(
      (s, x) => s + x.criteria.reduce((a, c) => a + num(c.weight), 0),
      0,
    );
    if (Math.round(total) !== 100)
      fallo(`Los pesos de la rúbrica suman ${total} y deben sumar 100.`);
    const actual = d.rubricas[p.convId][p.modalidad];
    d.rubricas[p.convId][p.modalidad] = {
      version: actual.version + 1,
      secciones: p.secciones.map((s) => ({
        ...s,
        weight: s.criteria.reduce((a, c) => a + num(c.weight), 0),
      })),
    };
    bit(
      d,
      ctx,
      T.rubricaVersionada,
      "",
      `v${actual.version}`,
      `v${actual.version + 1} · ${p.modalidad}`,
    );
    return `Rúbrica guardada como versión ${actual.version + 1}.`;
  },
  guardarCatalogo(d, p, ctx) {
    requiere(ctx, ["admin"]);
    d.catalogos[p.clave] = p.valor;
    bit(d, ctx, T.catalogoModificado, "", undefined, p.clave);
    return T.catalogoGuardado;
  },
};
