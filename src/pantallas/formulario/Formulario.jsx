// ============================================================
// Pantalla · formulario de propuesta (contenedor)
// Controla el paso actual, el guardado automático cada 60 segundos, el bloqueo al cerrar la recepción, el envío, el reenvío y la respuesta a observaciones.
// Cada paso es un archivo en la carpeta pasos/.
// ERS: CU-04, CU-05.
// ============================================================
import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Save, Send } from "lucide-react";
import { Nota } from "../../componentes/comunes/Mensajes.jsx";
import { Vacio } from "../../componentes/comunes/Vacio.jsx";
import { Incidencias, getP, setP } from "../../componentes/formulario/campos.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { Caja } from "../../componentes/ui/Caja.jsx";
import { CajaInstrucciones } from "../../componentes/ui/Campos.jsx";
import { EncabezadoPagina, Migas } from "../../componentes/ui/Encabezados.jsx";
import { Ventana } from "../../componentes/ui/Ventanas.jsx";
import { esDT, esFort } from "../../datos/modalidades.js";
import { PASOS } from "../../datos/pasos.js";
import { useApp } from "../../estado/contexto.js";
import { Paso1 } from "./pasos/Paso1.jsx";
import { Paso2 } from "./pasos/Paso2.jsx";
import { Paso3 } from "./pasos/Paso3.jsx";
import { Paso4 } from "./pasos/Paso4.jsx";
import { PasoDeclaracion } from "./pasos/PasoDeclaracion.jsx";
import { PasoDivulgacion } from "./pasos/PasoDivulgacion.jsx";
import { PasoDocumentos } from "./pasos/PasoDocumentos.jsx";
import { PasoEtica } from "./pasos/PasoEtica.jsx";
import { PasoPlan } from "./pasos/PasoPlan.jsx";
import { PasoPresupuesto } from "./pasos/PasoPresupuesto.jsx";
import { PasoProductos } from "./pasos/PasoProductos.jsx";
import { PasoResguardo } from "./pasos/PasoResguardo.jsx";
import { PasoRevision } from "./pasos/PasoRevision.jsx";
import { PasoTexto } from "./pasos/PasoTexto.jsx";
import { paramsDe, requierePI } from "../../reglas/consultas.js";
import { avanceGlobal, formVacio, pasosCompletos } from "../../reglas/formulario.js";
import { equipoMorosos } from "../../reglas/morosidad.js";
import { totalSolicitado } from "../../reglas/presupuesto.js";
import { cierreRecepcion, recepcionAbierta } from "../../reglas/recepcion.js";
import { validarPropuesta } from "../../reglas/validaciones.js";
import { diasHasta, fechaHora } from "../../utilidades/fechas.js";
import { colones, lineas } from "../../utilidades/formato.js";
import { clone } from "../../utilidades/ids.js";
import { ver } from "../../utilidades/rutas.js";
import { textos as T } from "../../textos/pantallas/formulario/Formulario.js";

