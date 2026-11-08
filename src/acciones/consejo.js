// ============================================================
// Acciones · Votación y aval del Consejo de Escuela
// Casos de uso del ERS: CU-10.
// Acciones incluidas: conocerNoRecomendada, registrarSesion, abrirConsulta, votarConsulta, cerrarConsulta, registrarAval.
// Cada acción recibe (d, p, ctx): d = copia de la base, p = datos enviados por la pantalla, ctx = usuario, rol y hora. Si incumple una regla lanza fallo("mensaje").
// ============================================================
import { bit, evento, notificar, requiere } from "./ayudas.js";
import { nombreInstancia } from "../reglas/alcance.js";
import { paramsDe, propDe } from "../reglas/consultas.js";
import { fallo } from "../reglas/errores.js";
import { fechaCorta, fechaHora } from "../utilidades/fechas.js";
import { num, pad } from "../utilidades/formato.js";
import { textos as T } from "../textos/acciones/consejo.js";

export const accionesConsejo = {
  conocerNoRecomendada(d, p, ctx) {
    requiere(ctx, ["consejo_asistente", "consejo"]);
    const prop = propDe(d, p.id);
    if (prop.estado !== "No recomendada por el Comité") fallo(T.laPropuestaNoEstaPendiente);
    prop.consejo = {
      ...(prop.consejo || {}),
      conocido: { fecha: ctx.ahora, por: ctx.user.nombre },
    };
    prop.final = true;
    evento(d, prop, ctx, T.consejoConocioElDictamenDesfavorable, T.quedaRegistradoQueElConsejo);
    return T.conocimientoDelConsejoRegistrado;
  },
  registrarSesion(d, p, ctx) {
    requiere(ctx, ["consejo_asistente"]);
    const prop = propDe(d, p.id);
    if (prop.estado !== "En trámite de aval") fallo(T.laPropuestaNoEstaEn);
    if (!p.numero || !p.fecha) fallo(T.indiqueElNumeroYLa);
    const instancias = [prop.instancia, ...(prop.form.participantes || [])];
    prop.consejo = {
      sesion: { tipo: p.tipo, numero: p.numero, fecha: p.fecha, plazo: p.plazo || "" },
      avales: instancias.map((i, k) => ({
        instanciaId: i,
        tipo: k === 0 ? "Coordinadora" : "Participante",
        estado: "Pendiente",
      })),
    };
    evento(
      d,
      prop,
      ctx,
      T.expedienteEnviadoAlConsejo,
      `${p.tipo} N.º ${p.numero} del ${fechaCorta(p.fecha)}.`,
    );
    notificar(
      d,
      ctx,
      ["consejo", "direccion_escuela"],
      T.propuestaIncluidaEnLaAgenda,
      `${prop.id} se vota en ${p.tipo.toLowerCase()} N.º ${p.numero}.`,
      prop.id,
      prop.instancia,
    );
    return T.expedienteEnviadoAlConsejo2;
  },
  abrirConsulta(d, p, ctx) {
    requiere(ctx, ["consejo_asistente"]);
    const prop = propDe(d, p.id);
    if (!prop.consejo?.sesion) fallo(T.primeroRegistreLaSesionO);
    prop.consejo.consulta = { abierta: true, plazo: p.plazo, papeletas: [], votaron: [] };
    bit(d, ctx, T.consultaFormalAbierta, prop.id, undefined, `Plazo ${p.plazo}`);
    notificar(
      d,
      ctx,
      ["consejo"],
      T.consultaFormalAbierta,
      `Vote ${prop.id} antes del ${fechaHora(p.plazo)}.`,
      prop.id,
      prop.instancia,
    );
    return T.consultaFormalAbierta2;
  },
  votarConsulta(d, p, ctx) {
    requiere(ctx, ["consejo"]);
    const prop = propDe(d, p.id);
    const c = prop.consejo?.consulta;
    if (!c?.abierta) fallo(T.noHayUnaConsultaFormal);
    if (c.plazo && ctx.ahora > c.plazo) fallo(T.elPlazoDeLaConsulta);
    if (c.votaron.includes(ctx.user.id)) fallo(T.ustedYaEmitioSuVoto);
    if (!["Aprobar", "No aprobar", "Abstención"].includes(p.voto)) fallo(T.elijaUnaOpcion);
    const r = ctx.user.roles.find((x) => x.rol === "consejo");
    c.papeletas.push({ voto: p.voto, presidencia: !!r?.preside });
    c.votaron.push(ctx.user.id);
    bit(d, ctx, T.votoEmitidoSecreto, prop.id);
    return T.suVotoFueRegistradoDe;
  },
  cerrarConsulta(d, p, ctx) {
    requiere(ctx, ["consejo"]);
    const r = ctx.user.roles?.find((x) => x.rol === "consejo");
    if (!r?.preside && ctx.rol !== "admin") fallo(T.soloLaPersonaQuePreside);
    const prop = propDe(d, p.id);
    const c = prop.consejo?.consulta;
    if (!c?.abierta) fallo(T.noHayUnaConsultaAbierta);
    const cuenta = { favor: 0, contra: 0, abst: 0 };
    c.papeletas.forEach((x) =>
      x.voto === "Aprobar"
        ? cuenta.favor++
        : x.voto === "No aprobar"
          ? cuenta.contra++
          : cuenta.abst++,
    );
    let sugerido;
    if (cuenta.favor + cuenta.contra === 0) sugerido = "Pendiente de decisión";
    else if (cuenta.favor !== cuenta.contra)
      sugerido = cuenta.favor > cuenta.contra ? "Aprobado" : "Rechazado";
    else {
      const pres = c.papeletas.find((x) => x.presidencia);
      if (
        paramsDe(d, prop.convocatoriaId).votoDobleDePresidencia &&
        pres &&
        pres.voto !== "Abstención"
      ) {
        pres.voto === "Aprobar" ? cuenta.favor++ : cuenta.contra++;
        sugerido = pres.voto === "Aprobar" ? "Aprobado" : "Rechazado";
        c.desempate = "Se aplicó el voto doble de quien preside.";
      } else sugerido = "Pendiente de decisión";
    }
    c.abierta = false;
    c.cerrada = ctx.ahora;
    c.conteo = cuenta;
    c.sugerido = sugerido;
    const aval = prop.consejo.avales[0];
    aval.votos = { ...cuenta };
    bit(
      d,
      ctx,
      T.consultaFormalCerrada,
      prop.id,
      undefined,
      `${cuenta.favor} a favor, ${cuenta.contra} en contra, ${cuenta.abst} abstenciones · ${sugerido}`,
    );
    notificar(
      d,
      ctx,
      ["consejo_asistente"],
      T.votacionCerrada,
      `${prop.id}: ${cuenta.favor} a favor, ${cuenta.contra} en contra, ${cuenta.abst} abstenciones. Registre el acuerdo.`,
      prop.id,
      prop.instancia,
    );
    return T.votacionCerradaLaSecretariaSolo;
  },
  registrarAval(d, p, ctx) {
    requiere(ctx, ["consejo_asistente", "consejo"]);
    const prop = propDe(d, p.id);
    if (prop.estado !== "En trámite de aval") fallo(T.laPropuestaNoEstaEn);
    const aval =
      prop.consejo?.avales?.find((a) => a.instanciaId === p.instanciaId) ||
      fallo(T.noSeEncontroElAval);
    if (aval.estado !== "Pendiente") fallo(T.eseAvalYaFueRegistrado);
    const v = p.votos || {};
    const favor = num(v.favor),
      contra = num(v.contra),
      abst = num(v.abst);
    if (favor + contra + abst === 0) fallo(T.registreLaCantidadDeVotos);
    if (!["Aprobado", "Rechazado"].includes(p.resultado)) fallo(T.indiqueElResultadoFinalDel);
    if (!String(p.justificacion || "").trim()) fallo(T.laJustificacionEscritaEsObligatoria);
    if (!p.articulo?.trim() || !p.fechaAcuerdo) fallo(T.registreElArticuloYLa);
    if (favor > contra && p.resultado === "Rechazado") fallo(T.elResultadoNoCoincideCon);
    if (contra > favor && p.resultado === "Aprobado") fallo(T.elResultadoNoCoincideCon2);
    if (favor === contra) {
      if (!paramsDe(d, prop.convocatoriaId).votoDobleDePresidencia) fallo(T.hayEmpateYLaRegla);
      if (!p.votoPresidencia || p.votoPresidencia === "Abstención")
        fallo(T.pendienteHayEmpateYQuien);
    }
    if (p.resultado === "Aprobado") {
      const c = p.contenido || {};
      const faltan = ["propuesta", "personas", "titularCons", "calificacion"].filter((k) => !c[k]);
      if (faltan.length) fallo(T.elAcuerdoDebeContenerAval);
      if (!p.adjunto) fallo(T.adjunteElActaUOficio);
    }
    Object.assign(aval, {
      estado: p.resultado,
      votos: { favor, contra, abst },
      articulo: p.articulo,
      fechaAcuerdo: p.fechaAcuerdo,
      justificacion: p.justificacion,
      adjunto: !!p.adjunto,
      registrado: ctx.ahora,
      por: ctx.user.nombre,
    });
    const nombreI = nombreInstancia(d, aval.instanciaId);
    if (p.resultado === "Rechazado") {
      prop.final = true;
      evento(d, prop, ctx, T.avalRechazado, `${nombreI}: ${p.justificacion}`, "No avalada");
      prop.observaciones.push({
        autor: `Consejo de ${nombreI}`,
        texto: p.justificacion,
        fecha: ctx.ahora,
        fuente: "Consejo",
      });
      notificar(
        d,
        ctx,
        [prop.coordinadorId],
        T.avalRechazado,
        `${prop.id} no fue avalada. ${p.justificacion}`,
        prop.id,
      );
      return T.avalRechazadoLaPropuestaQueda;
    }
    evento(
      d,
      prop,
      ctx,
      `Aval aprobado por ${nombreI}`,
      `Artículo ${p.articulo}. ${favor} a favor, ${contra} en contra, ${abst} abstenciones.`,
    );
    if (prop.consejo.avales.every((a) => a.estado === "Aprobado")) {
      prop.oficioAval = `ESC-COMP-${pad(++d.contador.oficioAval)}-2026`;
      evento(
        d,
        prop,
        ctx,
        T.todosLosAvalesAprobados,
        `Se generó el oficio ${prop.oficioAval}.`,
        "Avalada",
      );
      notificar(
        d,
        ctx,
        ["direccion_escuela"],
        T.avalPendienteDeComunicar,
        `${prop.id} fue avalada. Comunique el aval a la VIE.`,
        prop.id,
        prop.instancia,
      );
      notificar(
        d,
        ctx,
        [prop.coordinadorId],
        T.propuestaAvalada,
        `${prop.id} obtuvo el aval de todas las instancias.`,
        prop.id,
      );
    }
    return T.avalRegistradoCorrectamente;
  },
};
