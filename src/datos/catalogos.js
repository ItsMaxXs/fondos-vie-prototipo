// ============================================================
// Datos · catálogos y preguntas fijas
// CATALOGOS_BASE: listas desplegables del formulario (áreas, tipos de producto, etc.). PREGUNTAS_ETICA: preguntas del paso de aspectos éticos. INSTANCIAS_BASE: escuelas y centros.
// ERS: RF-CON-06, RF-FOR-33 a RF-FOR-36, RF-USR-10.
// ============================================================

// ---------- Catálogos (RF-CON-07) ----------
export const CATALOGOS_BASE = {
  productosFortalecimiento: [
    ["Diagnóstico de situación", 1],
    ["Estudio de mercado", 1],
    ["Estudio de factibilidad", 1],
    ["Ensayo de laboratorio (según la naturaleza de la actividad)", 1],
    ["Propuesta de creación de una línea de investigación", 1],
    ["Formulación de una propuesta de proyecto de investigación o de desarrollo tecnológico", 1],
  ],
  productosAcademicos: [
    ["Un artículo científico sometido en revista o memoria indexada en WoS o Scopus", 1],
    [
      "Dos artículos científicos sometidos en revistas indexadas en SciELO, Redalyc, ESCI o DOAJ, o memorias con Consejo Editorial permanente",
      2,
    ],
    ["Libro o capítulo de libro técnico especializado sometido a Comité Editorial permanente", 1],
  ],
  productosAcademicosDT: [
    ["Un artículo científico sometido en revista o memoria indexada en WoS o Scopus", 1],
    [
      "Dos artículos científicos sometidos en revistas indexadas en SciELO, Redalyc, ESCI o DOAJ, o memorias con Consejo Editorial permanente",
      2,
    ],
    ["Libro o capítulo de libro técnico especializado sometido a Comité Editorial permanente", 1],
    ["Norma técnica o manual técnico de alta especialidad", 1],
  ],
  activosPI: [
    "Patente de invención o modelo de utilidad",
    "Diseño industrial",
    "Desarrollo de Software",
    "Secreto",
    "Obtención Vegetal",
    "Denominación de origen o indicación geográfica",
    "Sistema de trazado de circuitos integrados",
    "Otros",
  ],
  // [código, detalle, tipo]  tipo: O operativo, S servicio, D bien duradero
  objetosGasto: [
    ["1-03-03-01", "Impresión, encuadernación y otros", "O"],
    ["1-03-07-01", "Servicios de transferencia electrónica de información", "O"],
    ["1-04-03-01", "Servicios de ingeniería (profesionales externos)", "S"],
    ["1-04-05-01", "Servicio de desarrollo de sistemas informáticos (profesionales externos)", "S"],
    ["1-04-99-01", "Otros servicios de gestión y apoyo (profesionales externos)", "S"],
    ["1-05-01-01", "Transporte dentro del país (no contempla transporte institucional)", "O"],
    ["1-05-02-01", "Viáticos dentro del país (alimentación y hospedaje del equipo TEC)", "O"],
    ["1-08-08-01", "Mantenimiento y reparación de equipo de cómputo", "O"],
    ["2-02-03-01", "Alimentos y bebidas", "O"],
    ["2-03-04-01", "Materiales y productos eléctricos, telefónicos y de cómputo", "O"],
    ["2-04-01-01", "Herramientas e instrumentos", "O"],
    ["2-04-02-01", "Repuestos y accesorios", "O"],
    ["2-99-01-01", "Útiles y materiales de oficina y cómputo", "O"],
    ["2-99-02-01", "Útiles y materiales médico, hospitalario y de investigación", "O"],
    ["5-01-04-01", "Equipo y mobiliario de oficina", "D"],
    ["5-01-05-01", "Equipo y programas de cómputo (incluye licencias de software)", "D"],
    ["5-01-06-01", "Equipo sanitario, de laboratorio e investigación", "D"],
    ["5-01-99-01", "Maquinaria, equipo y mobiliario diverso", "D"],
    ["9-99-99-99", "Transporte institucional (NO presupuestable)", "X"],
  ],
  odsLista: [
    "ODS 3 Salud y bienestar",
    "ODS 4 Educación de calidad",
    "ODS 6 Agua limpia y saneamiento",
    "ODS 7 Energía asequible",
    "ODS 9 Industria, innovación e infraestructura",
    "ODS 11 Ciudades y comunidades sostenibles",
    "ODS 12 Producción y consumo responsables",
    "ODS 13 Acción por el clima",
    "ODS 15 Vida de ecosistemas terrestres",
  ],
  entesEticos: [
    "Comité Ético Científico (CEC) inscrito ante CONIS",
    "CONAGEBIO",
    "CICUA (UCR) o COBAB (UNA)",
    "Asociación de Desarrollo Integral (consulta indígena)",
    "Otro ente regulatorio",
  ],
  tiposDocumento: [
    "Formulario de propuesta",
    "Plan de acción y gestión de riesgos (XLSX)",
    "Presupuesto detallado (XLSX)",
    "Cartas de compromiso",
    "Oficios de financiamiento",
    "Aval de jefatura (personal de apoyo REC)",
    "Acuerdo de instancia coordinadora",
    "Acuerdo de instancia participante",
    "Dictamen de propiedad intelectual",
    "Aval ético o regulatorio",
  ],
};

// Preguntas de ética (RF-FOR-35)
export const PREGUNTAS_ETICA = [
  [
    "humanos",
    "¿Involucra participación directa o indirecta de seres humanos como sujetos de investigación?",
    "Comité Ético Científico (CEC) inscrito ante CONIS",
  ],
  [
    "biodiversidad",
    "¿Involucra uso, colecta, acceso o estudio de biodiversidad, recursos genéticos o material biológico silvestre?",
    "CONAGEBIO",
  ],
  [
    "animales",
    "¿Involucra uso, manipulación, cría o experimentación con animales vertebrados?",
    "CICUA (UCR) o COBAB (UNA)",
  ],
  [
    "indigenas",
    "¿Involucra trabajo en o con territorios, comunidades o pueblos indígenas?",
    "Mecanismos de consulta y aval de la Asociación de Desarrollo Integral",
  ],
];

// ---------- Instancias académicas (RF-USR-09) ----------
export const INSTANCIAS_BASE = [
  {
    id: "COMP",
    nombre: "Escuela de Ingeniería en Computación",
    tipo: "Escuela",
    horasVIE: 60,
    horasVIECentros: 20,
  },
  {
    id: "ELEC",
    nombre: "Escuela de Ingeniería Electrónica",
    tipo: "Escuela",
    horasVIE: 50,
    horasVIECentros: 10,
  },
  {
    id: "EMEC",
    nombre: "Escuela de Electromecánica",
    tipo: "Escuela",
    horasVIE: 40,
    horasVIECentros: 10,
  },
  {
    id: "FOR",
    nombre: "Escuela de Ingeniería Forestal",
    tipo: "Escuela",
    horasVIE: 40,
    horasVIECentros: 10,
  },
  {
    id: "CONS",
    nombre: "Escuela de Construcción",
    tipo: "Escuela",
    horasVIE: 35,
    horasVIECentros: 5,
  },
  {
    id: "CIC",
    nombre: "Centro de Investigaciones en Computación",
    tipo: "Centro",
    horasVIE: 0,
    horasVIECentros: 30,
  },
];
