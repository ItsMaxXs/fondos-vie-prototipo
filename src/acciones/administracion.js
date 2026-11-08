// ============================================================
// Acciones · Usuarios, roles, comités e instancias
// Casos de uso del ERS: CU-17.
// Acciones incluidas: guardarUsuario, cambiarEstadoUsuario, guardarComite, guardarInstancia.
// Cada acción recibe (d, p, ctx): d = copia de la base, p = datos enviados por la pantalla, ctx = usuario, rol y hora. Si incumple una regla lanza fallo("mensaje").
// ============================================================
import { bit, requiere } from "./ayudas.js";
import { nombreInstancia } from "../reglas/alcance.js";
import { usuarioPorId } from "../reglas/consultas.js";
import { fallo } from "../reglas/errores.js";
import { textos as T } from "../textos/acciones/administracion.js";

export const accionesAdministracion = {
  guardarUsuario(d, p, ctx) {
    requiere(ctx, ["admin"]);
    const u = p.usuario;
    if (!u.nombre?.trim() || !/^\S+@\S+\.\S+$/.test(u.email || "")) fallo(T.indiqueElNombreYUn);
    if (!u.roles?.length) fallo(T.asigneAlMenosUnRol);
    const i = d.users.findIndex((x) => x.id === u.id);
    if (i >= 0) {
      bit(
        d,
        ctx,
        T.usuarioModificado,
        "",
        d.users[i].roles.map((r) => r.rol).join(", "),
        u.roles.map((r) => r.rol).join(", "),
      );
      d.users[i] = u;
    } else {
      u.id = "u_" + Math.random().toString(36).slice(2, 8);
      d.users.push(u);
      bit(d, ctx, T.usuarioCreado, "", undefined, u.nombre);
    }
    return T.usuarioGuardado;
  },
  cambiarEstadoUsuario(d, p, ctx) {
    requiere(ctx, ["admin"]);
    const u = usuarioPorId(d, p.id);
    u.estado = u.estado === "Activo" ? "Inactivo" : "Activo";
    bit(
      d,
      ctx,
      u.estado === "Activo" ? T.cuentaReactivada : T.cuentaDesactivada,
      "",
      undefined,
      u.nombre,
    );
    return u.estado === "Activo" ? T.cuentaReactivada2 : T.cuentaDesactivadaElHistorialSe;
  },
  guardarComite(d, p, ctx) {
    requiere(ctx, ["admin"]);
    if (!p.comite.integrantes.some((i) => i.coordina)) fallo(T.indiqueLaPersonaQueCoordina);
    d.comites[p.instancia] = p.comite;
    bit(
      d,
      ctx,
      T.comiteTecnicoModificado,
      "",
      undefined,
      `${nombreInstancia(d, p.instancia)}: ${p.comite.integrantes.length} integrantes`,
    );
    return T.comiteGuardado;
  },
  guardarInstancia(d, p, ctx) {
    requiere(ctx, ["admin"]);
    const i = d.instancias.findIndex((x) => x.id === p.instancia.id);
    if (i >= 0) d.instancias[i] = p.instancia;
    else d.instancias.push(p.instancia);
    bit(d, ctx, T.catalogoDeInstanciasModificado, "", undefined, p.instancia.nombre);
    return T.instanciaGuardada;
  },
};
