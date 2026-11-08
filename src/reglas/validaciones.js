// ============================================================
// Reglas · validación del formulario
// validarPropuesta(formulario, contexto) devuelve la lista de errores y avisos por paso, con la regla del ERS que incumple.
// Es la única fuente de las validaciones: la pantalla y el envío usan esta misma función.
// ERS: CU-04, CU-05 (RF-FOR-07 a RF-FOR-47, RN-xx).
// ============================================================
import { PREGUNTAS_ETICA } from "../datos/catalogos.js";
import { esDT, esFort } from "../datos/modalidades.js";
import { resumenProductos } from "./evaluacion.js";
import { norm } from "./formulario.js";
import { buscarMoroso } from "./morosidad.js";
import { aniosDe, mesesProyecto, presupuestoPorAnio } from "./presupuesto.js";
import { colones, lineas, num, palabras } from "../utilidades/formato.js";
import { textos as T } from "../textos/reglas/validaciones.js";

// ---------- Motor de validación ----------
// Devuelve [{ paso, nivel: "error" | "aviso", msg, regla }]
export function validarPropuesta(f, ctx) {
  const { db, params, propId } = ctx;
  const out = [];
  const err = (paso, msg, regla) => out.push({ paso, nivel: "error", msg, regla });
  const avi = (paso, msg, regla) => out.push({ paso, nivel: "aviso", msg, regla });
  const m = f.modalidad;
  const fort = esFort(m);
  const dt = esDT(m);
  const anios = aniosDe(f);
  const meses = mesesProyecto(f);

  // Paso 1 · datos generales y preguntas (RF-FOR-07, FOR-08, FOR-10)
  if (!f.titulo?.trim()) err(0, T.indiqueElNombreDelProyecto);
  if (!f.inicio || !f.fin) err(0, T.indiqueLasFechasDeInicio);
  else if (new Date(f.fin) <= new Date(f.inicio)) err(0, T.laFechaDeFinalizacionDebe);
  else {
    const max = params.duracionMaxAnios[m] || 2;
    if (meses > max * 12)
      err(
        0,
        `La duración (${meses} meses) supera el máximo de ${max} ${max === 1 ? "año" : "años"} para ${m}. Esta convocatoria no admite ampliaciones.`,
        "RN-09",
      );
  }
  if (!f.instancia) err(0, T.seleccioneLaInstanciaAcademicaCoordinadora);
  if (!f.linea?.trim()) err(0, T.indiqueLaLineaDeInvestigacion);
  if (!(f.ods || []).length) err(0, T.seleccioneAlMenosUnOds);
  const q = f.q;
  if (q.fuentes.r === "Sí") {
    if (!q.fuentes.detalle.trim()) err(0, T.pregunta1DetalleLaEntidad);
    avi(0, T.pregunta1LasIniciativasPresentadas, "RN-04");
  }
  if (q.remunerada.r === "Sí") err(0, T.pregunta10LasIniciativasDe, "RN-05");
  if (q.continuidad.r === "Sí" && !q.continuidad.proyecto.trim())
    err(0, T.pregunta2IndiqueElProyecto);
  if (q.prioridad.r === "Sí" && !q.prioridad.detalle.trim()) err(0, T.pregunta3IndiqueElProblema);
  if (q.convenioMarco.r === "Sí" && !q.convenioMarco.nombre.trim())
    err(0, T.pregunta5IndiqueElNombre);
  if (
    q.grado.r !== "No" &&
    !(q.grado.candidato.trim() && q.grado.programa.trim() && q.grado.universidad.trim())
  )
    err(0, T.pregunta6CompleteLaPersona);
  if (q.confidencial.r === "Sí" && !q.confidencial.detalle.trim()) err(0, T.pregunta7IndiqueElTipo);
  if (q.pi.r === "Sí" && !q.pi.descripcion.trim()) err(0, T.pregunta8DescribaDeForma, "RF-FOR-34");
  if (!dt && q.pi.r === "Sí") avi(0, T.despuesDelEnvioLaPropuesta, "RF-FOR-34");
  if (dt) avi(0, T.enDesarrolloTecnologicoElDictamen, "RN-25");
  // TRL (RF-FOR-33)
  if (!fort) {
    const rango = params.trl[m];
    const ini = Number(f.trlInicial),
      fin = Number(f.trlFinal);
    if (!ini || !fin) err(0, T.indiqueElTrlInicialY, "RN-24");
    else {
      if (fin < ini) err(0, T.elTrlEsperadoNoPuede, "RN-24");
      if (rango && (ini < rango[0] || fin > rango[1]))
        avi(
          0,
          `El TRL (${ini} a ${fin}) no es coherente con el rango de ${m}: TRL ${rango[0]} a ${rango[1]}.`,
          "RN-24",
        );
    }
  }

  // Paso 2 · resumen (RF-FOR-09)
  const nRes = palabras(f.resumen);
  if (!nRes) err(1, T.escribaElResumenDelProyecto);
  else if (nRes > params.resumenMaxPalabras)
    err(1, `El resumen tiene ${nRes} palabras y el máximo es ${params.resumenMaxPalabras}.`);
  const nPal = String(f.palabras || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean).length;
  if (nPal < params.palabrasClave[0] || nPal > params.palabrasClave[1])
    err(
      1,
      `Indique entre ${params.palabrasClave[0]} y ${params.palabrasClave[1]} palabras clave separadas por comas (hay ${nPal}).`,
    );
  if (!f.abstract?.trim()) err(1, T.escribaElAbstractEnIngles);
  const nKey = String(f.keywords || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean).length;
  if (nKey < params.palabrasClave[0] || nKey > params.palabrasClave[1])
    err(
      1,
      `Indique entre ${params.palabrasClave[0]} y ${params.palabrasClave[1]} keywords en inglés (hay ${nKey}).`,
    );

  // Paso 3 · equipo (RF-FOR-11 a FOR-17, MOR-02, FOR-51)
  const eq = f.equipo || [];
  if (!eq.length) err(2, T.agregueAlMenosUnaPersona);
  let horasTotales = 0,
    horasVIE = 0;
  eq.forEach((p, i) => {
    const et = `Fila ${i + 1}${p.nombre ? ` (${p.nombre})` : ""}`;
    const h = num(p.horas);
    horasTotales += h;
    if (["VIE", "VIE-Centros", "CONS"].includes(p.tipoHora)) horasVIE += h;
    if (!p.nombre?.trim() || !p.instancia || !p.rol || !p.tipoHora || !p.periodo?.trim() || !h)
      err(
        2,
        `${et}: complete nombre, instancia, rol, horas semanales, tipo de hora y período de nombramiento.`,
      );
    const minimo = p.tipoHora === "REC" ? params.horasMinPersonaREC : params.horasMinPersona;
    if (h && h < minimo)
      err(
        2,
        `${et}: la dedicación mínima es de ${minimo} horas semanales${p.tipoHora === "REC" ? " para horas REC" : ""}.`,
        "RN-11",
      );
    if (p.tipoHora === "CONS" && !p.titularCons?.trim())
      err(
        2,
        `${et}: las horas CONS requieren indicar la persona investigadora consolidada titular.`,
        "RF-FOR-12",
      );
    if (p.esApoyo) {
      if (p.tipoHora !== "REC" || h < params.horasApoyoREC[0] || h > params.horasApoyoREC[1])
        err(
          2,
          `${et}: el personal de apoyo participa con horas REC de ${params.horasApoyoREC[0]} a ${params.horasApoyoREC[1]} por semana.`,
          "RN-17",
        );
      if (!p.avalApoyo)
        err(
          2,
          `${et}: el personal de apoyo requiere el aval escrito de su jefatura o Consejo.`,
          "RN-17",
        );
    }
    const mor = buscarMoroso(db, p);
    if (mor)
      avi(
        2,
        `${p.nombre} figura con informes pendientes ante la VIE (${mor.detalle}). Solo pueden participar personas al día al cierre de recepción.`,
        "RN-03",
      );
  });
  if (eq.length && !fort && horasVIE < params.horasMinProyecto)
    err(
      2,
      `Los proyectos requieren al menos ${params.horasMinProyecto} horas semanales VIE, VIE-Centros o CONS en total (hay ${horasVIE}).`,
      "RN-11",
    );
  if (eq.length && fort) {
    if (horasTotales > params.horasMaxFortalecimiento)
      err(
        2,
        `Una actividad de fortalecimiento admite como máximo ${params.horasMaxFortalecimiento} horas semanales (hay ${horasTotales}).`,
        "RN-11",
      );
    if (horasVIE < params.horasMinFortVIE)
      err(
        2,
        `Se requieren al menos ${params.horasMinFortVIE} horas VIE, VIE-Centros o CONS (hay ${horasVIE}).`,
        "RN-11",
      );
  }
  // Una persona en una sola actividad de fortalecimiento (RN-12) y en varias propuestas (FOR-51)
  const otras = (db.proposals || []).filter(
    (x) => x.id !== propId && !x.historico && x.estado !== "No admitida",
  );
  eq.forEach((p) => {
    if (!p.nombre?.trim()) return;
    const clave = (x) =>
      norm(x.nombre) === norm(p.nombre) || (p.cedula && x.cedula && x.cedula === p.cedula);
    const en = otras.filter((o) => (o.form?.equipo || []).some(clave));
    if (fort && en.some((o) => esFort(o.form?.modalidad)))
      err(
        2,
        `${p.nombre} ya participa en otra actividad de fortalecimiento de esta convocatoria.`,
        "RN-12",
      );
    else if (en.length)
      avi(
        2,
        `${p.nombre} aparece también en ${en.map((o) => o.id).join(", ")}. La gestora corroborará la información de los proyectos.`,
        "RF-FOR-51",
      );
  });
  // Horas VIE por instancia (RF-FOR-15)
  const horasInst = {};
  [...eq].forEach((p) => {
    if (["VIE", "VIE-Centros"].includes(p.tipoHora))
      horasInst[p.instancia] = (horasInst[p.instancia] || 0) + num(p.horas);
  });
  Object.entries(horasInst).forEach(([ins, h]) => {
    const info = db.instancias.find((x) => x.id === ins);
    if (!info) return;
    const usadas = otras.reduce(
      (s, o) =>
        s +
        (o.form?.equipo || [])
          .filter((e) => e.instancia === ins && ["VIE", "VIE-Centros"].includes(e.tipoHora))
          .reduce((a, e) => a + num(e.horas), 0),
      0,
    );
    const asignadas = info.horasVIE + info.horasVIECentros;
    if (usadas + h > asignadas)
      avi(
        2,
        `Las horas VIE y VIE-Centros solicitadas (${usadas + h}) superan las asignadas a ${info.nombre} (${asignadas}). La diferencia debe cubrirse con horas REC, VIESA, DOC o CONS.`,
        "RF-FOR-15",
      );
  });
  (f.colaboradores || []).forEach((c, i) => {
    if (!c.nombre?.trim()) err(2, `Colaborador ${i + 1}: indique el nombre.`);
    if (!c.carta)
      err(
        2,
        `${c.nombre || `Colaborador ${i + 1}`}: falta la carta de compromiso con sus actividades.`,
        "RN-18",
      );
    const enPlan = (f.plan || []).some((a) =>
      (a.participantes || []).some((n) => norm(n) === norm(c.nombre)),
    );
    if (c.nombre?.trim() && !enPlan)
      err(
        6,
        `${c.nombre}: su rol debe quedar descrito en el plan de acción (agréguelo como participante de una actividad).`,
        "RN-18",
      );
  });
  if (f.sectorSocio?.participa === "Sí") {
    if (!(f.sectorSocio.orgs || []).length) err(2, T.indiqueLasOrganizacionesDelSector, "RN-28");
    (f.sectorSocio.orgs || []).forEach((o, i) => {
      if (!o.nombre?.trim() || !o.alcance?.trim() || !o.carta)
        err(
          2,
          `Organización ${i + 1}: complete el nombre, el alcance y adjunte la carta de compromiso.`,
          "RN-28",
        );
    });
  }
  if (
    !eq.some((p) => /estudiante/i.test(p.rol)) &&
    !(f.becas || []).some((b) => num(b.horasSemana) > 0) &&
    !fort
  )
    avi(2, T.debeHaberParticipacionEstudiantilComo, "RN-27");

  // Paso 4 · problema y objetivos (RF-FOR-21)
  if (!f.problema?.trim()) err(3, T.describaElProblemaDeInvestigacion);
  if (!f.objetivoGeneral?.trim()) err(3, T.escribaElObjetivoGeneral);
  if (!(f.objetivos || []).length || (f.objetivos || []).some((o) => !o.texto?.trim()))
    err(3, T.escribaAlMenosUnObjetivo);
  if (!f.estadoArte?.trim()) err(4, T.escribaElEstadoDelArte);
  if (!f.metodologia?.trim()) err(5, T.describaLaMetodologia);

  // Paso 7 · plan de acción y riesgos (RF-FOR-22, FOR-23, FOR-25, FOR-36)
  const plan = f.plan || [];
  if (!plan.length) err(6, T.registreAlMenosUnaActividad);
  plan.forEach((a, i) => {
    const et = `Actividad ${i + 1}${a.actividad ? ` (${a.actividad.slice(0, 40)})` : ""}`;
    if (
      !a.objetivoId ||
      !a.actividad?.trim() ||
      !a.resultado?.trim() ||
      !(a.participantes || []).length ||
      !a.inicio ||
      !a.duracion
    )
      err(
        6,
        `${et}: complete el objetivo, la actividad, el resultado, los participantes, el mes de inicio y la duración.`,
      );
    else if (meses && num(a.inicio) + num(a.duracion) - 1 > meses)
      avi(
        6,
        `${et}: termina en el mes ${num(a.inicio) + num(a.duracion) - 1} y el proyecto dura ${meses} meses.`,
      );
    const rs = a.riesgos || [];
    if (!rs.length) err(6, `${et}: debe identificarse al menos un riesgo.`, "RN-23");
    rs.forEach((r) => {
      if (!r.riesgo?.trim() || !r.mitigacion?.trim() || !r.responsable?.trim())
        err(
          6,
          `${et}: cada riesgo necesita descripción, medida de mitigación y responsable de la gestión.`,
          "RN-23",
        );
    });
  });
  (f.objetivos || []).forEach((o) => {
    if (o.texto?.trim() && plan.length && !plan.some((a) => a.objetivoId === o.id))
      avi(6, `El objetivo ${o.id} no tiene actividades en el plan de acción.`);
  });
  if (f.giras.proyecta === "Sí" && !num(f.giras.cantidad))
    err(6, T.indiqueLaProyeccionDeLa, "RN-16");
  if (f.giras.proyecta === "Sí" && !plan.some((a) => a.gira)) err(6, T.marqueEnElPlanDe, "RN-16");
  const requierePermisos = PREGUNTAS_ETICA.some(([k]) => f.etica[k] === "Sí");
  if (requierePermisos && !plan.some((a) => (a.riesgos || []).some((r) => r.permiso)))
    err(6, T.hayPermisosEticosORegulatorios, "RN-22");

  // Paso 8 · presupuesto y financiamiento (RF-FOR-26 a FOR-33, FOR-48 a FOR-50)
  const filas = presupuestoPorAnio(f, params);
  const total = filas.reduce((s, x) => s + x.total, 0);
  if (!total) err(7, T.registreElPresupuestoSolicitadoA);
  const maxM = params.montoMax[m];
  if (maxM) {
    if (fort && total > maxM)
      err(
        7,
        `El monto solicitado (${colones(total)}) supera el máximo de ${colones(maxM)} en total para fortalecimiento.`,
        "RN-10",
      );
    if (!fort)
      filas.forEach(
        (x) =>
          x.total > maxM &&
          err(
            7,
            `Año ${x.anio}: el monto (${colones(x.total)}) supera el máximo de ${colones(maxM)} por año.`,
            "RN-10",
          ),
      );
  }
  (f.presupuesto || []).forEach((l) => {
    if (l.tipo === "X") err(7, T.elTransporteInstitucionalNoSe, "RN-16");
    if (num(l.monto) > 0 && !l.justificacion?.trim())
      err(7, `Año ${l.anio}, ${l.detalle}: justifique el requerimiento.`, "RF-FOR-31");
    if (l.tipo === "D" && Number(l.anio) !== 1 && num(l.monto) > 0)
      err(
        7,
        `${l.detalle}: los bienes duraderos y las licencias de software se formulan únicamente en el primer año de ejecución.`,
        "RN-13",
      );
    if (l.tipo === "S") {
      if (fort) err(7, T.losServiciosProfesionalesExternosNo, "RN-15");
      else if (!l.perfil?.trim())
        err(7, `${l.detalle}: indique el perfil de la persona por contratar.`, "RN-15");
    }
  });
  if (!fort)
    filas.forEach((x) => {
      if (x.horasBeca < params.becasHorasMin)
        err(
          7,
          `Año ${x.anio}: el presupuesto operativo debe incluir al menos ${params.becasHorasMin} horas semanales de becas de estudiante asistente especial (hay ${x.horasBeca}).`,
          "RN-14",
        );
      if (x.operativo > 0 && x.servicios > (x.operativo * params.serviciosProfPct) / 100)
        err(
          7,
          `Año ${x.anio}: los servicios profesionales externos (${colones(x.servicios)}) superan el ${params.serviciosProfPct} % del presupuesto operativo (${colones(x.operativo)}).`,
          "RN-15",
        );
    });
  (f.becas || []).forEach((b) => {
    if (num(b.meses) > params.mesesBecaMax)
      err(
        7,
        `Año ${b.anio}: el nombramiento de estudiante asistente puede hacerse por un máximo de ${params.mesesBecaMax} meses por año.`,
        "RN-31",
      );
  });
  (f.financiamiento || []).forEach((r) => {
    const monto = num(r.anio1) + num(r.anio2) + num(r.anio3);
    if (monto > 0 && !(r.oficio?.trim() && r.entidad?.trim()))
      err(
        7,
        `${r.tipo}: indique el número de oficio y la entidad emisora, y adjunte el oficio firmado.`,
        "RN-21",
      );
  });

  // Paso 9 · productos (RF-FOR-18 a FOR-20)
  const prod = resumenProductos(f, params);
  const listaDt = dt ? (f.productos || []).filter((p) => p.academico !== false) : f.productos || [];
  const cant = listaDt.reduce((s, p) => s + (p.cuenta || 1), 0);
  if (cant < prod.minimo)
    err(
      8,
      `Debe comprometer al menos ${prod.minimo} ${prod.minimo === 1 ? "producto académico" : "productos académicos"} (1 por cada ${params.horasPorProducto} horas semanales, redondeado hacia arriba; hay ${prod.horas} horas y ${cant} comprometidos).`,
      "RN-08",
    );
  (f.productos || []).forEach(
    (p) =>
      !p.objetivoId &&
      err(8, `Asocie el producto «${p.tipo.slice(0, 50)}» a un objetivo específico.`, "RF-FOR-19"),
  );
  if (dt && !(f.activosPI || []).length) err(8, T.desarrolloTecnologicoExigeAlMenos, "RN-26");

  // Paso 10 · resguardo, divulgación y ética (RF-FOR-35, FOR-38, FOR-39)
  if (!f.resguardoRepositorio || !f.resguardoSoftware)
    err(9, T.acepteExpresamenteLosDosCompromisos, "RN-29");
  if (!f.divulgacion?.trim() || !f.canales?.trim() || !f.socializacion?.trim())
    err(10, T.completeLaEstrategiaDeDivulgacion);
  const sinContestar = PREGUNTAS_ETICA.filter(([k]) => !f.etica[k]);
  if (sinContestar.length) err(11, T.respondaTodasLasPreguntasDe);
  if (!requierePermisos) {
    if (String(f.etica.exencion || "").trim().length < 30)
      err(11, T.justifiquePorQueLaPropuesta, "RN-22");
  } else if (!f.etica.ente) err(11, T.indiqueElEnteAnteEl, "RN-22");

  // Pasos 13 a 15 · hoja de ruta, referencias y declaración
  if (!f.hojaRuta?.trim()) err(12, T.escribaLaHojaDeRuta);
  if (lineas(f.referencias).length < params.refsMin)
    err(
      13,
      `Incluya al menos ${params.refsMin} referencias primarias, una por línea (hay ${lineas(f.referencias).length}).`,
      "RF-FOR-21",
    );
  const d = f.declaracion || {};
  if (!d.acepta) err(14, T.acepteLaDeclaracionJurada);
  if (!/^\d-\d{4}-\d{4}$/.test(String(d.cedula || "").trim())) err(14, T.escribaElNumeroDeCedula);
  if (!d.firma?.trim()) err(14, T.escribaSuFirmaDigital);

  // Paso 16 · documentos de respaldo (RF-FOR-42)
  const doc = f.documentos || {};
  const req = [
    ["Plan de acción y gestión de riesgos (XLSX)", true],
    ["Presupuesto detallado (XLSX)", true],
    [
      "Cartas de compromiso",
      (f.colaboradores || []).length > 0 || (f.sectorSocio?.orgs || []).length > 0,
    ],
    [
      "Oficios de financiamiento",
      (f.financiamiento || []).some((r) => num(r.anio1) + num(r.anio2) + num(r.anio3) > 0),
    ],
    ["Aval de jefatura (personal de apoyo REC)", eq.some((p) => p.esApoyo)],
  ];
  req.forEach(
    ([t_, obligatorio]) =>
      obligatorio && !doc[t_]?.adjunto && err(15, `Adjunte el documento «${t_}».`, "RF-FOR-42"),
  );
  return out;
}
