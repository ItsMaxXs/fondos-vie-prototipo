// ============================================================
// Datos · base inicial de demostración
// dbBase: estructura vacía de la base (convocatorias, usuarios, comités, bitácora...). dbInicial: construye las propuestas de ejemplo EJECUTANDO las mismas acciones de la aplicación, así siempre cumplen las reglas del ERS.
// HITOS: hasta qué punto del flujo avanza cada propuesta de ejemplo.
// ============================================================
import { ejecutarAccion } from "../acciones/ejecutar.js";
import { CATALOGOS_BASE, INSTANCIAS_BASE } from "./catalogos.js";
import { CRONOGRAMA_2027, ETAPA_FORMULACION } from "./cronograma.js";
import { formEjemplo } from "./formularioEjemplo.js";
import { MODALIDADES } from "./modalidades.js";
import { PARAMS_2027 } from "./parametros.js";
import { USUARIOS_BASE } from "./usuarios.js";
import { nombreInstancia } from "../reglas/alcance.js";
import { requierePI } from "../reglas/consultas.js";
import { criteriosDe, normalizarRubrica, rubricaBaseDe } from "../reglas/evaluacion.js";
import { formVacio } from "../reglas/formulario.js";
import { recalcularMorosidad } from "../reglas/morosidad.js";
import { totalSolicitado } from "../reglas/presupuesto.js";
import { colones, pad } from "../utilidades/formato.js";
import { clone } from "../utilidades/ids.js";

function dbBase() {
  const convs = [
    {
      id: "VIE-2027-01",
      nombre: "Convocatoria Interna para Investigación – Fondos VIE 2027",
      descripcion:
        "Convocatoria institucional para actividades de fortalecimiento, proyectos de investigación básica y aplicada y desarrollo tecnológico con recursos VIE.",
      apertura: "2026-07-28",
      cierre: "2026-08-21",
      estado: "Publicada",
      cronograma: CRONOGRAMA_2027.map((e) => ({ ...e })),
      cambios: [],
    },
    {
      id: "VIE-2026-02",
      nombre: "Convocatoria de Fortalecimiento de Grupos de Investigación 2026",
      descripcion: "Edición anterior, ya finalizada.",
      apertura: "2025-07-28",
      cierre: "2025-08-22",
      estado: "Finalizada",
      cronograma: CRONOGRAMA_2027.map((e) => ({
        ...e,
        inicio: e.inicio.replace("2026", "2025").replace("2027", "2026"),
        fin: e.fin.replace("2026", "2025").replace("2027", "2026"),
      })),
      cambios: [],
      cierreProcesado: true,
    },
    {
      id: "VIE-2027-02",
      nombre: "Convocatoria de Proyectos Interdisciplinarios 2027",
      descripcion: "Borrador de una futura convocatoria.",
      apertura: "2026-10-15",
      cierre: "2026-12-15",
      estado: "Borrador",
      cronograma: CRONOGRAMA_2027.map((e) => ({ ...e })),
      cambios: [],
    },
  ];
  convs[2].cronograma.find((e) => e.etapa === ETAPA_FORMULACION).inicio = "2026-10-15";
  convs[2].cronograma.find((e) => e.etapa === ETAPA_FORMULACION).fin = "2026-12-15";
  const rubricas = {},
    params = {};
  convs.forEach((c) => {
    params[c.id] = clone(PARAMS_2027);
    rubricas[c.id] = {};
    MODALIDADES.forEach(
      (m) => (rubricas[c.id][m] = { version: 1, secciones: normalizarRubrica(rubricaBaseDe(m)) }),
    );
  });
  const integ = (userId, coordina = false) => ({
    userId,
    coordina,
    electo: true,
    desde: "2026-01-01",
    hasta: "2027-12-31",
    activo: true,
  });
  return {
    version: 1,
    clock: "2026-07-29T08:00:00",
    convocatorias: convs,
    params,
    rubricas,
    catalogos: clone(CATALOGOS_BASE),
    instancias: clone(INSTANCIAS_BASE),
    users: clone(USUARIOS_BASE),
    comites: {
      COMP: {
        tamano: 5,
        asistenteId: "u_asc",
        integrantes: [
          integ("u_ev1", true),
          integ("u_dir"),
          integ("u_ev3"),
          integ("u_ev4"),
          integ("u_ev5"),
        ],
      },
    },
    morosos: [
      {
        id: "m_1",
        nombre: "Mario Rojas",
        cedula: "3-0321-0654",
        proyecto: "VIE-2024-018",
        detalle: "Informe final del proyecto VIE-2024-018 sin entregar",
        fecha: "2026-06-10T09:00:00",
        estado: "Pendiente",
        porRegistro: "Rodrigo Fallas",
      },
      {
        id: "m_2",
        nombre: "David Mora",
        cedula: "5-0222-0333",
        proyecto: "VIE-2023-007",
        detalle: "Producto académico comprometido sin evidencia de sometimiento",
        fecha: "2026-05-02T09:00:00",
        estado: "Pendiente",
        porRegistro: "Rodrigo Fallas",
      },
      {
        id: "m_3",
        nombre: "Ana Solano",
        cedula: "6-0444-0555",
        proyecto: "VIE-2022-011",
        detalle: "Informe final entregado fuera de plazo",
        fecha: "2026-03-15T09:00:00",
        estado: "Regularizado",
        porRegistro: "Rodrigo Fallas",
        regularizado: {
          fecha: "2026-04-20T10:00:00",
          soporte: "Oficio DI-005-2026",
          por: "Rodrigo Fallas",
        },
      },
    ],
    proposals: [],
    notifications: [],
    correos: [],
    bitacora: [],
    recordatorios: [],
    contador: {
      prop: 0,
      borrador: 0,
      oficioComite: 40,
      oficioAval: 116,
      oficioDI: 10,
      resolucion: 83,
      notificacion: 452,
    },
    ajustes: { sesionMinutos: 30 },
  };
}

