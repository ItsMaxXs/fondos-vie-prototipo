// ============================================================
// Datos · parámetros normativos por defecto
// PARAMS_2027: montos, plazos, límites de palabras, duración, porcentajes (Disposiciones de la convocatoria). TIPOS_HORA: tipos de horas.
// ERS: RF-CON-06, RF-CON-11. Se editan en pantalla desde Administración → Parámetros.
// ============================================================

export const PARAMS_2027 = {
  montoMax: {
    "Actividad de fortalecimiento": 2000000,
    "Investigación básica": 4000000,
    "Investigación aplicada": 4000000,
    "Investigación básica y aplicada": 4000000,
    "Desarrollo tecnológico": 5000000,
  },
  montoPorAnio: { "Actividad de fortalecimiento": false },
  duracionMaxAnios: {
    "Actividad de fortalecimiento": 1,
    "Investigación básica": 2,
    "Investigación aplicada": 2,
    "Investigación básica y aplicada": 2,
    "Desarrollo tecnológico": 3,
  },
  trl: {
    "Investigación básica": [1, 3],
    "Investigación aplicada": [3, 5],
    "Investigación básica y aplicada": [1, 5],
    "Desarrollo tecnológico": [4, 7],
  },
  horasMinPersona: 4,
  horasMinPersonaREC: 2,
  horasMinProyecto: 8,
  horasMaxFortalecimiento: 8,
  horasMinFortVIE: 4,
  horasApoyoREC: [2, 5],
  horasPorProducto: 10,
  becasHorasMin: 10,
  valorHoraBeca: 2400,
  mesesBecaMax: 10,
  semanasPorMes: 4,
  serviciosProfPct: 30,
  refsMin: 10,
  resumenMaxPalabras: 500,
  palabrasClave: [4, 6],
  umbralComite: 70,
  reglaConsolidacion: "promedio",
  difMaxNotas: 25,
  votoDobleDePresidencia: true,
  recordatorios: [7, 3, 1],
  minutosInactividad: 30,
  politicaMorosidad: "advertir",
  fondoDisponible: 60000000,
  horasDisponibles: 150,
};

export const TIPOS_HORA = ["VIE", "VIE-Centros", "CONS", "DOC", "REC", "VIESA"];
