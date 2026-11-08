// ============================================================
// Datos · formulario de ejemplo
// formEjemplo(): devuelve un formulario completo y válido (se usa para sembrar propuestas y para el botón "Cargar ejemplo").
// ============================================================
import { CATALOGOS_BASE } from "./catalogos.js";
import { esDT, esFort } from "./modalidades.js";
import { formVacio } from "../reglas/formulario.js";
import { uid } from "../utilidades/ids.js";

// ---------- Datos de ejemplo para el formulario y para la base inicial ----------
export function formEjemplo(o = {}) {
  const modalidad = o.modalidad || "Desarrollo tecnológico";
  const fort = esFort(modalidad);
  const dt = esDT(modalidad);
  const base = formVacio(
    {
      nombre: o.coordinador || "María Rodríguez",
      cedula: o.cedula || "1-1234-5678",
      orcid: "0000-0002-3141-7782",
    },
    o.instancia || "COMP",
    modalidad,
  );
  const objetivos = [
    { id: "OE1", texto: "Diseñar la arquitectura y los requisitos de la solución propuesta." },
    { id: "OE2", texto: "Implementar y probar el sistema o prototipo." },
    { id: "OE3", texto: "Validar el desempeño en un entorno relevante y difundir los resultados." },
  ];
  const nombres = o.equipo || ["María Rodríguez", "José Méndez"];
  const equipo = [
    {
      ...base.equipo[0],
      nombre: nombres[0],
      horas: fort ? "4" : "10",
      periodo: fort ? "Ene 2027 – Dic 2027" : "Ene 2027 – Jun 2028",
      rol: "Coordinación",
    },
    {
      id: uid("m"),
      nombre: nombres[1],
      cedula: "",
      orcid: "0000-0001-1147-6209",
      instancia: o.instancia2 || o.instancia || "COMP",
      rol: "Investigación",
      horas: fort ? "4" : "6",
      tipoHora: "VIE",
      titularCons: "",
      periodo: fort ? "Ene 2027 – Dic 2027" : "Ene 2027 – Jun 2028",
      esApoyo: false,
      avalApoyo: false,
    },
  ];
  const anios = fort ? 1 : 2;
  const inicio = "2027-01-15";
  const fin = fort ? "2027-12-15" : "2028-06-30";
  const plan = objetivos.map((ob, i) => ({
    id: uid("a"),
    objetivoId: ob.id,
    actividad: [
      "Diseñar la arquitectura",
      "Implementar el prototipo",
      "Validar y difundir resultados",
    ][i],
    resultado: ["Arquitectura validada", "Prototipo funcional", "Informe de validación"][i],
    participantes: i === 2 && !fort ? [nombres[0], "Andrea Quesada"] : [nombres[0], nombres[1]],
    responsabilidad: i === 2 ? "Supervisa" : "Ejecuta",
    inicio: String([1, 4, fort ? 7 : 10][i]),
    duracion: String([3, 6, fort ? 4 : 5][i]),
    gira: i === 2,
    riesgos: [
      {
        id: uid("r"),
        riesgo: [
          "Retraso de componentes",
          "Fallas de integración",
          "Datos de validación insuficientes",
        ][i],
        mitigacion: [
          "Proveedor alterno y compra temprana",
          "Pruebas incrementales",
          "Ampliar el período de prueba",
        ][i],
        responsable: nombres[i % 2],
        permiso: false,
      },
    ],
  }));
  const lin = (anio, cod, det, tipo, monto, just, extra = {}) => ({
    id: uid("p"),
    anio,
    codigo: cod,
    detalle: det,
    tipo,
    monto: String(monto),
    justificacion: just,
    ...extra,
  });
  const presupuesto = [
    lin(
      1,
      "2-03-04-01",
      "Materiales y productos eléctricos, telefónicos y de cómputo",
      "O",
      fort ? 400000 : 800000,
      "Sensores, tarjetas y componentes del prototipo.",
    ),
    lin(
      1,
      "1-05-02-01",
      "Viáticos dentro del país (alimentación y hospedaje del equipo TEC)",
      "O",
      fort ? 300000 : 500000,
      "Giras de campo para instalación y validación.",
    ),
    ...(fort
      ? []
      : [
          lin(
            1,
            "5-01-05-01",
            "Equipo y programas de cómputo (incluye licencias de software)",
            "D",
            1500000,
            "Estación de trabajo y licencias necesarias para el desarrollo.",
          ),
        ]),
    ...(fort
      ? []
      : [
          lin(
            2,
            "2-03-04-01",
            "Materiales y productos eléctricos, telefónicos y de cómputo",
            "O",
            600000,
            "Reposición de componentes y pruebas ampliadas.",
          ),
          lin(
            2,
            "1-05-02-01",
            "Viáticos dentro del país (alimentación y hospedaje del equipo TEC)",
            "O",
            400000,
            "Giras de validación en comunidades.",
          ),
          lin(
            2,
            "1-04-05-01",
            "Servicio de desarrollo de sistemas informáticos (profesionales externos)",
            "S",
            400000,
            "Servicio puntual de integración de la plataforma web.",
            { perfil: "Profesional en ingeniería de software con experiencia en plataformas IoT." },
          ),
        ]),
  ];
  const becas = fort
    ? []
    : [
        { anio: 1, horasSemana: "10", meses: "10" },
        { anio: 2, horasSemana: "10", meses: "10" },
      ];
  const productos = fort
    ? [{ tipo: CATALOGOS_BASE.productosFortalecimiento[0][0], cuenta: 1, objetivoId: "OE3" }]
    : [
        {
          tipo: CATALOGOS_BASE.productosAcademicos[0][0],
          cuenta: 1,
          objetivoId: "OE3",
          academico: true,
        },
        {
          tipo: CATALOGOS_BASE.productosAcademicos[1][0],
          cuenta: 2,
          objetivoId: "OE3",
          academico: true,
        },
      ];
  const r = {
    ...base,
    titulo:
      o.titulo || "Sistema inteligente para monitoreo de calidad del agua mediante sensores IoT",
    inicio,
    fin,
    participantes: o.instancia2 && o.instancia2 !== (o.instancia || "COMP") ? [o.instancia2] : [],
    linea: "Sistemas inteligentes para sostenibilidad",
    ods: ["ODS 6 Agua limpia y saneamiento"],
    trlInicial: dt ? "4" : modalidad === "Investigación aplicada" ? "3" : "1",
    trlFinal: dt ? "6" : modalidad === "Investigación aplicada" ? "5" : "3",
    resumen:
      "Diseño y validación de una plataforma basada en sensores, analítica de datos y visualización web para apoyar la toma de decisiones en comunidades rurales.",
    palabras: "IoT, calidad del agua, sensores, analítica, monitoreo",
    abstract:
      "Design and validation of a sensor-based platform combining data analytics and web visualization to support decision-making in rural communities.",
    keywords: "IoT, water quality, sensors, analytics, monitoring",
    equipo,
    colaboradores: fort
      ? []
      : [
          {
            id: uid("c"),
            nombre: "Andrea Quesada",
            orcid: "0000-0003-1022-5421",
            institucion: "ASADA San Rafael",
            carta: true,
          },
        ],
    problema:
      "Las comunidades seleccionadas no cuentan con mecanismos continuos, accesibles y de bajo costo para monitorear variables críticas. La propuesta atiende esa necesidad con una solución validada en un entorno relevante.",
    objetivoGeneral:
      "Desarrollar y validar una solución tecnológica para el monitoreo en comunidades rurales.",
    objetivos,
    estadoArte:
      "La literatura reciente evidencia avances en redes de sensores ambientales, pero persisten brechas de costo, interoperabilidad y validación en contextos rurales.",
    metodologia:
      "Enfoque iterativo: selección y calibración de componentes, diseño, desarrollo, integración y validación en un entorno relevante, con medición de precisión, disponibilidad y estabilidad.",
    plan,
    giras: { proyecta: "Sí", cantidad: "3" },
    presupuesto,
    becas,
    financiamiento: [
      {
        tipo: "Financiamiento externo",
        anio1: fort ? "" : "1500000",
        anio2: fort ? "" : "500000",
        anio3: "",
        oficio: fort ? "" : "Oficio-DE-001-2026",
        entidad: fort ? "" : "Fundación Agua Clara",
      },
      { tipo: "Contrapartida", anio1: "", anio2: "", anio3: "", oficio: "", entidad: "" },
      { tipo: "Cofinanciamiento", anio1: "", anio2: "", anio3: "", oficio: "", entidad: "" },
    ],
    productos,
    activosPI: dt ? [{ tipo: "Desarrollo de Software", consecutivo: "" }] : [],
    resguardoRepositorio: true,
    resguardoSoftware: true,
    divulgacion:
      "Presentación de resultados en congreso especializado y charla técnica para estudiantes.",
    canales: "Investiga.TEC, portal de la escuela y redes institucionales.",
    socializacion: "Taller de cierre con las comunidades participantes.",
    medios: "Nota de divulgación en medio institucional cuando existan resultados publicables.",
    etica: {
      humanos: "No",
      biodiversidad: "No",
      animales: "No",
      indigenas: "No",
      exencion:
        "La propuesta se limita al desarrollo y validación de tecnología; no recolecta datos personales, material biológico ni utiliza animales o territorios indígenas.",
      ente: "",
    },
    hojaRuta:
      "Línea: sistemas inteligentes para sostenibilidad. Fase previa: pruebas de componentes. Fase actual: integración y validación. Fase futura: transferencia y escalamiento.",
    referencias: Array.from(
      { length: 10 },
      (_, i) =>
        `[${i + 1}] Autor ${i + 1}. Revista indexada en Scopus, ${2022 + (i % 4)}. Referencia primaria ${i + 1}.`,
    ).join("\n"),
    declaracion: {
      acepta: true,
      cedula: o.cedula || "1-1234-5678",
      firma: `Firma digital de ${nombres[0]}`,
      fecha: "",
    },
    documentos: {
      "Plan de acción y gestión de riesgos (XLSX)": {
        adjunto: true,
        nombre: "Plan_Accion_Riesgos_2027.xlsx",
      },
      "Presupuesto detallado (XLSX)": { adjunto: true, nombre: "Presupuesto_2027.xlsx" },
      "Cartas de compromiso": { adjunto: true, nombre: "Carta_compromiso.pdf" },
      "Oficios de financiamiento": { adjunto: true, nombre: "Oficio_financiamiento.pdf" },
    },
  };
  r.q.pi = {
    r: dt ? "Sí" : "No",
    descripcion: dt
      ? "Resultados protegibles mediante derecho de autor sobre el software y posible secreto empresarial."
      : "",
  };
  r.q.innovacion = { r: "Sí", tipo: "Producto" };
  r.q.prioridad = { r: "Sí", detalle: "ODS 6 y prioridades nacionales de adaptación climática." };
  return { ...r, ...(o.over || {}) };
}
