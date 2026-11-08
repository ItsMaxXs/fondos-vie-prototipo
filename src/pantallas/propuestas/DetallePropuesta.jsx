// ============================================================
// Pantalla · detalle de propuesta
// Pestañas: resumen, línea de tiempo, versiones, evaluación, dictámenes, documentos y exportación. Registra consultas en la bitácora.
// ERS: CU-16, RF-ADM-03.
// ============================================================
import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Archive, FileSpreadsheet, FileText, FileUp, PencilLine } from "lucide-react";
import { Dato } from "../../componentes/comunes/Datos.jsx";
import { EstadoInsignia, Insignia } from "../../componentes/comunes/Insignias.jsx";
import { Nota } from "../../componentes/comunes/Mensajes.jsx";
import { Pestanas } from "../../componentes/comunes/Pestanas.jsx";
import { Vacio } from "../../componentes/comunes/Vacio.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { Caja } from "../../componentes/ui/Caja.jsx";
import { EncabezadoPagina, Migas, TituloSeccion } from "../../componentes/ui/Encabezados.jsx";
import { LineaTiempo, Tabla } from "../../componentes/ui/Tablas.jsx";
import { Ventana } from "../../componentes/ui/Ventanas.jsx";
import { ETAPAS } from "../../datos/estados.js";
import { useApp } from "../../estado/contexto.js";
import { BANDEJAS } from "../bandejas/registro.js";
import { ResumenFormulario } from "./ResumenFormulario.jsx";
import { VersionesComparar } from "./VersionesComparar.jsx";
import { nombreInstancia } from "../../reglas/alcance.js";
import { esFinal, etapaDe } from "../../reglas/estados.js";
import { norm } from "../../reglas/formulario.js";
import { recepcionAbierta } from "../../reglas/recepcion.js";
import { exportarCSV, exportarPDF, exportarPaquete } from "../../utilidades/exportaciones.js";
import { fechaCorta, fechaHora } from "../../utilidades/fechas.js";
import { textos as T } from "../../textos/pantallas/propuestas/DetallePropuesta.js";