// Puntajes de demostración para una rúbrica
function puntajesDemo(rub, perfil = "bueno") {
  const crit = criteriosDe(rub);
  const scores = {},
    reasons = {};
  crit.forEach((c, i) => {
    scores[c.id] = perfil === "excelente" ? 10 : i % 3 === 0 ? 10 : 8;
    if (perfil === "oblig_bajo" && c.required && i === crit.findIndex((x) => x.required))
      scores[c.id] = 6;
    reasons[c.id] =
      c.required || perfil === "oblig_bajo"
        ? "La evidencia del expediente respalda esta valoración."
        : "";
  });
  return { scores, reasons };
}

const HITOS = [
  "enviada",
  "pi",
  "evaluacion",
  "evaluada",
  "consejo",
  "sesion",
  "avalada",
  "comunicada",
  "recibida",
  "dictamenDI",
  "listaCIE",
  "enResolucion",
  "resuelta",
  "notificada",
];

export function dbInicial() {
  let db = dbBase();
  const ejecutar = (nombre, payload, userId, rol, iso) => {
    if (iso) db.clock = iso;
    const user = db.users.find((u) => u.id === userId);
    const r = ejecutarAccion(db, nombre, payload, { user, rol });
    if (r.error) {
      console.warn("[semilla]", nombre, r.error);
      return null;
    }
    db = r.db;
    return r.resultado;
  };
  const dictamenPI = (n) => ({
    potencial: "Sí",
    innovacion: "Sí",
    tipoActivo: "Desarrollo de Software",
    tipoPI: "Derecho de autor sobre software y posible secreto empresarial",
    novedad: "Integración de componentes orientada al contexto de uso.",
    titularidad: "Resultados desarrollados en el marco institucional del TEC.",
    divulgacion:
      "No divulgar el código fuente ni la arquitectura detallada antes de definir la estrategia de protección.",
    confidencialidad: "No se reporta información sensible de terceros.",
    analisis:
      "La propuesta presenta resultados con potencial de protección asociados al software y a la documentación técnica.",
    recomendaciones: "Registrar autoría y conservar las evidencias de desarrollo.",
    oficio: `CV-${pad(20 + n)}-2026`,
    fecha: "2026-08-12",
  });
  const avanzar = (id, hasta, inv, opts = {}) => {
    const i = HITOS.indexOf(hasta);
    const p = () => db.proposals.find((x) => x.id === id);
    const t = (dia, h = 9) => `2026-08-${pad(dia, 2)}T${pad(h, 2)}:00:00`;
    if (i >= 1 && p().form && requierePI(p().form)) {
      ejecutar("iniciarRevisionPI", { id }, "u_vin", "vinculacion", t(5));
      ejecutar(
        "emitirDictamenPI",
        { id, dictamen: dictamenPI(Number(id.slice(-3))) },
        "u_vin",
        "vinculacion",
        t(6),
      );
    }
    if (i >= 2) {
      const checks = Object.fromEntries(
        [
          "Formulario de propuesta",
          "Plan de acción y riesgos",
          "Presupuesto",
          "Cartas de compromiso",
          "Oficios de financiamiento",
          "Dictamen de PI o constancia de no requerido",
        ].map((k) => [k, true]),
      );
      ejecutar("enviarAEvaluacion", { id, checks }, "u_asc", "comite_asistente", t(7));
      const rub = db.rubricas["VIE-2027-01"][p().form.modalidad].secciones;
      const evaluadores = p().evaluaciones.map((e) => e.evaluadorId);
      const cuantos = opts.evalHasta ?? evaluadores.length;
      evaluadores.slice(0, cuantos).forEach((eid, k) => {
        const pz = puntajesDemo(
          rub,
          opts.perfil === "oblig_bajo" && k < 3 ? "oblig_bajo" : k % 2 ? "bueno" : "excelente",
        );
        ejecutar(
          "guardarEvaluacion",
          { id, evaluadorId: eid, ...pz },
          eid,
          "comite_evaluador",
          t(8),
        );
        ejecutar(
          "finalizarEvaluacion",
          { id, evaluadorId: eid, ...pz },
          eid,
          "comite_evaluador",
          t(8, 15),
        );
      });
      if (opts.evalParcial) {
        const eid = evaluadores[cuantos];
        const pz = puntajesDemo(rub);
        const parcial = {
          scores: Object.fromEntries(Object.entries(pz.scores).slice(0, 5)),
          reasons: pz.reasons,
        };
        ejecutar(
          "guardarEvaluacion",
          { id, evaluadorId: eid, ...parcial },
          eid,
          "comite_evaluador",
          t(9),
        );
      }
    }
    if (i >= 3)
      ejecutar(
        "consolidarComite",
        { id, confirmarDiferencia: true },
        "u_asc",
        "comite_asistente",
        t(10),
      );
    if (i >= 4) {
      ejecutar("firmarDocumentoComite", { id }, "u_ev1", "comite_evaluador", t(10, 11));
      ejecutar("enviarAlConsejo", { id }, "u_asc", "comite_asistente", t(10, 14));
    }
    if (i >= 5 && p().estado === "En trámite de aval") {
      if (opts.consulta) {
        ejecutar(
          "registrarSesion",
          {
            id,
            tipo: "Consulta formal",
            numero: "CF-04",
            fecha: "2026-08-12",
            plazo: "2026-08-20T17:00:00",
          },
          "u_asco",
          "consejo_asistente",
          t(11),
        );
        ejecutar(
          "abrirConsulta",
          { id, plazo: "2026-08-20T17:00:00" },
          "u_asco",
          "consejo_asistente",
          t(11, 10),
        );
        ejecutar("votarConsulta", { id, voto: "Aprobar" }, "u_ev1", "consejo", t(11, 12));
        ejecutar("votarConsulta", { id, voto: "Aprobar" }, "u_ev3", "consejo", t(11, 13));
      } else
        ejecutar(
          "registrarSesion",
          { id, tipo: "Ordinaria", numero: "S-31", fecha: "2026-08-12" },
          "u_asco",
          "consejo_asistente",
          t(11),
        );
    }
    if (i >= 6 && p().estado === "En trámite de aval") {
      p().consejo.avales.forEach((a) =>
        ejecutar(
          "registrarAval",
          {
            id,
            instanciaId: a.instanciaId,
            votos: { favor: 5, contra: 0, abst: 1 },
            articulo: "Artículo 7",
            fechaAcuerdo: "2026-08-12",
            resultado: "Aprobado",
            justificacion:
              "La propuesta cumple los criterios de pertinencia y viabilidad de la instancia.",
            adjunto: true,
            contenido: { propuesta: true, personas: true, titularCons: true, calificacion: true },
          },
          "u_asco",
          "consejo_asistente",
          t(12),
        ),
      );
    }
    if (i >= 7) ejecutar("comunicarAvalAVIE", { id }, "u_dir", "direccion_escuela", t(12, 14));
    if (i >= 8) ejecutar("confirmarRecepcionVIE", { id }, "u_gest", "gestora_vie", t(13));
    if (i >= 9) {
      const v = {
        morosidad: { ok: true },
        riesgos: { ok: true },
        estudiantes: { ok: true },
        etica: { ok: true },
        documentacion: { ok: true },
      };
      ejecutar(
        "emitirDictamenDI",
        { id, verificaciones: v },
        "u_di",
        "direccion_investigacion",
        t(13, 11),
      );
    }
    if (i >= 10) {
      ejecutar(
        "guardarRevisionVIE",
        {
          id,
          checks: {
            Formulario: true,
            "Plan de riesgos": true,
            Presupuesto: true,
            Documentos: true,
          },
        },
        "u_gest",
        "gestora_vie",
        t(13, 12),
      );
      ejecutar("marcarListaCIE", { id }, "u_gest", "gestora_vie", t(13, 13));
    }
    if (i >= 11) ejecutar("abrirResolucionCIE", { id }, "u_cie", "cie", t(13, 15));
    if (i >= 12)
      ejecutar(
        "resolverCIE",
        {
          id,
          resultado: opts.resultado || "Aprobada",
          justificacion: "La propuesta es pertinente y se dispone de los recursos solicitados.",
          condiciones:
            opts.resultado === "Aprobada con condiciones"
              ? "Ajustar el cronograma de compras de equipo al primer semestre."
              : "",
          sesion: "CIE-S-15",
          fecha: "2026-08-13",
        },
        "u_cie",
        "cie",
        t(13, 16),
      );
    if (i >= 13)
      ejecutar("notificarResolucion", { id }, "u_di", "direccion_investigacion", t(13, 17));
  };
  const crear = (userId, form, dia = 3) => {
    const iso = `2026-08-${pad(dia, 2)}T10:00:00`;
    const bid = ejecutar("guardarBorrador", { form }, userId, "investigador", iso);
    return ejecutar(
      "enviarPropuesta",
      { id: bid },
      userId,
      "investigador",
      iso.replace("10:00", "11:00"),
    );
  };
  const E = (o) => formEjemplo(o);
  // 001 · en revisión VIE
  let id = crear(
    "u_inv2",
    E({
      coordinador: "Carlos Jiménez",
      cedula: "1-0987-6543",
      modalidad: "Investigación aplicada",
      titulo: "Plataforma de análisis de movilidad urbana con datos abiertos",
      equipo: ["Carlos Jiménez", "Laura Vega"],
    }),
    1,
  );
  db.clock = "2026-07-30T09:00:00";
  avanzar(id, "dictamenDI", "u_inv2");
  db.proposals.find((x) => x.id === id).vie.checks = {
    Formulario: true,
    "Plan de riesgos": false,
    Presupuesto: true,
    Documentos: true,
  };
  // 002 · comunicada a la VIE
  db.clock = "2026-07-30T10:00:00";
  id = crear(
    "u_inv3",
    E({
      coordinador: "Laura Vega",
      cedula: "2-0456-0789",
      modalidad: "Investigación básica",
      titulo: "Modelo predictivo de erosión en cuencas del Caribe",
      equipo: ["Laura Vega", "Pablo Chacón"],
    }),
    1,
  );
  avanzar(id, "comunicada", "u_inv3");
  // 003 · avalada
  id = crear(
    "u_inv6",
    E({
      coordinador: "Pablo Chacón",
      cedula: "4-0123-0456",
      modalidad: "Investigación aplicada",
      titulo: "Optimización energética en microredes universitarias",
      equipo: ["Pablo Chacón", "José Méndez"],
      instancia2: "ELEC",
    }),
    1,
  );
  avanzar(id, "avalada", "u_inv6");
  // 004 · lista para CIE
  id = crear(
    "u_inv2",
    E({
      coordinador: "Carlos Jiménez",
      cedula: "1-0987-6543",
      modalidad: "Investigación básica y aplicada",
      titulo: "Análisis de materiales sostenibles para construcción",
      equipo: ["Carlos Jiménez", "Pablo Chacón"],
    }),
    2,
  );
  avanzar(id, "listaCIE", "u_inv2");
  // 005 · en resolución
  id = crear(
    "u_inv3",
    E({
      coordinador: "Laura Vega",
      cedula: "2-0456-0789",
      modalidad: "Actividad de fortalecimiento",
      titulo: "Fortalecimiento del grupo de ciencia de datos aplicada",
      equipo: ["Laura Vega", "Carlos Jiménez"],
    }),
    2,
  );
  avanzar(id, "enResolucion", "u_inv3");
  // 006 · en trámite de aval, sin sesión
  id = crear(
    "u_inv6",
    E({
      coordinador: "Pablo Chacón",
      cedula: "4-0123-0456",
      modalidad: "Investigación aplicada",
      titulo: "Herramienta de apoyo para el diagnóstico de enfermedades del café",
      equipo: ["Pablo Chacón", "Laura Vega"],
    }),
    3,
  );
  avanzar(id, "consejo", "u_inv6");
  // 007 · consulta formal abierta
  id = crear(
    "u_inv2",
    E({
      coordinador: "Carlos Jiménez",
      cedula: "1-0987-6543",
      modalidad: "Investigación básica",
      titulo: "Estimación de biomasa forestal con imágenes satelitales",
      equipo: ["Carlos Jiménez", "José Méndez"],
      instancia2: "ELEC",
    }),
    3,
  );
  avanzar(id, "sesion", "u_inv2", { consulta: true });
  // 008 · evaluada (documento del Comité por firmar y enviar)
  id = crear(
    "u_inv3",
    E({
      coordinador: "Laura Vega",
      cedula: "2-0456-0789",
      modalidad: "Investigación aplicada",
      titulo: "Sistema de alerta temprana de deslizamientos con sensores de bajo costo",
      equipo: ["Laura Vega", "Pablo Chacón"],
    }),
    3,
  );
  avanzar(id, "evaluada", "u_inv3");
  // 009 · evaluaciones parciales
  id = crear(
    "u_inv2",
    E({
      coordinador: "Carlos Jiménez",
      cedula: "1-0987-6543",
      modalidad: "Investigación aplicada",
      titulo: "Plataforma de trazabilidad para cadenas de suministro agrícolas",
      equipo: ["Carlos Jiménez", "Laura Vega"],
    }),
    4,
  );
  avanzar(id, "evaluacion", "u_inv2", { evalHasta: 2, evalParcial: true });
  // 010 · todas las evaluaciones finalizadas, falta consolidar
  id = crear(
    "u_inv6",
    E({
      coordinador: "Pablo Chacón",
      cedula: "4-0123-0456",
      modalidad: "Investigación aplicada",
      titulo: "Detección de anomalías en redes eléctricas mediante aprendizaje automático",
      equipo: ["Pablo Chacón", "Carlos Jiménez"],
    }),
    4,
  );
  avanzar(id, "evaluacion", "u_inv6");
  // 011 · revisión de completitud (con un integrante del Comité en el equipo)
  id = crear(
    "u_inv3",
    E({
      coordinador: "Laura Vega",
      cedula: "2-0456-0789",
      modalidad: "Investigación básica",
      titulo: "Modelos de lenguaje para la clasificación de documentos institucionales",
      equipo: ["Laura Vega", "Diego Araya"],
    }),
    5,
  );
  // 012 · devuelta por faltantes
  id = crear(
    "u_inv6",
    E({
      coordinador: "Pablo Chacón",
      cedula: "4-0123-0456",
      modalidad: "Investigación aplicada",
      titulo: "Gestión inteligente del consumo de agua en edificios",
      equipo: ["Pablo Chacón", "Laura Vega"],
    }),
    5,
  );
  ejecutar(
    "devolverPropuesta",
    {
      id,
      motivo:
        "Falta la carta de compromiso de la organización beneficiaria y el oficio de la contrapartida.",
      secciones: ["Equipo de investigación", "Presupuesto y financiamiento"],
    },
    "u_asc",
    "comite_asistente",
    "2026-08-06T09:00:00",
  );
  // 013 · pendiente de dictamen PI (aplicada con potencial de PI)
  id = crear(
    "u_inv2",
    E({
      coordinador: "Carlos Jiménez",
      cedula: "1-0987-6543",
      modalidad: "Investigación aplicada",
      titulo: "Algoritmo de compresión de señales para sensores de baja potencia",
      equipo: ["Carlos Jiménez", "José Méndez"],
      instancia2: "ELEC",
      over: {
        q: {
          ...formVacio().q,
          pi: {
            r: "Sí",
            descripcion: "El algoritmo podría protegerse mediante patente o secreto.",
          },
          innovacion: { r: "Sí", tipo: "Producto" },
        },
      },
    }),
    6,
  );
  ejecutar("iniciarRevisionPI", { id }, "u_vin", "vinculacion", "2026-08-07T09:00:00");
  // 014 · la propuesta de María (desarrollo tecnológico)
  id = crear("u_inv1", E({}), 6);
  // 015 · con observaciones de la VIE
  id = crear(
    "u_inv4",
    E({
      coordinador: "Mario Rojas",
      cedula: "3-0321-0654",
      modalidad: "Investigación básica",
      titulo: "Caracterización de microplásticos en cuerpos de agua urbanos",
      equipo: ["Mario Rojas", "Laura Vega"],
    }),
    2,
  );
  avanzar(id, "recibida", "u_inv4");
  ejecutar(
    "observarVIE",
    {
      id,
      observaciones: [
        {
          seccion: "Plan de acción y riesgos",
          texto:
            "Faltan medidas de mitigación específicas para el riesgo de acceso a los sitios de muestreo.",
        },
      ],
    },
    "u_gest",
    "gestora_vie",
    "2026-08-13T14:00:00",
  );
  // 016 · aprobada, pendiente de notificar
  id = crear(
    "u_inv6",
    E({
      coordinador: "Pablo Chacón",
      cedula: "4-0123-0456",
      modalidad: "Investigación aplicada",
      titulo: "Sistema de riego inteligente para pequeños productores",
      equipo: ["Pablo Chacón", "Carlos Jiménez"],
    }),
    2,
  );
  avanzar(id, "resuelta", "u_inv6");
  // 017 · notificada con condiciones
  id = crear(
    "u_inv2",
    E({
      coordinador: "Carlos Jiménez",
      cedula: "1-0987-6543",
      modalidad: "Desarrollo tecnológico",
      titulo: "Prototipo de medidor inteligente de energía para hogares",
      equipo: ["Carlos Jiménez", "José Méndez"],
      instancia2: "ELEC",
    }),
    2,
  );
  avanzar(id, "notificada", "u_inv2", { resultado: "Aprobada con condiciones" });
  // 018 · no recomendada por el Comité
  id = crear(
    "u_inv3",
    E({
      coordinador: "Laura Vega",
      cedula: "2-0456-0789",
      modalidad: "Investigación aplicada",
      titulo: "Aplicación móvil para el registro de biodiversidad urbana",
      equipo: ["Laura Vega", "Pablo Chacón"],
    }),
    4,
  );
  avanzar(id, "evaluada", "u_inv3", { perfil: "oblig_bajo" });
  ejecutar("firmarDocumentoComite", { id }, "u_ev1", "comite_evaluador", "2026-08-10T11:00:00");
  ejecutar("enviarAlConsejo", { id }, "u_asc", "comite_asistente", "2026-08-10T14:00:00");
  // Borrador en curso de María
  db.contador.borrador = 0;
  db.clock = "2026-08-12T08:00:00";
  const bor = E({});
  bor.titulo = "Evaluación de sensores de bajo costo para calidad del aire";
  bor.modalidad = "Investigación aplicada";
  bor.resumen = "";
  bor.estadoArte = "";
  bor.referencias = "";
  bor.declaracion = { acepta: false, cedula: "", firma: "", fecha: "" };
  ejecutar("guardarBorrador", { form: bor }, "u_inv1", "investigador", "2026-08-12T08:00:00");
  // Histórico de convocatorias anteriores
  const hist = [
    [
      "PROP-2026-031",
      "Optimización energética en microredes universitarias (2026)",
      "Ana Solano",
      "EMEC",
      "Energía",
      "Aprobada",
      "2026",
      "VIE-2026-02",
    ],
    [
      "PROP-2026-018",
      "Modelo predictivo de erosión en cuencas del Caribe (2026)",
      "David Mora",
      "FOR",
      "Ambiente",
      "Aprobada",
      "2026",
      "VIE-2026-02",
    ],
    [
      "PROP-2025-044",
      "Herramienta de apoyo para diagnóstico de enfermedades del café",
      "Laura Vega",
      "COMP",
      "Agrotecnología",
      "Rechazada",
      "2025",
      "VIE-2026-02",
    ],
    [
      "PROP-2025-027",
      "Análisis de materiales sostenibles para construcción",
      "Mario Rojas",
      "CONS",
      "Materiales",
      "Aprobada",
      "2025",
      "VIE-2026-02",
    ],
  ];
  hist.forEach(([hid, titulo, inv, inst, tema, res, anio, conv]) => {
    const f = E({ titulo, coordinador: inv, instancia: inst, modalidad: "Investigación aplicada" });
    db.proposals.push({
      id: hid,
      convocatoriaId: conv,
      historico: true,
      estado: "Notificada",
      etapa: 6,
      final: true,
      investigadora: inv,
      coordinadorId: "",
      titulo,
      modalidad: f.modalidad,
      escuela: nombreInstancia(db, inst),
      instancia: inst,
      tema,
      anio,
      resultado: res,
      form: f,
      presupuesto: colones(totalSolicitado(f, PARAMS_2027)),
      piRequired: false,
      versiones: [],
      observaciones: [],
      timeline: [
        {
          fecha: `${anio}-10-28T09:00:00`,
          titulo: "Resolución notificada",
          detalle: `Resultado ${res}.`,
          por: "Dirección de Investigación",
        },
      ],
      cie: {
        resolucion: { resultado: res, numero: `CIE-RES-0${anio.slice(2)}`, fecha: `${anio}-10-24` },
      },
      documentos: [],
    });
  });
  // Estado final de la demostración
  db.clock = "2026-08-14T09:00:00";
  db.recordatorios = db.recordatorios || [];
  recalcularMorosidad(db);
  // La notificación de bienvenida y los avisos de ejemplo ya se generaron al ejecutar las acciones.
  return db;
}
