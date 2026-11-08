// ============================================================
// Panel · Asistente del Consejo de Escuela
// Registro de sesión, apertura de consulta, cierre y aval. ERS: CU-10.
// ============================================================
import { useState } from "react";
import { FileCheck2, MessageSquareText, Send, Stamp } from "lucide-react";
import { Campo } from "../../../componentes/comunes/Campo.jsx";
import { Insignia } from "../../../componentes/comunes/Insignias.jsx";
import { Nota } from "../../../componentes/comunes/Mensajes.jsx";
import { Area, Bloque, Chk, Sel, Txt } from "../../../componentes/formulario/campos.jsx";
import { Boton } from "../../../componentes/ui/Boton.jsx";
import { Estadistica } from "../../../componentes/ui/Caja.jsx";
import { Tabla } from "../../../componentes/ui/Tablas.jsx";
import { Ventana } from "../../../componentes/ui/Ventanas.jsx";
import { useApp } from "../../../estado/contexto.js";
import { nombreInstancia } from "../../../reglas/alcance.js";
import { fechaCorta, fechaHora } from "../../../utilidades/fechas.js";
import { num } from "../../../utilidades/formato.js";
import { textos as T } from "../../../textos/pantallas/bandejas/paneles/PanelAsistenteConsejo.js";