export function DetallePropuesta() {
  const { id } = useParams();
  const loc = useLocation();
  const { db, usuario, rol, act, nav, ahora } = useApp();
  const p = db.proposals.find((x) => x.id === id);
  const enBandeja = loc.pathname.startsWith("/bandeja");
  const [tab, setTab] = useState(enBandeja && BANDEJAS[rol] ? "accion" : "resumen");
  const [cartaAbierta, setCarta] = useState(false);
  const [archivo, setArchivo] = useState("");
  if (!p) return <Vacio titulo={T.propuestaNoEncontrada} texto={T.puedeQueHayaCambiadoDe} />;
  const esDueno = p.coordinadorId === usuario.id;
  const verTodo =
    rol !== "investigador" ||
    esDueno ||
    (p.form?.equipo || []).some((x) => norm(x.nombre) === norm(usuario.nombre));
  if (!verTodo) return <Vacio titulo={T.sinAcceso} texto={T.estaPropuestaNoPerteneceA} />;
  const puedeBitacora = ["admin", "gestora_vie", "direccion_investigacion"].includes(rol);
  const Panel = BANDEJAS[rol]?.panel;
  const pestanas = [
    ...(enBandeja && Panel ? [["accion", "Acción del rol"]] : []),
    ["resumen", "Formulario"],
    ["seguimiento", "Seguimiento"],
    ...(p.consejo?.avales ? [["avales", "Avales"]] : []),
    ["versiones", `Versiones (${p.versiones?.length || 0})`],
    ...(puedeBitacora ? [["bitacora", "Bitácora"]] : []),
  ];
  const editable =
    rol === "investigador" &&
    esDueno &&
    ["Borrador", "Devuelta por faltantes", "Con observaciones"].includes(p.estado);
  const resolucion = p.estado === "Notificada" && p.cie?.resolucion;
  return (
    <div>
      <Migas items={[enBandeja ? "Bandeja" : "Propuestas", p.id]} />
      <EncabezadoPagina
        eyebrow={`${p.id} · ${p.modalidad}`}
        title={p.titulo || T.borradorSinTitulo}
        description={`${p.investigadora} · ${p.escuela} · ${p.presupuesto}`}
        actions={
          <>
            <EstadoInsignia estado={p.estado} />
            {editable && (
              <Boton icon={PencilLine} onClick={() => nav(`/propuestas/${p.id}/editar`)}>
                {p.estado === "Con observaciones" ? T.atenderObservaciones : T.editar}
              </Boton>
            )}
            {p.form && (
              <Boton variant="secondary" icon={FileText} onClick={() => exportarPDF(db, p)}>
                {T.pdf}
              </Boton>
            )}
            {p.form && (
              <Boton variant="secondary" icon={FileSpreadsheet} onClick={() => exportarCSV(db, p)}>
                {T.excel}
              </Boton>
            )}
            {p.form && rol !== "investigador" && (
              <Boton
                variant="secondary"
                icon={Archive}
                onClick={() => {
                  exportarPaquete(db, p);
                  act(
                    "registrarConsulta",
                    {
                      id: p.id,
                      accion: "Descarga de expediente completo",
                      detalle: "Formularios, dictámenes, avales y bitácora",
                    },
                    { silent: true },
                  );
                }}
              >
                {T.expediente}
              </Boton>
            )}
          </>
        }
      />
      <Caja>
        <LineaTiempo
          stages={ETAPAS}
          current={Math.min(6, etapaDe(p.estado))}
          piRequired={p.piRequired}
        />
      </Caja>
      {p.estado === "Devuelta por faltantes" && (
        <Nota tipo="aviso">
          {T.laPropuestaFueDevueltaPor}{" "}
          {recepcionAbierta(db, p.convocatoriaId, ahora)
            ? T.puedeCorregirlaYReenviarlaAntes
            : T.elPeriodoDeRecepcionYa}
        </Nota>
      )}
      {p.estado === "Con observaciones" && <Nota tipo="aviso">{T.laPersonaGestoraDeLa}</Nota>}
      {(p.morosidad || []).length > 0 && !esFinal(p) && (
        <Nota tipo="aviso">
          {T.informesPendientesAnteLaVie} {p.morosidad.join(", ")}.
        </Nota>
      )}
      {p.estado === "Notificada" && p.carta?.requerida && esDueno && (
        <Nota tipo={p.carta.recibida ? "info" : "aviso"}>
          {p.carta.recibida
            ? `Carta de aceptación de condiciones recibida (${p.carta.archivo}).`
            : T.debeRemitirLaCartaDe}
          {!p.carta.recibida && (
            <>
              {" "}
              <Boton variant="secondary" icon={FileUp} onClick={() => setCarta(true)}>
                {T.cargarCarta}
              </Boton>
            </>
          )}
        </Nota>
      )}
      {resolucion && (esDueno || rol !== "investigador") && (
        <Caja style={{ marginTop: 14 }}>
          <TituloSeccion
            title={T.resolucionDelCie}
            description={`${p.cie.resolucion.numero} · ${fechaCorta(p.cie.resolucion.fecha)}`}
          />
          <div className="detail-grid">
            <Dato k="Resultado" v={p.cie.resolucion.resultado} />
            <Dato k="Justificación" v={p.cie.resolucion.justificacion} />
            {p.cie.resolucion.condiciones && (
              <Dato k="Condiciones" v={p.cie.resolucion.condiciones} />
            )}
            <Dato k="Notificación formal" v={p.notificacion?.numero} />
          </div>
        </Caja>
      )}
      <Caja style={{ marginTop: 14 }}>
        <Pestanas valor={tab} onChange={setTab} items={pestanas} />
        {tab === "accion" && Panel && <Panel p={p} />}
        {tab === "resumen" && p.form && <ResumenFormulario p={p} />}
        {tab === "resumen" && !p.form && <Nota>{T.registroHistoricoSoloSeConserva}</Nota>}
        {tab === "seguimiento" && (
          <div className="stack-lg">
            {(p.observaciones || []).length > 0 && (
              <div>
                <strong>{T.observaciones}</strong>
                {p.observaciones.map((o, i) => (
                  <Nota key={i} tipo={o.resuelta ? "info" : "aviso"}>
                    <strong>{o.autor}</strong> · {fechaHora(o.fecha)}
                    <br />
                    {o.texto}
                    {o.resuelta ? T.atendida : ""}
                  </Nota>
                ))}
              </div>
            )}
            <div className="timeline" style={{ display: "block" }}>
              {(p.timeline || [])
                .slice()
                .reverse()
                .map((e, i) => (
                  <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid #eef0f3" }}>
                    <strong>{e.titulo}</strong>{" "}
                    <span style={{ opacity: 0.6, fontSize: 12.5 }}>
                      · {fechaHora(e.fecha)} · {e.por}
                    </span>
                    <div style={{ fontSize: 14 }}>{e.detalle}</div>
                  </div>
                ))}
            </div>
          </div>
        )}
        {tab === "avales" && p.consejo?.avales && (
          <Tabla
            columns={[
              { key: "instanciaId", label: T.instancia, render: (v) => nombreInstancia(db, v) },
              { key: "tipo", label: T.tipo },
              {
                key: "estado",
                label: T.aval,
                render: (v) => (
                  <Insignia
                    tono={v === "Aprobado" ? "success" : v === "Rechazado" ? "danger" : "warning"}
                  >
                    {v}
                  </Insignia>
                ),
              },
              {
                key: "votos",
                label: T.votos,
                render: (v) =>
                  v ? `${v.favor} a favor, ${v.contra} en contra, ${v.abst} abst.` : "—",
              },
              {
                key: "articulo",
                label: T.acuerdo,
                render: (v, r) => (v ? `${v} · ${fechaCorta(r.fechaAcuerdo)}` : "—"),
              },
            ]}
            rows={p.consejo.avales.map((a) => ({ ...a, id: a.instanciaId }))}
          />
        )}
        {tab === "versiones" && <VersionesComparar p={p} />}
        {tab === "bitacora" && (
          <Tabla
            columns={[
              { key: "fecha", label: T.fecha, render: (v) => fechaHora(v) },
              { key: "usuario", label: T.usuario },
              { key: "accion", label: T.accion },
              { key: "enNombreDe", label: T.enNombreDe },
              {
                key: "nuevo",
                label: T.detalle,
                render: (v, r) => (r.anterior ? `${r.anterior} → ${v}` : v),
              },
            ]}
            rows={db.bitacora
              .filter((b_) => b_.propId === p.id)
              .slice()
              .reverse()}
          />
        )}
      </Caja>
      <Ventana
        open={cartaAbierta}
        onClose={() => setCarta(false)}
        title={T.cargarCartaDeAceptacion}
        description={T.adjunteLaCartaFirmadaQue}
        footer={
          <>
            <Boton variant="secondary" onClick={() => setCarta(false)}>
              {T.cancelar}
            </Boton>
            <Boton
              onClick={() => {
                const r = act("registrarCartaAceptacion", {
                  id: p.id,
                  archivo: archivo || "Carta_aceptacion.pdf",
                });
                if (r.ok) setCarta(false);
              }}
            >
              {T.enviarCarta}
            </Boton>
          </>
        }
      >
        <input type="file" onChange={(e) => setArchivo(e.target.files[0]?.name || "")} />
      </Ventana>
    </div>
  );
}
