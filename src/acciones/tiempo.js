// ============================================================
// Acciones · paso del tiempo simulado
// avanzarTiempo(d, ctx): revisa la fecha simulada (d.clock) y aplica lo que corresponda: publicar la convocatoria,
// marcar "No admitida" lo que no se completó al cierre de recepción y enviar los recordatorios de cada etapa.
// ERS: RF-CON-10, RF-NOT-03, RF-FOR-48.
// ============================================================
import { bit, evento, notificar } from "./ayudas.js";
import { paramsDe } from "../reglas/consultas.js";
import { esFinal } from "../reglas/estados.js";
import { equipoMorosos } from "../reglas/morosidad.js";
import { cierreRecepcion } from "../reglas/recepcion.js";
import { diasEntre, fechaCorta } from "../utilidades/fechas.js";
import { textos as T } from "../textos/acciones/tiempo.js";

// Cambios automáticos según las fechas (RF-CON-05, RF-CON-10, RF-CTC-05, RF-MOR-03, RF-NOT-03)
export function avanzarTiempo(d, ctx) {
  const sis = {
    ...ctx,
    user: { nombre: "Sistema", id: "sistema", roles: [] },
    rol: "sistema",
    enNombreDe: "",
    sistema: true,
  };
  d.convocatorias.forEach((c) => {
    const fin = c.cronograma[c.cronograma.length - 2]?.fin;
    if (c.estado === "Programada" && ctx.ahora >= `${c.apertura}T00:00:00`) {
      c.estado = "Publicada";
      bit(d, sis, T.convocatoriaPublicadaAutomaticamente, "", "Programada", "Publicada");
    }
    if (c.estado === "Publicada" && fin && ctx.ahora > `${fin}T23:59:59`) c.estado = "Finalizada";
    const cierre = cierreRecepcion(d, c.id);
    if (cierre && ctx.ahora > cierre && !c.cierreProcesado) {
      c.cierreProcesado = true;
      d.proposals
        .filter((p) => p.convocatoriaId === c.id && !p.historico)
        .forEach((p) => {
          if (p.estado === "Devuelta por faltantes") {
            p.final = true;
            evento(d, p, sis, T.noAdmitidaPorIncompleta, T.llegoElCierreDeRecepcion, "No admitida");
            notificar(
              d,
              sis,
              [p.coordinadorId],
              T.propuestaNoAdmitida,
              `${p.id} no fue reenviada antes del cierre.`,
              p.id,
            );
          } else if (p.estado === "Borrador") {
            p.vencida = true;
            bit(d, sis, T.borradorNoPresentadoAlCierre, p.id);
          } else if (!esFinal(p) && p.form && p.estado !== "Borrador") {
            const mor = equipoMorosos(d, p.form);
            if (
              mor.length &&
              ["Pendiente de dictamen PI", "En revisión de completitud"].includes(p.estado)
            ) {
              p.final = true;
              evento(
                d,
                p,
                sis,
                T.noAdmitidaPorInformesPendientes,
                `Al cierre de recepción figuran con informes pendientes: ${mor.join(", ")}.`,
                "No admitida",
              );
              notificar(
                d,
                sis,
                [p.coordinadorId],
                T.propuestaNoAdmitida,
                `${p.id}: ${mor.join(", ")} figura con informes pendientes ante la VIE.`,
                p.id,
              );
            }
          }
        });
    }
    // Recordatorios antes de cada fecha límite (RF-NOT-03)
    const params = paramsDe(d, c.id);
    const responsables = {
      "Grupo investigador": ["investigador"],
      "Centro de Vinculación": ["vinculacion"],
      "Comité Técnico": ["comite_asistente", "comite_evaluador"],
      "Instancia académica": ["consejo_asistente", "consejo", "direccion_escuela"],
      "Dirección de Investigación": ["direccion_investigacion", "gestora_vie"],
      "Consejo de Investigación y Extensión": ["cie"],
      "Persona coordinadora": ["investigador"],
    };
    if (c.estado === "Publicada" || c.estado === "Programada")
      c.cronograma.forEach((e) => {
        (params.recordatorios || []).forEach((k) => {
          const key = `${c.id}|${e.id}|${k}`;
          const faltan = diasEntre(ctx.ahora.slice(0, 10), e.fin);
          if (
            faltan <= k &&
            faltan >= 0 &&
            !(d.recordatorios || []).includes(key) &&
            responsables[e.responsable]
          ) {
            d.recordatorios = [...(d.recordatorios || []), key];
            notificar(
              d,
              sis,
              responsables[e.responsable],
              `Recordatorio: ${e.etapa}`,
              `Faltan ${faltan} ${faltan === 1 ? "día" : "días"} para la fecha límite (${fechaCorta(e.fin)}).`,
              "",
            );
          }
        });
      });
  });
}
