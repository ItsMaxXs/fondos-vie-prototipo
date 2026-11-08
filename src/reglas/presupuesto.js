// ============================================================
// Reglas · presupuesto y duración
// Cálculo de años, meses, costo de becas, presupuesto por año y total solicitado.
// ERS: RF-FOR-21 a RF-FOR-25.
// ============================================================
import { mesesEntre } from "../utilidades/fechas.js";
import { colones, num } from "../utilidades/formato.js";

// Cantidad de años de ejecución según las fechas (mínimo 1)
export const aniosDe = (f) => {
  if (!f.inicio || !f.fin) return 1;
  return Math.min(3, Math.max(1, Math.ceil(mesesEntre(f.inicio, f.fin) / 12)));
};

export const mesesProyecto = (f) =>
  f.inicio && f.fin ? Math.max(0, mesesEntre(f.inicio, f.fin)) : 0;

// ---------- Cálculos de presupuesto (RF-FOR-26, FOR-48) ----------
export function costoBeca(b, params) {
  return num(b.horasSemana) * num(b.meses) * params.semanasPorMes * params.valorHoraBeca;
}

export function presupuestoPorAnio(f, params) {
  const n = aniosDe(f);
  const filas = [];
  for (let a = 1; a <= n; a++) {
    const lineas_ = (f.presupuesto || []).filter((l) => Number(l.anio) === a);
    const op = lineas_.filter((l) => l.tipo === "O").reduce((s, l) => s + num(l.monto), 0);
    const serv = lineas_.filter((l) => l.tipo === "S").reduce((s, l) => s + num(l.monto), 0);
    const dur = lineas_.filter((l) => l.tipo === "D").reduce((s, l) => s + num(l.monto), 0);
    const bec = (f.becas || []).filter((b) => Number(b.anio) === a);
    const costoBecas = bec.reduce((s, b) => s + costoBeca(b, params), 0);
    const horasBeca = bec.reduce((s, b) => s + num(b.horasSemana), 0);
    const operativo = op + serv + costoBecas;
    filas.push({
      anio: a,
      operativo,
      servicios: serv,
      duraderos: dur,
      becas: costoBecas,
      horasBeca,
      total: operativo + dur,
    });
  }
  return filas;
}

export const totalSolicitado = (f, params) =>
  presupuestoPorAnio(f, params).reduce((s, x) => s + x.total, 0);

export const presupuestoTexto = (f, params) => colones(totalSolicitado(f, params));