export function Formulario() {
  const { id } = useParams();
  const { db, usuario, act, nav, ahora, toast } = useApp();
  const existente = id ? db.proposals.find((p) => p.id === id) : null;
  const conv = db.convocatorias.find((c) => c.estado === "Publicada");
  const params = paramsDe(db, existente?.convocatoriaId || conv?.id);
  const [form, setForm] = useState(() =>
    existente ? clone(existente.form) : formVacio(usuario, usuario.instancia || "COMP"),
  );
  const [propId, setPropId] = useState(existente?.id || null);
  const [paso, setPaso] = useState(0);
  const [sucio, setSucio] = useState(false);
  const [guardado, setGuardado] = useState(existente?.ultimoGuardado || null);
  const [confirmar, setConfirmar] = useState(false);
  const ref = useRef({});
  const estado = existente?.estado || "Borrador";
  const abierta = conv ? recepcionAbierta(db, conv.id, ahora) : false;
  const editableEstado = ["Borrador", "Devuelta por faltantes"].includes(estado);
  const soloVIE = estado === "Con observaciones";
  const bloqueado = !(editableEstado ? abierta : soloVIE);
  const esFort_ = esFort(form.modalidad);
  const esDT_ = esDT(form.modalidad);
  const issues = useMemo(() => validarPropuesta(form, { db, params, propId }), [form, db, propId]);
  const mor = useMemo(() => equipoMorosos(db, form), [form, db]);
  ref.current = { form, propId, sucio, bloqueado, editableEstado };

  const upd = (fn) => {
    if (bloqueado) return;
    setForm((f) => {
      const c = clone(f);
      fn(c);
      return c;
    });
    setSucio(true);
  };
  const b = (path) => ({
    value: getP(form, path) ?? "",
    onChange: (v) => upd((c) => setP(c, path, v)),
  });

  const guardar = (silencioso) => {
    const r = ref.current;
    if (r.bloqueado || !r.editableEstado) return null;
    const res = act(
      "guardarBorrador",
      { id: r.propId || undefined, form: r.form },
      { silent: !!silencioso },
    );
    if (res.ok) {
      const nuevo = res.resultado;
      if (nuevo && nuevo !== r.propId) {
        setPropId(nuevo);
        ref.current.propId = nuevo;
        nav(`/propuestas/${nuevo}/editar`, { replace: true });
      }
      setSucio(false);
      setGuardado(new Date().toISOString());
      return nuevo || r.propId;
    }
    return null;
  };
  // Guardado automático cada 60 segundos (RF-FOR-04)
  useEffect(() => {
    const t_ = window.setInterval(() => {
      if (ref.current.sucio && ref.current.form.titulo?.trim()) guardar(true);
    }, 60000);
    return () => window.clearInterval(t_);
  }, []);

  if (id && (!existente || existente.coordinadorId !== usuario.id))
    return <Vacio titulo={T.propuestaNoDisponible} texto={T.noExisteONoPertenece} />;
  if (id && !editableEstado && !soloVIE) return <Navigate to={ver(id)} replace />;

  const enviar = () => {
    let pid = propId;
    if (editableEstado) {
      pid = guardar(true);
      if (!pid) return;
    }
    const res = soloVIE
      ? act("responderObservacionesVIE", { id: pid, form })
      : act("enviarPropuesta", { id: pid, form });
    setConfirmar(false);
    if (res.ok) nav(ver(soloVIE ? pid : res.resultado || pid));
  };
  const errores = issues.filter((x) => x.nivel === "error");
  const comp = pasosCompletos(issues);
  const avance = avanceGlobal(issues);
  const issuesPaso = issues.filter((x) => x.paso === paso);
  const cierre = conv ? cierreRecepcion(db, conv.id) : null;
  const bloqueoMor = mor.length > 0 && params.politicaMorosidad === "bloquear";
  const obsAbiertas = (existente?.observaciones || []).filter((o) => !o.resuelta).slice(-4);

  const props = { f: form, b, upd, db, params, esFort_, esDT_, usuario };
  const contenido = [
    <Paso1 {...props} />,
    <Paso2 {...props} />,
    <Paso3 {...props} />,
    <Paso4 {...props} />,
    <PasoTexto b={b} campo="estadoArte" label={T.estadoDelArte} rows={12} />,
    <PasoTexto b={b} campo="metodologia" label={T.metodologia} rows={12} />,
    <PasoPlan {...props} />,
    <PasoPresupuesto {...props} />,
    <PasoProductos {...props} />,
    <PasoResguardo {...props} />,
    <PasoDivulgacion {...props} />,
    <PasoEtica {...props} />,
    <PasoTexto
      b={b}
      campo="hojaRuta"
      label={T.hojaDeRutaDeLa}
      rows={8}
      extra={<CajaInstrucciones title={T.hojaDeRuta}>{T.describaLaFasePreviaLa}</CajaInstrucciones>}
    />,
    <PasoTexto
      b={b}
      campo="referencias"
      label={T.referenciasBibliograficas}
      rows={12}
      extra={
        <CajaInstrucciones title={T.referencias}>
          {T.escribaUnaReferenciaPorLinea} {params.refsMin}
          {T.actualmente} {lineas(form.referencias).length}.
        </CajaInstrucciones>
      }
    />,
    <PasoDeclaracion {...props} />,
    <PasoDocumentos {...props} />,
    <PasoRevision
      f={form}
      issues={issues}
      irA={setPaso}
      params={params}
      db={db}
      mor={mor}
      estado={estado}
    />,
  ];

  return (
    <div>
      <Migas items={["Propuestas", propId || "Nueva propuesta"]} />
      <EncabezadoPagina
        eyebrow={conv ? conv.nombre : T.convocatoria}
        title={form.titulo?.trim() || T.nuevaPropuestaDeInvestigacion}
        description={bloqueado ? T.elFormularioEstaEnModo : T.completeLos17PasosEl}
        actions={
          !bloqueado && editableEstado ? (
            <Boton variant="secondary" icon={Save} onClick={() => guardar(false)}>
              {T.guardarBorrador}
            </Boton>
          ) : null
        }
      />
      {conv && (
        <Nota tipo={abierta ? "info" : "error"}>
          {abierta ? (
            <>
              {T.recepcionAbiertaHastaEl} <strong>{fechaHora(cierre)}</strong> (
              {Math.max(0, diasHasta(ahora, cierre))} {T.diasDespuesDeEsaFecha}
            </>
          ) : (
            <>
              {T.elPeriodoDeRecepcionCerro} <strong>{fechaHora(cierre)}</strong>.{" "}
              {editableEstado ? T.elFormularioYaNoAdmite : ""}
            </>
          )}
          {guardado && !bloqueado && (
            <span style={{ opacity: 0.75 }}>
              {" "}
              {T.ultimoGuardado} {fechaHora(guardado).slice(-5)}
              {sucio ? T.hayCambiosSinGuardar : ""}
            </span>
          )}
        </Nota>
      )}
      {obsAbiertas.length > 0 && (
        <Nota tipo="aviso">
          <strong>{T.observacionesPendientesDeAtender}</strong>
          {obsAbiertas.map((o, i) => (
            <div key={i}>
              • {o.texto} <span style={{ opacity: 0.7 }}>({o.autor})</span>
            </div>
          ))}
        </Nota>
      )}
      {mor.length > 0 && (
        <Nota tipo="aviso">
          {T.informesPendientesAnteLaVie} {mor.join(", ")}.{" "}
          {params.politicaMorosidad === "bloquear"
            ? T.elEnvioEstaBloqueado
            : T.seMuestraComoObservacionY}
        </Nota>
      )}
      <div className="wizard-layout wizard-layout-wide">
        <aside className="wizard-sidebar">
          <div className="wizard-progress-head">
            <span>{T.progreso}</span>
            <strong>{avance}%</strong>
          </div>
          <div className="progress-track">
            <div style={{ width: `${avance}%` }} />
          </div>
          <div className="wizard-steps wizard-steps-scroll">
            {PASOS.map((nombre, i) => (
              <button
                key={nombre}
                className={`${i === paso ? "active" : ""} ${comp[i] && i < 16 ? "done" : ""}`}
                onClick={() => setPaso(i)}
              >
                <span>{comp[i] && i < 16 ? <Check size={14} /> : i + 1}</span>
                <div>
                  <strong>{nombre}</strong>
                  <small>
                    {i === 16
                      ? T.resumen
                      : comp[i]
                        ? T.completo
                        : issues.some((x) => x.paso === i && x.nivel === "error")
                          ? T.incompleto
                          : T.pendiente}
                  </small>
                </div>
              </button>
            ))}
          </div>
        </aside>
        <Caja className="wizard-card">
          <div className="wizard-card-head institutional-form-head">
            <div>
              <span className="eyebrow">
                {T.formularioVie2027Paso} {paso + 1} de {PASOS.length}
              </span>
              <h2>{PASOS[paso]}</h2>
            </div>
            <div className="form-code">
              <strong>{T.fVie2027}</strong>
              <span>{propId || T.sinGuardar}</span>
            </div>
          </div>
          <div className="wizard-body">
            <fieldset
              disabled={bloqueado}
              style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
            >
              {contenido[paso]}
            </fieldset>
            {paso !== 16 && <Incidencias items={issuesPaso} />}
          </div>
          <div className="wizard-footer">
            <Boton
              variant="secondary"
              icon={ArrowLeft}
              disabled={paso === 0}
              onClick={() => setPaso(paso - 1)}
            >
              {T.anterior}
            </Boton>
            <div className="wizard-footer-right">
              {!bloqueado && editableEstado && (
                <Boton variant="ghost" onClick={() => guardar(false)}>
                  {T.guardar}
                </Boton>
              )}
              {paso < 16 ? (
                <Boton icon={ArrowRight} onClick={() => setPaso(paso + 1)}>
                  {T.siguiente}
                </Boton>
              ) : (
                <Boton
                  icon={Send}
                  disabled={bloqueado || errores.length > 0 || bloqueoMor}
                  onClick={() => setConfirmar(true)}
                >
                  {soloVIE
                    ? T.enviarCorreccion
                    : estado === "Devuelta por faltantes"
                      ? T.reenviarPropuesta
                      : T.enviarPropuesta}
                </Boton>
              )}
            </div>
          </div>
        </Caja>
      </div>
      <Ventana
        open={confirmar}
        onClose={() => setConfirmar(false)}
        title={T.confirmarEnvio}
        description={T.alConfirmarLaPropuestaQueda}
        footer={
          <>
            <Boton variant="secondary" onClick={() => setConfirmar(false)}>
              {T.cancelar}
            </Boton>
            <Boton icon={Send} onClick={enviar}>
              {T.confirmarYEnviar}
            </Boton>
          </>
        }
      >
        <div className="detail-grid">
          <div>
            <span>{T.proyecto}</span>
            <strong>{form.titulo}</strong>
          </div>
          <div>
            <span>{T.modalidad}</span>
            <strong>{form.modalidad}</strong>
          </div>
          <div>
            <span>{T.totalSolicitado}</span>
            <strong>{colones(totalSolicitado(form, params))}</strong>
          </div>
          <div>
            <span>{T.ruta}</span>
            <strong>
              {requierePI(form) ? T.centroDeVinculacionComiteTecnico : T.comiteTecnicoSinDictamenPi}
            </strong>
          </div>
        </div>
      </Ventana>
    </div>
  );
}
