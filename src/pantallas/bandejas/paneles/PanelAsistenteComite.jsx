// ============================================================
// Panel · Asistente del Comité Técnico
// Revisión de completitud, envío a evaluación, consolidación y firma. ERS: CU-07, CU-09.
// ============================================================
import { useState } from "react";
import { CheckCheck, FileText, RotateCcw, Send } from "lucide-react";
import { Campo } from "../../../componentes/comunes/Campo.jsx";
import { Insignia } from "../../../componentes/comunes/Insignias.jsx";
import { Nota } from "../../../componentes/comunes/Mensajes.jsx";
import { Area, Chk } from "../../../componentes/formulario/campos.jsx";
import { Boton } from "../../../componentes/ui/Boton.jsx";
import { Estadistica } from "../../../componentes/ui/Caja.jsx";
import { CajaInstrucciones } from "../../../componentes/ui/Campos.jsx";
import { Tabla } from "../../../componentes/ui/Tablas.jsx";
import { Ventana } from "../../../componentes/ui/Ventanas.jsx";
import { CHECKS_COMPLETITUD } from "../../../datos/listasVerificacion.js";
import { PASOS } from "../../../datos/pasos.js";
import { useApp } from "../../../estado/contexto.js";
import { paramsDe } from "../../../reglas/consultas.js";
import { norm } from "../../../reglas/formulario.js";
import { abrirDocumento } from "../../../utilidades/archivos.js";
import { htmlComite } from "../../../utilidades/exportaciones.js";
import { fechaCorta } from "../../../utilidades/fechas.js";
import { textos as T } from "../../../textos/pantallas/bandejas/paneles/PanelAsistenteComite.js";

