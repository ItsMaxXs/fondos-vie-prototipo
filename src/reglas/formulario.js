// ============================================================
// Reglas · modelo del formulario
// formVacio: formulario en blanco. norm: completa un formulario viejo con los campos nuevos. pasosCompletos / avanceGlobal: avance por paso y total.
// ERS: CU-04 (RF-FOR-01 a RF-FOR-06).
// ============================================================
import { PASOS } from "../datos/pasos.js";
import { uid } from "../utilidades/ids.js";

export const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function formVacio(usuario, instanciaId, modalidad = "Investigación aplicada") {
  return {
    titulo: "",
    modalidad,
    inicio: "",
    fin: "",
    instancia: instanciaId || "COMP",
    participantes: [],
    linea: "",
    ods: [],
    q: {
      fuentes: { r: "No", detalle: "" },
      continuidad: { r: "No", proyecto: "", tipo: "" },
      prioridad: { r: "No", detalle: "" },
      instrumento: { r: "No", ambito: "Convenio Nacional" },
      convenioMarco: { r: "No", nombre: "" },
      grado: { r: "No", candidato: "", programa: "", universidad: "" },
      confidencial: { r: "No", detalle: "" },
      pi: { r: "No", descripcion: "" },
      innovacion: { r: "No", tipo: "Producto" },
      remunerada: { r: "No" },
    },
    trlInicial: "",
    trlFinal: "",
    resumen: "",
    palabras: "",
    abstract: "",
    keywords: "",
    equipo: [
      {
        id: uid("m"),
        nombre: usuario?.nombre || "",
        cedula: usuario?.cedula || "",
        orcid: usuario?.orcid || "",
        instancia: instanciaId || "COMP",
        rol: "Coordinación",
        horas: "",
        tipoHora: "VIE",
        titularCons: "",
        periodo: "",
        esApoyo: false,
        avalApoyo: false,
      },
    ],
    colaboradores: [],
    sectorSocio: { participa: "No", orgs: [] },
    problema: "",
    objetivoGeneral: "",
    objetivos: [{ id: "OE1", texto: "" }],
    estadoArte: "",
    metodologia: "",
    plan: [],
    giras: { proyecta: "No", cantidad: "" },
    presupuesto: [],
    becas: [],
    financiamiento: [
      { tipo: "Financiamiento externo", anio1: "", anio2: "", anio3: "", oficio: "", entidad: "" },
      { tipo: "Contrapartida", anio1: "", anio2: "", anio3: "", oficio: "", entidad: "" },
      { tipo: "Cofinanciamiento", anio1: "", anio2: "", anio3: "", oficio: "", entidad: "" },
    ],
    productos: [],
    activosPI: [],
    resguardoRepositorio: false,
    resguardoSoftware: false,
    divulgacion: "",
    canales: "",
    socializacion: "",
    medios: "",
    etica: {
      humanos: "No",
      biodiversidad: "No",
      animales: "No",
      indigenas: "No",
      exencion: "",
      ente: "",
    },
    hojaRuta: "",
    referencias: "",
    declaracion: { acepta: false, cedula: "", firma: "", fecha: "" },
    documentos: {},
  };
}

// Estado de cada paso a partir de las incidencias (RF-FOR-05)
export function pasosCompletos(issues) {
  return PASOS.map((_, i) => i === 16 || !issues.some((x) => x.paso === i && x.nivel === "error"));
}

export const avanceGlobal = (issues) => {
  const ok = pasosCompletos(issues).slice(0, 16).filter(Boolean).length;
  return Math.round((ok / 16) * 100);
};