// ---------- Asistente del Consejo (CU-10) ----------
export function PanelAsistenteConsejo({ p }) {
  const { db, act, ahora } = useApp();
  const [s, setS] = useState({
    tipo: "Ordinaria",
    numero: "",
    fecha: ahora.slice(0, 10),
    plazo: "",
  });
  const [plazo, setPlazo] = useState("");
  const [aval, setAval] = useState(null);
  const c = p.consolidacion;
  if (p.estado === "No recomendada por el Comité")
    return (
      <div className="stack-lg">
        <Nota tipo="error">
          {T.elComiteTecnicoNoRecomienda}
          {c.nota} {T.elConsejoDebeConocerEl}
        </Nota>
        <div className="action-row">
          <Boton icon={FileCheck2} onClick={() => act("conocerNoRecomendada", { id: p.id })}>
            {T.registrarQueElConsejoConocio}
          </Boton>
        </div>
      </div>
    );
  if (p.estado !== "En trámite de aval")
    return <Nota>{p.consejo?.avales ? T.elProcesoDeAvalConcluyo : T.estaPropuestaNoEstaEn}</Nota>;
  const sesion = p.consejo?.sesion;
  const cons = p.consejo?.consulta;
  const abrirAval = (a) => {
    const base = {
      instanciaId: a.instanciaId,
      votos: { favor: "", contra: "", abst: "" },
      resultado: "Aprobado",
      articulo: "",
      fechaAcuerdo: sesion?.fecha || ahora.slice(0, 10),
      justificacion: "",
      votoPresidencia: "",
      contenido: {},
      adjunto: false,
    };
    if (cons?.conteo && a === p.consejo.avales[0])
      base.votos = {
        favor: String(cons.conteo.favor),
        contra: String(cons.conteo.contra),
        abst: String(cons.conteo.abst),
      };
    if (cons?.sugerido === "Rechazado") base.resultado = "Rechazado";
    setAval(base);
  };
  return (
    <div className="stack-lg">
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <Estadistica label={T.notaDelComite} value={`${c.nota} %`} hint={c.dictamen} />
        <Estadistica label={T.oficioDelComite} value={c.oficio} />
        <Estadistica
          label={T.instanciasQueDebenAvalar}
          value={p.consejo?.avales?.length ?? 1 + (p.form.participantes || []).length}
        />
      </div>
      {!sesion ? (
        <Bloque n="1" titulo={T.incluirEnLaAgendaDel}>
          <div className="form-grid two-col">
            <Sel
              label={T.tipo}
              value={s.tipo}
              onChange={(v) => setS({ ...s, tipo: v })}
              opciones={["Ordinaria", "Extraordinaria", "Consulta formal"]}
            />
            <Txt
              label={T.numeroDeSesionOConsulta}
              value={s.numero}
              onChange={(v) => setS({ ...s, numero: v })}
            />
            <Txt
              label={T.fecha}
              type="date"
              value={s.fecha}
              onChange={(v) => setS({ ...s, fecha: v })}
            />
            {s.tipo === "Consulta formal" && (
              <Txt
                label={T.plazoParaVotar}
                type="datetime-local"
                value={s.plazo}
                onChange={(v) => setS({ ...s, plazo: v })}
              />
            )}
          </div>
          <div className="action-row end">
            <Boton
              icon={Send}
              onClick={() =>
                act("registrarSesion", { id: p.id, ...s, plazo: s.plazo ? s.plazo + ":00" : "" })
              }
            >
              {T.enviarAlConsejo}
            </Boton>
          </div>
        </Bloque>
      ) : (
        <>
          <Nota>
            {sesion.tipo} {T.n} {sesion.numero} · {fechaCorta(sesion.fecha)}
            {sesion.plazo ? ` · plazo ${fechaHora(sesion.plazo)}` : ""}
          </Nota>
          {sesion.tipo === "Consulta formal" && !cons && (
            <div className="action-row">
              <Txt
                label={T.plazoDeLaVotacion}
                type="datetime-local"
                value={plazo}
                onChange={setPlazo}
              />
              <Boton
                icon={MessageSquareText}
                onClick={() =>
                  act("abrirConsulta", { id: p.id, plazo: plazo ? plazo + ":00" : sesion.plazo })
                }
              >
                {T.abrirConsultaFormal}
              </Boton>
            </div>
          )}
          {cons && (
            <Nota tipo={cons.abierta ? "info" : "aviso"}>
              {cons.abierta
                ? `Consulta abierta hasta ${fechaHora(cons.plazo)}. Han votado ${cons.votaron.length} integrantes. El voto es secreto: usted solo verá el conteo cuando quien preside cierre la votación.`
                : `Votación cerrada: ${cons.conteo.favor} a favor, ${cons.conteo.contra} en contra, ${cons.conteo.abst} abstenciones. Resultado: ${cons.sugerido}.${cons.desempate ? " " + cons.desempate : ""}`}
            </Nota>
          )}
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
                key: "x",
                label: "",
                render: (_, a) =>
                  a.estado === "Pendiente" ? (
                    <Boton
                      variant="secondary"
                      icon={Stamp}
                      disabled={cons?.abierta}
                      onClick={() => abrirAval(a)}
                    >
                      {T.registrarAval}
                    </Boton>
                  ) : null,
              },
            ]}
            rows={p.consejo.avales.map((a) => ({ ...a, id: a.instanciaId }))}
          />
        </>
      )}
      <Ventana
        open={!!aval}
        onClose={() => setAval(null)}
        title={aval ? `Aval de ${nombreInstancia(db, aval.instanciaId)}` : ""}
        description={T.registreElAcuerdoTalComo}
        footer={
          <>
            <Boton variant="secondary" onClick={() => setAval(null)}>
              {T.cancelar}
            </Boton>
            <Boton
              onClick={() => {
                const r = act("registrarAval", { id: p.id, ...aval });
                if (r.ok) setAval(null);
              }}
            >
              {T.registrarAval}
            </Boton>
          </>
        }
      >
        {aval && (
          <div className="stack-md">
            <div className="form-grid three-col">
              <Txt
                label={T.votosAFavor}
                type="number"
                min="0"
                value={aval.votos.favor}
                onChange={(v) => setAval({ ...aval, votos: { ...aval.votos, favor: v } })}
              />
              <Txt
                label={T.votosEnContra}
                type="number"
                min="0"
                value={aval.votos.contra}
                onChange={(v) => setAval({ ...aval, votos: { ...aval.votos, contra: v } })}
              />
              <Txt
                label={T.abstenciones}
                type="number"
                min="0"
                value={aval.votos.abst}
                onChange={(v) => setAval({ ...aval, votos: { ...aval.votos, abst: v } })}
              />
            </div>
            {num(aval.votos.favor) === num(aval.votos.contra) && num(aval.votos.favor) > 0 && (
              <Sel
                label={T.votoDeQuienPresideEmpate}
                value={aval.votoPresidencia}
                onChange={(v) => setAval({ ...aval, votoPresidencia: v })}
                vacio="Seleccione"
                opciones={["Aprobar", "No aprobar", "Abstención"]}
                hint={T.enCasoDeEmpateRige}
              />
            )}
            <Sel
              label={T.resultado}
              value={aval.resultado}
              onChange={(v) => setAval({ ...aval, resultado: v })}
              opciones={["Aprobado", "Rechazado"]}
            />
            <div className="form-grid two-col">
              <Txt
                label={T.articuloDelAcuerdo}
                value={aval.articulo}
                onChange={(v) => setAval({ ...aval, articulo: v })}
                placeholder={T.articulo7}
              />
              <Txt
                label={T.fechaDelAcuerdo}
                type="date"
                value={aval.fechaAcuerdo}
                onChange={(v) => setAval({ ...aval, fechaAcuerdo: v })}
              />
            </div>
            <Area
              label={T.justificacionObligatoria}
              rows={3}
              value={aval.justificacion}
              onChange={(v) => setAval({ ...aval, justificacion: v })}
            />
            {aval.resultado === "Aprobado" && (
              <>
                <strong style={{ fontSize: 13.5 }}>{T.elAcuerdoDebeContener}</strong>
                {[
                  ["propuesta", "Aval de la propuesta con nombre y período"],
                  ["personas", "Aval de cada persona con horas, tipo y nombramiento"],
                  ["titularCons", "Titular de las horas CONS"],
                  ["calificacion", "Aval de la calificación y del dictamen del Comité"],
                ].map(([k, t_]) => (
                  <Chk
                    key={k}
                    checked={aval.contenido[k]}
                    onChange={(v) => setAval({ ...aval, contenido: { ...aval.contenido, [k]: v } })}
                  >
                    {t_}
                  </Chk>
                ))}
                <Campo label={T.actaUOficioFirmadoDel}>
                  <input
                    type="file"
                    onChange={(e) => setAval({ ...aval, adjunto: !!e.target.files[0] })}
                  />
                </Campo>
              </>
            )}
          </div>
        )}
      </Ventana>
    </div>
  );
}