export function PanelAsistenteComite({ p }) {
  const { db, act, ahora } = useApp();
  const [checks, setChecks] = useState(
    Object.fromEntries(CHECKS_COMPLETITUD.map((k) => [k, false])),
  );
  const [dev, setDev] = useState(null);
  const [reab, setReab] = useState(null);
  const [dif, setDif] = useState(false);
  const params = paramsDe(db, p.convocatoriaId);
  const comite = db.comites[p.instancia];
  const nombreU = (id) => db.users.find((u) => u.id === id)?.nombre;
  const equipoNombres = (p.form?.equipo || []).map((x) => norm(x.nombre));
  const conflictos = (comite?.integrantes || []).filter((i) =>
    equipoNombres.includes(norm(nombreU(i.userId))),
  );
  const consolidar = (confirmar) => {
    const r = act("consolidarComite", { id: p.id, confirmarDiferencia: !!confirmar });
    if (!r.ok && r.error.startsWith("DIFERENCIA")) setDif(true);
    else setDif(false);
  };
  if (p.estado === "En revisión de completitud")
    return (
      <div className="stack-lg">
        <CajaInstrucciones title={T.revisionDeCompletitud}>
          {T.verifiqueQueElExpedienteContenga}
        </CajaInstrucciones>
        {(p.morosidad || []).length > 0 && (
          <Nota tipo="aviso">
            {T.informesPendientesAnteLaVie} {p.morosidad.join(", ")}
            {T.puedeContinuarElTramiteLa}
          </Nota>
        )}
        {conflictos.length > 0 && (
          <Nota tipo="aviso">
            {T.conflictoDeInteres} {conflictos.map((i) => nombreU(i.userId)).join(", ")}{" "}
            {T.participaEnElEquipoDe}
          </Nota>
        )}
        {p.pi?.estado === "Emitido" && (
          <Nota>
            {T.dictamenDePiIncorporadoOficio} {p.pi.oficio}.
          </Nota>
        )}
        {p.pi?.estado === "No requerido" && <Nota>{p.pi.constancia}</Nota>}
        <div className="checklist">
          {CHECKS_COMPLETITUD.map((k) => (
            <label key={k} className="ers-check">
              <input
                type="checkbox"
                checked={checks[k]}
                onChange={(e) => setChecks({ ...checks, [k]: e.target.checked })}
              />
              <div>
                <strong>{k}</strong>
              </div>
            </label>
          ))}
        </div>
        <div className="action-row end">
          <Boton
            variant="secondary"
            icon={RotateCcw}
            onClick={() => setDev({ motivo: "", secciones: [] })}
          >
            {T.devolverPorFaltantes}
          </Boton>
          <Boton icon={Send} onClick={() => act("enviarAEvaluacion", { id: p.id, checks })}>
            {T.enviarAlComiteTecnico}
          </Boton>
        </div>
        <Ventana
          open={!!dev}
          onClose={() => setDev(null)}
          title={T.devolverPorFaltantes}
          description={T.laPersonaCoordinadoraPodraCorregir}
          footer={
            <>
              <Boton variant="secondary" onClick={() => setDev(null)}>
                {T.cancelar}
              </Boton>
              <Boton
                variant="danger"
                onClick={() => {
                  const r = act("devolverPropuesta", { id: p.id, ...dev });
                  if (r.ok) setDev(null);
                }}
              >
                {T.devolverPropuesta}
              </Boton>
            </>
          }
        >
          {dev && (
            <div className="stack-md">
              <Campo label={T.seccionesConFaltantes}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
                  {PASOS.slice(0, 16).map((n) => (
                    <Chk
                      key={n}
                      checked={dev.secciones.includes(n)}
                      onChange={(v) =>
                        setDev({
                          ...dev,
                          secciones: v
                            ? [...dev.secciones, n]
                            : dev.secciones.filter((x) => x !== n),
                        })
                      }
                    >
                      {n}
                    </Chk>
                  ))}
                </div>
              </Campo>
              <Area
                label={T.motivoObligatorio}
                rows={4}
                value={dev.motivo}
                onChange={(v) => setDev({ ...dev, motivo: v })}
              />
            </div>
          )}
        </Ventana>
      </div>
    );
  if (p.estado === "En evaluación") {
    const todas = p.evaluaciones.every((e) => e.estado === "Finalizada");
    return (
      <div className="stack-lg">
        <CajaInstrucciones title={T.seguimientoDeEvaluaciones}>
          {T.cadaIntegranteEvaluaDeForma}
        </CajaInstrucciones>
        {(p.comiteExcluidos || []).length > 0 && (
          <Nota tipo="aviso">
            {T.excluidosPorConflictoDeInteres}{" "}
            {p.comiteExcluidos.map((x) => nombreU(x.userId)).join(", ")}.
          </Nota>
        )}
        <Tabla
          columns={[
            { key: "n", label: T.integrante, render: (_, r) => nombreU(r.evaluadorId) },
            {
              key: "estado",
              label: T.estado,
              render: (v) => (
                <Insignia
                  tono={v === "Finalizada" ? "success" : v === "Pendiente" ? "neutral" : "warning"}
                >
                  {v}
                </Insignia>
              ),
            },
            {
              key: "nota",
              label: T.nota,
              render: (v) => (v === null || v === undefined ? "—" : `${v} %`),
            },
            { key: "resultado", label: T.resultado, render: (v) => v || "—" },
            { key: "h", label: T.versiones, render: (_, r) => r.historial.length || "—" },
            {
              key: "x",
              label: "",
              render: (_, r) =>
                r.estado === "Finalizada" ? (
                  <Boton
                    variant="ghost"
                    icon={RotateCcw}
                    onClick={() => setReab({ evaluadorId: r.evaluadorId, motivo: "" })}
                  >
                    {T.reabrir}
                  </Boton>
                ) : null,
            },
          ]}
          rows={p.evaluaciones.map((e) => ({ ...e, id: e.evaluadorId }))}
        />
        <div className="action-row end">
          <Boton icon={CheckCheck} disabled={!todas} onClick={() => consolidar(false)}>
            {T.consolidarEvaluacion}
          </Boton>
        </div>
        {!todas && (
          <span style={{ fontSize: 13, opacity: 0.7 }}>{T.laConsolidacionSeHabilitaCuando}</span>
        )}
        <Ventana
          open={!!reab}
          onClose={() => setReab(null)}
          title={T.reabrirEvaluacion}
          description={T.elIntegrantePodraCorregirSu}
          footer={
            <>
              <Boton variant="secondary" onClick={() => setReab(null)}>
                {T.cancelar}
              </Boton>
              <Boton
                onClick={() => {
                  const r = act("reabrirEvaluacion", { id: p.id, ...reab });
                  if (r.ok) setReab(null);
                }}
              >
                {T.reabrir}
              </Boton>
            </>
          }
        >
          {reab && (
            <Area
              label={T.motivoObligatorio}
              rows={3}
              value={reab.motivo}
              onChange={(v) => setReab({ ...reab, motivo: v })}
            />
          )}
        </Ventana>
        <Ventana
          open={dif}
          onClose={() => setDif(false)}
          title={T.diferenciaEntreNotas}
          description={`La diferencia entre la nota más alta y la más baja supera el máximo configurado (${params.difMaxNotas} puntos). El Comité debe discutirla antes de consolidar.`}
          footer={
            <>
              <Boton variant="secondary" onClick={() => setDif(false)}>
                {T.volver}
              </Boton>
              <Boton onClick={() => consolidar(true)}>{T.elComiteYaLaDiscutio}</Boton>
            </>
          }
        >
          <Nota tipo="aviso">{T.puedeReabrirUnaEvaluacionPara}</Nota>
        </Ventana>
      </div>
    );
  }
  if (p.consolidacion) {
    const c = p.consolidacion;
    const firmaron = comite.integrantes.filter((i) => c.firmas[i.userId]).length;
    return (
      <div className="stack-lg">
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
          <Estadistica
            label={T.notaConsolidada}
            value={`${c.nota} %`}
            hint={`Promedio de ${c.detalle.length} evaluaciones`}
          />
          <Estadistica label={T.resultado} value={c.resultado} hint={c.dictamen} />
          <Estadistica
            label={T.oficioDelComite}
            value={c.oficio}
            hint={`Firmas: ${firmaron} de ${comite.integrantes.length}`}
          />
        </div>
        {c.obligatoriosBajos.length > 0 && (
          <Nota tipo="error">
            {T.criteriosObligatoriosConPromedioInferior} {c.obligatoriosBajos.join("; ")}.
          </Nota>
        )}
        <Tabla
          columns={[
            { key: "evaluadorId", label: T.integrante, render: (v) => nombreU(v) },
            { key: "nota", label: T.nota, render: (v) => `${v} %` },
            {
              key: "f",
              label: T.firma,
              render: (_, r) =>
                c.firmas[r.evaluadorId] ? fechaCorta(c.firmas[r.evaluadorId]) : "Pendiente",
            },
          ]}
          rows={c.detalle.map((d) => ({ ...d, id: d.evaluadorId }))}
        />
        <div className="action-row">
          <Boton
            variant="secondary"
            icon={FileText}
            onClick={() => abrirDocumento(`Documento del Comité ${c.oficio}`, htmlComite(db, p))}
          >
            {T.verDocumentoDelComite}
          </Boton>
          {p.estado === "Evaluada" && (
            <Boton icon={Send} onClick={() => act("enviarAlConsejo", { id: p.id })}>
              {c.resultado === "Recomienda" ? T.enviarAlConsejo : T.enviarAlConsejoParaConocimiento}
            </Boton>
          )}
        </div>
      </div>
    );
  }
  return <Nota>{T.estaPropuestaNoEstaEn}</Nota>;
}
