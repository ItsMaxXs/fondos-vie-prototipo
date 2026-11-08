// ============================================================
// Utilidades · exportaciones del expediente
// Arma el HTML/CSV de una propuesta: formulario, documento del Comité, expediente completo y paquete de exportación.
// ERS: CU-04, CU-09, CU-16 (RF-FOR-47, RF-EVA-13, RF-REP).
// ============================================================
import { nombreInstancia } from "../reglas/alcance.js";
import { paramsDe } from "../reglas/consultas.js";
import { presupuestoPorAnio, presupuestoTexto, totalSolicitado } from "../reglas/presupuesto.js";
import { abrirDocumento, csv, descargar } from "./archivos.js";
import { fechaCorta, fechaHora } from "./fechas.js";
import { colones, esc } from "./formato.js";

// ---------- Exportaciones (REP, CU-16) ----------
function filasFormulario(p) {
  const f = p.form;
  return [
    ["Código", p.id],
    ["Título", f.titulo],
    ["Modalidad", f.modalidad],
    ["Coordinación", p.investigadora],
    ["Instancia", p.escuela],
    ["Inicio", f.inicio],
    ["Finalización", f.fin],
    ["Línea", f.linea],
    ["ODS", (f.ods || []).join(", ")],
    ["Estado", p.estado],
  ];
}

function htmlFormulario(db, p) {
  const f = p.form;
  const params = paramsDe(db, p.convocatoriaId);
  const t_ = (cab, filas) =>
    `<table><tr>${cab.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>${filas.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table>`;
  const pres = presupuestoPorAnio(f, params);
  return `<h2>Datos generales</h2>${t_(["Campo", "Valor"], filasFormulario(p))}
<h2>Resumen</h2><p>${esc(f.resumen)}</p><p><b>Palabras clave:</b> ${esc(f.palabras)}</p><p><b>Abstract:</b> ${esc(f.abstract)}</p>
<h2>Equipo de investigación</h2>${t_(
    ["Nombre", "Instancia", "Rol", "Horas", "Tipo", "Período"],
    (f.equipo || []).map((x) => [
      x.nombre,
      nombreInstancia(db, x.instancia),
      x.rol,
      x.horas,
      x.tipoHora,
      x.periodo,
    ]),
  )}
<h2>Problema y objetivos</h2><p>${esc(f.problema)}</p><p><b>General:</b> ${esc(f.objetivoGeneral)}</p>${t_(
    ["Id", "Objetivo específico"],
    (f.objetivos || []).map((o) => [o.id, o.texto]),
  )}
<h2>Estado del arte</h2><p>${esc(f.estadoArte)}</p><h2>Metodología</h2><p>${esc(f.metodologia)}</p>
<h2>Plan de acción y riesgos</h2>${t_(
    ["Objetivo", "Actividad", "Resultado", "Inicio", "Meses", "Riesgos"],
    (f.plan || []).map((a) => [
      a.objetivoId,
      a.actividad,
      a.resultado,
      a.inicio,
      a.duracion,
      (a.riesgos || []).map((r) => `${r.riesgo} → ${r.mitigacion} (${r.responsable})`).join("; "),
    ]),
  )}
<h2>Presupuesto</h2>${t_(
    ["Año", "Operativo", "Servicios", "Duraderos", "Total"],
    pres.map((x) => [
      x.anio,
      colones(x.operativo),
      colones(x.servicios),
      colones(x.duraderos),
      colones(x.total),
    ]),
  )}
<p><b>Total solicitado:</b> ${colones(totalSolicitado(f, params))}</p>
<h2>Productos comprometidos</h2>${t_(
    ["Producto", "Objetivo"],
    (f.productos || []).map((x) => [x.tipo, x.objetivoId]),
  )}
<h2>Referencias</h2><p>${esc(f.referencias).replace(/\n/g, "<br>")}</p>`;
}

