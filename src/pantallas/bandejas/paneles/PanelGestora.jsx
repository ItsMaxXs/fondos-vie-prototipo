// ============================================================
// Panel · Gestora de la VIE
// Verificación de requisitos, observaciones y paso a la Dirección de Investigación. ERS: CU-12.
// ============================================================
import { useState } from "react";
import { CheckCheck, MessageSquareText, Plus, Send } from "lucide-react";
import { Nota } from "../../../componentes/comunes/Mensajes.jsx";
import { Area, Sel, Txt } from "../../../componentes/formulario/campos.jsx";
import { Boton } from "../../../componentes/ui/Boton.jsx";
import { Ventana } from "../../../componentes/ui/Ventanas.jsx";
import { CHECKS_VIE } from "../../../datos/listasVerificacion.js";
import { PASOS } from "../../../datos/pasos.js";
import { useApp } from "../../../estado/contexto.js";
import { norm } from "../../../reglas/formulario.js";
import { fechaCorta } from "../../../utilidades/fechas.js";
import { textos as T } from "../../../textos/pantallas/bandejas/paneles/PanelGestora.js";

export function PanelGestora({ p }) {
  const { db, act } = useApp();
  const [checks, setChecks] = useState({
    ...Object.fromEntries(CHECKS_VIE.map((k) => [k, false])),
    ...(p.vie?.checks || {}),
  });
  const [obs, setObs] = useState(null);
  const [prev, setPrev] = useState("");
  const otras = (p.form?.equipo || [])
    .map((m) => ({
      m,
      en: db.proposals.filter(
        (o) =>
          o.id !== p.id &&
          !o.historico &&
          o.form &&
          o.estado !== "No admitida" &&
          (o.form.equipo || []).some((e) => norm(e.nombre) === norm(m.nombre)),
      ),
    }))
    .filter((x) => x.en.length);
  if (p.estado === "Borrador")
    return (
      <div className="stack-lg">
        <Nota>{T.observacionPreventivaPuedeOrientarA}</Nota>
        <Area label={T.observacion} rows={3} value={prev} onChange={setPrev} />
        <div className="action-row end">
          <Boton
            icon={MessageSquareText}
            onClick={() => {
              const r = act("observacionPreventiva", { id: p.id, texto: prev });
              if (r.ok) setPrev("");
            }}
          >
            {T.enviarObservacion}
          </Boton>
        </div>
      </div>
    );
  if (p.estado === "Comunicada a la VIE")
    return (
      <div className="stack-lg">
        <Nota>
          {T.laInstanciaComunicoElAval} <strong>{p.comunicacionVIE.oficio}</strong>
          {T.confirmeQueRecibioElExpediente}
        </Nota>
        <div className="action-row end">
          <Boton icon={CheckCheck} onClick={() => act("confirmarRecepcionVIE", { id: p.id })}>
            {T.confirmarRecepcion}
          </Boton>
        </div>
      </div>
    );
  if (!["En revisión VIE", "Con observaciones", "Lista para CIE"].includes(p.estado))
    return <Nota>{T.estaPropuestaNoEstaEn}</Nota>;
  const di_ = p.vie?.dictamenDI;
  const editable = p.estado === "En revisión VIE";
  return (
    <div className="stack-lg">
      {otras.length > 0 && (
        <Nota tipo="aviso">
          {T.participacionEnVariasPropuestasCorrobore}{" "}
          {otras
            .map((x) => `${x.m.nombre} también está en ${x.en.map((o) => o.id).join(", ")}`)
            .join("; ")}
          .
        </Nota>
      )}
      {(p.morosidad || []).length > 0 && (
        <Nota tipo="aviso">
          {T.informesPendientesAnteLaVie} {p.morosidad.join(", ")}.
        </Nota>
      )}
      <Nota tipo={di_ ? "info" : "aviso"}>
        {di_
          ? `Dictamen de la Dirección de Investigación: ${di_.oficio} · ${di_.resultado}.`
          : T.faltaElDictamenDeLa}
      </Nota>
      {(p.vie?.observaciones || []).map((o, i) => (
        <Nota key={i} tipo="aviso">
          <strong>{o.seccion}</strong>: {o.texto}{" "}
          <span style={{ opacity: 0.6 }}>({fechaCorta(o.fecha)})</span>
        </Nota>
      ))}
      <div className="checklist">
        {CHECKS_VIE.map((k) => (
          <label key={k} className="ers-check">
            <input
              type="checkbox"
              disabled={!editable}
              checked={!!checks[k]}
              onChange={(e) => setChecks({ ...checks, [k]: e.target.checked })}
            />
            <div>
              <strong>{k}</strong>
            </div>
          </label>
        ))}
      </div>
      {editable && (
        <div className="action-row end">
          <Boton variant="ghost" onClick={() => act("guardarRevisionVIE", { id: p.id, checks })}>
            {T.guardarVerificacion}
          </Boton>
          <Boton
            variant="secondary"
            icon={MessageSquareText}
            onClick={() => setObs([{ seccion: PASOS[0], texto: "" }])}
          >
            {T.observar}
          </Boton>
          <Boton
            icon={Send}
            onClick={() => {
              act("guardarRevisionVIE", { id: p.id, checks });
              act("marcarListaCIE", { id: p.id });
            }}
          >
            {T.enviarAlCie}
          </Boton>
        </div>
      )}
      <Ventana
        open={!!obs}
        onClose={() => setObs(null)}
        title={T.observacionesAlExpediente}
        description={T.laPersonaCoordinadoraCorregiraEstos}
        footer={
          <>
            <Boton variant="secondary" onClick={() => setObs(null)}>
              {T.cancelar}
            </Boton>
            <Boton
              onClick={() => {
                const r = act("observarVIE", { id: p.id, observaciones: obs });
                if (r.ok) setObs(null);
              }}
            >
              {T.enviarObservaciones}
            </Boton>
          </>
        }
      >
        {obs && (
          <div className="stack-md">
            {obs.map((o, i) => (
              <div key={i} className="form-grid two-col">
                <Sel
                  label={T.seccion}
                  value={o.seccion}
                  onChange={(v) => setObs(obs.map((x, k) => (k === i ? { ...x, seccion: v } : x)))}
                  opciones={PASOS.slice(0, 16)}
                />
                <Txt
                  label={T.observacion}
                  value={o.texto}
                  onChange={(v) => setObs(obs.map((x, k) => (k === i ? { ...x, texto: v } : x)))}
                />
              </div>
            ))}
            <Boton
              variant="secondary"
              icon={Plus}
              onClick={() => setObs([...obs, { seccion: PASOS[0], texto: "" }])}
            >
              {T.agregarOtra}
            </Boton>
          </div>
        )}
      </Ventana>
    </div>
  );
}
