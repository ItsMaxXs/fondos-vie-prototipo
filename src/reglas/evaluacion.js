// ============================================================
// Reglas · rúbrica y consolidación
// Normaliza rúbricas, calcula el puntaje de cada evaluador y el resultado consolidado.
// Promedio de evaluadores, umbral de 70 % y regla de criterios obligatorios (uno obligatorio bajo 8 = "No recomienda").
// ERS: CU-08, CU-09 (RF-EVA-02 a RF-EVA-13).
// ============================================================
import { esDT, esFort } from "../datos/modalidades.js";
import {
  NIVELES,
  RUBRICA_DESARROLLO_TECNOLOGICO,
  RUBRICA_FORTALECIMIENTO,
  RUBRICA_INVESTIGACION,
} from "../datos/rubricas.js";
import { num } from "../utilidades/formato.js";

export const rubricaBaseDe = (modalidad) =>
  esFort(modalidad)
    ? RUBRICA_FORTALECIMIENTO
    : esDT(modalidad)
      ? RUBRICA_DESARROLLO_TECNOLOGICO
      : RUBRICA_INVESTIGACION;

// Estructura normalizada: [{id,title,weight,criteria:[{id,label,weight,required}]}]
export const normalizarRubrica = (secs) =>
  secs.map((s) => ({
    id: s.id,
    title: s.title,
    weight: s.weight,
    criteria: s.criteria.map((c) => ({
      id: `${s.id}-${c[0]}`,
      label: c[1],
      weight: c[2],
      required: !!c[3],
    })),
  }));

const nombreNivel = (v) => NIVELES.find((n) => n.valor === Number(v))?.nombre || "Sin evaluar";

export const criteriosDe = (rub) =>
  rub.flatMap((s) => s.criteria.map((c) => ({ ...c, seccion: s.title })));

// Cálculo de la evaluación individual (RF-EVA-05, RF-EVA-07, RF-EVA-12, RN-34, RN-35)
export function calcularEvaluacion(rub, scores, umbral) {
  const crit = criteriosDe(rub);
  let total = 0;
  const subtotales = {};
  crit.forEach((c) => {
    const v = scores?.[c.id];
    const puntos = v === undefined || v === null || v === "" ? 0 : c.weight * (Number(v) / 10);
    total += puntos;
    subtotales[c.seccion] = (subtotales[c.seccion] || 0) + puntos;
  });
  const nota = Math.round(total * 10) / 10;
  const obligatoriosBajos = crit.filter(
    (c) =>
      c.required &&
      scores?.[c.id] !== undefined &&
      scores?.[c.id] !== "" &&
      Number(scores[c.id]) < 8,
  );
  const sinEvaluar = crit.filter((c) => scores?.[c.id] === undefined || scores?.[c.id] === "");
  const recomienda = nota >= umbral && obligatoriosBajos.length === 0;
  return {
    nota,
    subtotales,
    obligatoriosBajos,
    sinEvaluar,
    recomienda,
    resultado: recomienda ? "Recomienda" : "No recomienda",
  };
}

// Sección no sumativa de productos (RF-EVA-18, RN-36)
export function resumenProductos(f, params) {
  const horas = (f.equipo || []).reduce((s, p) => s + num(p.horas), 0);
  const minimo = Math.max(1, Math.ceil(horas / params.horasPorProducto));
  const cant = (f.productos || []).reduce((s, p) => s + (p.cuenta || 1), 0);
  return {
    horas,
    minimo,
    comprometidos: cant,
    cumple: cant >= minimo,
    tipos: (f.productos || []).map((p) => p.tipo),
  };
}