export function htmlComite(db, p) {
  const c = p.consolidacion;
  const comite = db.comites[p.instancia];
  return `<h2>${esc(p.id)} · ${esc(p.titulo)}</h2>
<table><tr><th>Oficio</th><td>${esc(c.oficio)}</td><th>Fecha</th><td>${fechaCorta(c.fecha)}</td></tr>
<tr><th>Nota consolidada</th><td>${c.nota} %</td><th>Resultado</th><td>${esc(c.resultado)}</td></tr></table>
<h2>Calificación por sección</h2><table>${Object.entries(c.subtotales)
    .map(
      ([k, v]) =>
        `<tr><td>${esc(k)}</td><td>${(Math.round(v * 10) / 10).toFixed(1)} puntos</td></tr>`,
    )
    .join("")}</table>
${c.obligatoriosBajos.length ? `<p><b>Criterios obligatorios con promedio inferior a 8:</b> ${c.obligatoriosBajos.map(esc).join("; ")}</p>` : ""}
<h2>Productos comprometidos (sección no sumativa)</h2><p>${c.productos.comprometidos} comprometidos de ${c.productos.minimo} requeridos. ${c.productos.cumple ? "Cumple." : "No cumple."}</p>
<h2>Dictamen</h2><p>${esc(c.dictamen)}</p>
<h2>Evaluaciones individuales</h2><table>${c.detalle.map((d) => `<tr><td>${esc(db.users.find((u) => u.id === d.evaluadorId)?.nombre)}</td><td>${d.nota} %</td></tr>`).join("")}</table>
<div>${(comite?.integrantes || []).map((i) => `<div class='firma'>${esc(db.users.find((u) => u.id === i.userId)?.nombre)}<br>${c.firmas[i.userId] ? "Firmado " + fechaCorta(c.firmas[i.userId]) : "Pendiente de firma"}</div>`).join("")}</div>`;
}

function htmlExpediente(db, p) {
  let h = htmlFormulario(db, p);
  if (p.pi?.dictamen)
    h += `<h2>Dictamen de propiedad intelectual</h2><table>${Object.entries(p.pi.dictamen)
      .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`)
      .join("")}</table>`;
  if (p.consolidacion)
    h += `<h1 style="margin-top:30px">Documento del Comité Técnico</h1>${htmlComite(db, p)}`;
  if (p.consejo?.avales)
    h += `<h2>Avales de las instancias</h2><table>${p.consejo.avales.map((a) => `<tr><td>${esc(nombreInstancia(db, a.instanciaId))}</td><td>${esc(a.estado)}</td><td>${esc(a.articulo || "")} ${a.fechaAcuerdo ? fechaCorta(a.fechaAcuerdo) : ""}</td></tr>`).join("")}</table>`;
  if (p.vie?.dictamenDI)
    h += `<h2>Dictamen de la Dirección de Investigación</h2><p>${esc(p.vie.dictamenDI.oficio)}: ${esc(p.vie.dictamenDI.resultado)}</p>`;
  if (p.cie?.resolucion)
    h += `<h2>Resolución del CIE</h2><p>${esc(p.cie.resolucion.numero)}: ${esc(p.cie.resolucion.resultado)}. ${esc(p.cie.resolucion.justificacion)}</p>`;
  h += `<h2>Línea de tiempo</h2><table>${(p.timeline || []).map((t_) => `<tr><td>${fechaHora(t_.fecha)}</td><td>${esc(t_.titulo)}</td><td>${esc(t_.detalle)}</td></tr>`).join("")}</table>`;
  return h;
}

export function exportarPDF(db, p) {
  abrirDocumento(`Expediente ${p.id}`, htmlExpediente(db, p));
}

export function exportarCSV(db, p) {
  descargar(
    `${p.id}.csv`,
    csv([
      ["Campo", "Valor"],
      ...filasFormulario(p),
      ["Total solicitado", presupuestoTexto(p.form, paramsDe(db, p.convocatoriaId))],
    ]),
    "text/csv",
  );
}

export function exportarPaquete(db, p) {
  descargar(
    `Expediente_${p.id}.html`,
    `<!doctype html><meta charset="utf-8"><title>Expediente ${p.id}</title><body style="font-family:serif;max-width:800px;margin:30px auto"><h1>Expediente ${esc(p.id)}</h1>${htmlExpediente(db, p)}</body>`,
    "text/html",
  );
}
