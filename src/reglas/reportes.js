// ============================================================
// Reglas · construcción de reportes
// construirReporte(db, id, lista, rol): arma tablas y totales de cada reporte (por estado, escuela, modalidad, tiempos, presupuesto...).
// ERS: CU-16 (RF-REP-01 a RF-REP-09).
// ============================================================
import { paramsDe } from "./consultas.js";
import { etapaDe } from "./estados.js";
import { resumenProductos } from "./evaluacion.js";
import { totalSolicitado } from "./presupuesto.js";
import { fechaCorta } from "../utilidades/fechas.js";
import { colones, num } from "../utilidades/formato.js";
import { textos as T } from "../textos/reglas/reportes.js";

// ---------- Reportes (RF-REP-03 a RF-REP-09) ----------
const dias = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));

function cuentaPor(lista, clave) {
  const m = {};
  lista.forEach((p) => {
    const k = clave(p) || "—";
    m[k] = (m[k] || 0) + 1;
  });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

const aprobada = (p) =>
  ["Aprobada", "Aprobada con condiciones"].includes(p.estado) ||
  (p.estado === "Notificada" &&
    ["Aprobada", "Aprobada con condiciones"].includes(p.cie?.resolucion?.resultado));

export function construirReporte(db, id, lista, rol) {
  const pv = lista.filter((p) => p.form);
  const params = (p) => paramsDe(db, p.convocatoriaId);
  const monto = (p) => totalSolicitado(p.form, params(p));
  if (id === "cantidad") {
    const filas = [];
    const claves = {};
    lista.forEach((p) => {
      const k = [p.convocatoriaId, p.escuela, p.modalidad, p.estado].join("|");
      claves[k] = (claves[k] || 0) + 1;
    });
    Object.entries(claves).forEach(([k, n]) => filas.push([...k.split("|"), n]));
    return {
      titulo: T.propuestasPorConvocatoriaInstanciaModalidad,
      cab: [T.convocatoria, T.instancia, T.modalidad, T.estado, T.cantidad],
      filas,
    };
  }
  if (id === "montos") {
    const grupos = {};
    pv.forEach((p) => {
      [["Instancia: " + p.escuela], ["Modalidad: " + p.modalidad]].forEach(([k]) => {
        grupos[k] = grupos[k] || { sol: 0, apr: 0, hs: 0, ha: 0 };
        grupos[k].sol += monto(p);
        grupos[k].hs += resumenProductos(p.form, params(p)).horas;
        if (aprobada(p)) {
          grupos[k].apr += monto(p);
          grupos[k].ha += resumenProductos(p.form, params(p)).horas;
        }
      });
      (p.form.presupuesto || []).forEach((l) => {
        const k = "Objeto de gasto: " + (l.detalle || "—");
        grupos[k] = grupos[k] || { sol: 0, apr: 0, hs: 0, ha: 0 };
        grupos[k].sol += num(l.monto);
        if (aprobada(p)) grupos[k].apr += num(l.monto);
      });
    });
    return {
      titulo: T.montosYHorasSolicitadosY,
      cab: [T.agrupacion, T.montoSolicitado, T.montoAprobado, T.horasSolicitadas, T.horasAprobadas],
      filas: Object.entries(grupos)
        .sort()
        .map(([k, g]) => [k, colones(g.sol), colones(g.apr), g.hs || "—", g.ha || "—"]),
    };
  }
  if (id === "tiempos") {
    const etapas = [
      "Formulación",
      "Vinculación",
      "Comité Técnico",
      "Consejo",
      "VIE",
      "CIE",
      "Resolución",
    ];
    const filas = lista
      .filter((p) => !p.historico)
      .map((p) => {
        const h = [...(p.historialEstados || []), { estado: p.estado, fecha: db.clock, fin: true }];
        const t_ = Object.fromEntries(etapas.map((e) => [e, 0]));
        let aval = 0;
        for (let i = 0; i < h.length - 1; i++) {
          const d = dias(h[i].fecha, h[i + 1].fecha);
          t_[etapas[etapaDe(h[i].estado)]] += d;
          if (h[i].estado === "En trámite de aval") aval += d;
        }
        return [p.id, p.estado, ...etapas.slice(0, 6).map((e) => t_[e]), aval];
      });
    return {
      titulo: T.tiempoPorEtapaDias,
      cab: [
        T.propuesta,
        T.estadoActual,
        T.formulacion,
        T.vinculacion,
        T.comiteTecnico,
        T.consejo,
        T.vie,
        T.cie,
        T.esperaDeAvales,
      ],
      filas,
    };
  }
  if (id === "devueltas") {
    const filas = [];
    lista.forEach((p) =>
      (p.completitud?.devoluciones || []).forEach((d) =>
        filas.push([
          p.id,
          p.titulo,
          fechaCorta(d.fecha),
          d.motivo,
          (d.secciones || []).join(", "),
          d.por,
        ]),
      ),
    );
    const frec = cuentaPor(
      lista
        .flatMap((p) => (p.completitud?.devoluciones || []).flatMap((d) => d.secciones || []))
        .map((s) => ({ s })),
      (x) => x.s,
    );
    return {
      titulo: T.propuestasDevueltasPorFaltantes,
      cab: [T.propuesta, T.titulo, T.fecha, T.motivo, T.secciones, T.registro],
      filas,
      extra: frec.length
        ? `Secciones más frecuentes: ${frec.map(([k, n]) => `${k} (${n})`).join("; ")}`
        : "",
    };
  }
  if (id === "productos") {
    const prod = {};
    pv.forEach((p) => {
      (p.form.productos || []).forEach((x) => {
        const k = `Producto · ${x.tipo.slice(0, 80)}`;
        prod[k] = prod[k] || {};
        prod[k][p.convocatoriaId] = (prod[k][p.convocatoriaId] || 0) + (x.cuenta || 1);
      });
      (p.form.activosPI || []).forEach((x) => {
        const k = `Activo de PI · ${x.tipo}`;
        prod[k] = prod[k] || {};
        prod[k][p.convocatoriaId] = (prod[k][p.convocatoriaId] || 0) + 1;
      });
    });
    return {
      titulo: T.productosAcademicosYActivosDe,
      cab: [T.productoOActivo, T.convocatoria, T.cantidad],
      filas: Object.entries(prod).flatMap(([k, c]) =>
        Object.entries(c).map(([cv_, n]) => [k, cv_, n]),
      ),
    };
  }
  if (id === "evaluaciones") {
    if (!["comite_asistente", "direccion_investigacion", "admin"].includes(rol))
      return { denegado: true, titulo: T.notasPorPersonaEvaluadora };
    const filas = [];
    lista.forEach((p) =>
      (p.evaluaciones || [])
        .filter((e) => e.estado === "Finalizada")
        .forEach((e) =>
          filas.push([
            p.id,
            p.titulo,
            db.users.find((u) => u.id === e.evaluadorId)?.nombre,
            `${e.nota} %`,
            e.resultado,
            p.consolidacion ? `${p.consolidacion.nota} %` : "—",
          ]),
        ),
    );
    return {
      titulo: T.evaluacionesNotaPorPersonaEvaluadora,
      cab: [T.propuesta, T.titulo, T.personaEvaluadora, T.nota, T.resultado, T.notaConsolidada],
      filas,
    };
  }
  return { titulo: "", cab: [], filas: [] };
}
