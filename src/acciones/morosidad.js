// ============================================================
// Acciones · Informes pendientes
// Casos de uso del ERS: CU-15.
// Acciones incluidas: agregarMoroso, cargarMorosos, regularizarMoroso.
// Cada acción recibe (d, p, ctx): d = copia de la base, p = datos enviados por la pantalla, ctx = usuario, rol y hora. Si incumple una regla lanza fallo("mensaje").
// ============================================================
import { bit, notificar, requiere } from "./ayudas.js";
import { fallo } from "../reglas/errores.js";
import { esFinal } from "../reglas/estados.js";
import { norm } from "../reglas/formulario.js";
import { recalcularMorosidad } from "../reglas/morosidad.js";
import { uid } from "../utilidades/ids.js";
import { textos as T } from "../textos/acciones/morosidad.js";

export const accionesMorosidad = {
  agregarMoroso(d, p, ctx) {
    requiere(ctx, ["direccion_investigacion", "gestora_vie"]);
    if (!p.nombre?.trim() || !p.detalle?.trim()) fallo(T.indiqueElNombreYEl);
    d.morosos.unshift({
      id: uid("m"),
      nombre: p.nombre.trim(),
      cedula: p.cedula || "",
      proyecto: p.proyecto || "",
      detalle: p.detalle.trim(),
      fecha: ctx.ahora,
      estado: "Pendiente",
      porRegistro: ctx.user.nombre,
    });
    recalcularMorosidad(d);
    bit(d, ctx, T.personaConInformePendienteRegistrada, "", undefined, p.nombre);
    return T.personaAgregadaAlRegistro;
  },
  cargarMorosos(d, p, ctx) {
    requiere(ctx, ["direccion_investigacion", "gestora_vie"]);
    let n = 0;
    (p.filas || []).forEach((f) => {
      if (
        f.nombre?.trim() &&
        !d.morosos.some((m) => m.estado === "Pendiente" && norm(m.nombre) === norm(f.nombre))
      ) {
        d.morosos.unshift({
          id: uid("m"),
          nombre: f.nombre.trim(),
          cedula: f.cedula || "",
          proyecto: f.proyecto || "",
          detalle: f.detalle || "Informe pendiente",
          fecha: ctx.ahora,
          estado: "Pendiente",
          porRegistro: ctx.user.nombre,
        });
        n++;
      }
    });
    recalcularMorosidad(d);
    bit(d, ctx, T.cargaDeArchivoDePersonas, "", undefined, `${n} registros`);
    return `${n} personas agregadas desde el archivo.`;
  },
  regularizarMoroso(d, p, ctx) {
    requiere(ctx, ["direccion_investigacion"]);
    const m = d.morosos.find((x) => x.id === p.id);
    if (!p.soporte?.trim()) fallo(T.indiqueElSoporteOficioO);
    m.estado = "Regularizado";
    m.regularizado = { fecha: ctx.ahora, soporte: p.soporte, por: ctx.user.nombre };
    recalcularMorosidad(d);
    bit(d, ctx, T.situacionRegularizada, "", "Pendiente", `${m.nombre} · ${p.soporte}`);
    const afectadas = d.proposals.filter(
      (x) =>
        !esFinal(x) &&
        x.form &&
        (x.form.equipo || []).some((e) => norm(e.nombre) === norm(m.nombre)),
    );
    afectadas.forEach((x) =>
      notificar(
        d,
        ctx,
        [x.coordinadorId],
        T.condicionAnteLaVieRegularizada,
        `${m.nombre} está al día; se actualizó la observación de ${x.id}.`,
        x.id,
      ),
    );
    return `Situación de ${m.nombre} regularizada.`;
  },
};
