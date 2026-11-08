// ============================================================
// Panel · Dirección de Investigación
// Dictamen institucional, marcar lista para CIE y notificar la resolución. ERS: CU-12, CU-14.
// ============================================================
import { useMemo, useState } from "react";
import { CheckCheck, FileCheck2, Mail } from "lucide-react";
import { Dato } from "../../../componentes/comunes/Datos.jsx";
import { Nota } from "../../../componentes/comunes/Mensajes.jsx";
import { Area, Bloque } from "../../../componentes/formulario/campos.jsx";
import { Boton } from "../../../componentes/ui/Boton.jsx";
import { CajaInstrucciones } from "../../../componentes/ui/Campos.jsx";
import { useApp } from "../../../estado/contexto.js";
import { paramsDe } from "../../../reglas/consultas.js";
import { equipoMorosos } from "../../../reglas/morosidad.js";
import { validarPropuesta } from "../../../reglas/validaciones.js";
import { fechaCorta, fechaHora } from "../../../utilidades/fechas.js";
import { textos as T } from "../../../textos/pantallas/bandejas/paneles/PanelDI.js";

// ---------- Dirección de Investigación (CU-12 dictamen, CU-14 notificación) ----------
export function PanelDI({ p }) {
  const { db, act } = useApp();
  const params = paramsDe(db, p.convocatoriaId);
  const auto = useMemo(() => {
    if (!p.form) return {};
    const is = validarPropuesta(p.form, { db, params, propId: p.id });
    const sin = (fn) => !is.some((x) => fn(x));
    return {
      morosidad: {
        ok: equipoMorosos(db, p.form).length === 0,
        ev: equipoMorosos(db, p.form).length
          ? `Con informes pendientes: ${equipoMorosos(db, p.form).join(", ")}`
          : "Todo el equipo está al día.",
      },
      riesgos: {
        ok: sin((x) => x.paso === 6 && x.nivel === "error"),
        ev: "Plan de acción: cada actividad con riesgo, mitigación y responsable.",
      },
      estudiantes: {
        ok: sin((x) => x.regla === "RN-27"),
        ev: "Participación estudiantil (becas o trabajos finales de graduación).",
      },
      etica: {
        ok: sin((x) => x.paso === 11 && x.nivel === "error"),
        ev: "Admisibilidad ética y regulatoria respondida.",
      },
      documentacion: {
        ok: sin((x) => x.paso === 15 && x.nivel === "error"),
        ev: "Documentos de respaldo adjuntos.",
      },
    };
  }, [p, db]);
  const nombres = {
    morosidad: "Situación de informes pendientes",
    riesgos: "Gestión de riesgos",
    estudiantes: "Participación estudiantil",
    etica: "Aspectos éticos y regulatorios",
    documentacion: "Documentación completa",
  };
  const [v, setV] = useState(() =>
    Object.fromEntries(Object.entries(auto).map(([k, x]) => [k, { ok: x.ok }])),
  );
  const [coment, setComent] = useState("");
  const res = p.cie?.resolucion;
  const pendNotif = ["Aprobada", "Aprobada con condiciones", "Rechazada"].includes(p.estado);
  return (
    <div className="stack-lg">
      {["En revisión VIE", "Con observaciones", "Lista para CIE"].includes(p.estado) &&
        !p.vie?.dictamenDI?.emitido && (
          <Bloque n="1" titulo={T.dictamenInstitucionalVerificacionesGuiadas}>
            <CajaInstrucciones title={T.verificacionesGuiadas}>
              {T.elSistemaPreseleccionaCadaVerificacion}
            </CajaInstrucciones>
            {Object.entries(nombres).map(([k, n]) => (
              <div key={k} className="ers-row" style={{ alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <strong>{n}</strong>
                  <span style={{ display: "block", fontSize: 12.5 }}>{auto[k]?.ev}</span>
                </div>
                <div className="choice-row">
                  {[
                    ["Cumple", true],
                    ["No cumple", false],
                  ].map(([l, val]) => (
                    <label key={l} className={`radio-choice ${v[k]?.ok === val ? "selected" : ""}`}>
                      <input
                        type="radio"
                        checked={v[k]?.ok === val}
                        onChange={() => setV({ ...v, [k]: { ok: val } })}
                      />
                      <span className="radio-dot" />
                      <span>{l}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <Area
              label={T.comentarioDelDictamenOpcional}
              rows={3}
              value={coment}
              onChange={setComent}
            />
            <div className="action-row end">
              <Boton
                icon={FileCheck2}
                onClick={() =>
                  act("emitirDictamenDI", { id: p.id, verificaciones: v, comentario: coment })
                }
              >
                {T.emitirDictamen}
              </Boton>
            </div>
          </Bloque>
        )}
      {p.vie?.dictamenDI?.emitido && (
        <Nota>
          {T.dictamenEmitido} {p.vie.dictamenDI.oficio} · {p.vie.dictamenDI.resultado} ·{" "}
          {fechaCorta(p.vie.dictamenDI.fecha)}.
        </Nota>
      )}
      {pendNotif && (
        <Bloque n="2" titulo={T.notificacionFormalDelResultado}>
          <div className="detail-grid">
            <Dato k="Resolución" v={res?.numero} />
            <Dato k="Resultado" v={res?.resultado} />
            <Dato k="Justificación" v={res?.justificacion} />
            {res?.condiciones && <Dato k="Condiciones" v={res.condiciones} />}
          </div>
          <div className="action-row end">
            <Boton icon={Mail} onClick={() => act("notificarResolucion", { id: p.id })}>
              {T.notificarALaPersonaCoordinadora}
            </Boton>
          </div>
        </Bloque>
      )}
      {p.estado === "Notificada" && p.notificacion && (
        <Nota>
          {T.notificadaEl} {fechaHora(p.notificacion.fecha)} {T.oficio} {p.notificacion.numero}
          {T.elExpedientePasoAlHistorico}
        </Nota>
      )}
      {p.carta?.requerida && (
        <Nota tipo={p.carta.recibida ? "info" : "aviso"}>
          {p.carta.recibida
            ? `Carta de aceptación recibida el ${fechaCorta(p.carta.fecha)} (${p.carta.archivo}). `
            : T.pendienteLaCartaDeAceptacion}
          {p.carta.recibida && !p.carta.confirmada && (
            <Boton
              variant="secondary"
              icon={CheckCheck}
              onClick={() => act("confirmarCarta", { id: p.id })}
            >
              {T.confirmarRecepcion}
            </Boton>
          )}
          {p.carta.confirmada && T.recepcionConfirmada}
        </Nota>
      )}
      {!pendNotif &&
        !["En revisión VIE", "Con observaciones", "Lista para CIE"].includes(p.estado) &&
        !p.carta?.requerida && <Nota>{T.estaPropuestaNoEstaEn}</Nota>}
    </div>
  );
}
