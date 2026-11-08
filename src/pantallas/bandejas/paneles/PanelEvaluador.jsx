// ============================================================
// Panel · Cuerpo Evaluador del Comité
// Evaluación con la rúbrica, finalización y reapertura. ERS: CU-08.
// ============================================================
import { useState } from "react";
import { FileCheck2, FileText, Save, Stamp } from "lucide-react";
import { Dato } from "../../../componentes/comunes/Datos.jsx";
import { Insignia } from "../../../componentes/comunes/Insignias.jsx";
import { Nota } from "../../../componentes/comunes/Mensajes.jsx";
import { ProductosNoSumativos } from "../../../componentes/evaluacion/ProductosNoSumativos.jsx";
import { RubricaForm } from "../../../componentes/evaluacion/RubricaForm.jsx";
import { Boton } from "../../../componentes/ui/Boton.jsx";
import { CajaInstrucciones } from "../../../componentes/ui/Campos.jsx";
import { Ventana } from "../../../componentes/ui/Ventanas.jsx";
import { useApp } from "../../../estado/contexto.js";
import { paramsDe } from "../../../reglas/consultas.js";
import { calcularEvaluacion } from "../../../reglas/evaluacion.js";
import { abrirDocumento } from "../../../utilidades/archivos.js";
import { htmlComite } from "../../../utilidades/exportaciones.js";
import { fechaHora } from "../../../utilidades/fechas.js";
import { textos as T } from "../../../textos/pantallas/bandejas/paneles/PanelEvaluador.js";

// ---------- Integrante del Comité (CU-08) ----------
export function PanelEvaluador({ p }) {
  const { db, usuario, act } = useApp();
  const ev = p.evaluaciones?.find((e) => e.evaluadorId === usuario.id);
  const rub = db.rubricas[p.convocatoriaId][p.form.modalidad].secciones;
  const params = paramsDe(db, p.convocatoriaId);
  const [scores, setScores] = useState(ev?.scores || {});
  const [reasons, setReasons] = useState(ev?.reasons || {});
  const [confirmar, setConfirmar] = useState(false);
  if (!ev) {
    const excl = (p.comiteExcluidos || []).some((x) => x.userId === usuario.id);
    return (
      <Nota tipo={excl ? "aviso" : "info"}>
        {excl ? T.ustedFueExcluidoDeEsta : T.estaPropuestaNoEstaAsignada}
      </Nota>
    );
  }
  const locked = ev.estado === "Finalizada";
  const coord = db.comites[p.instancia]?.integrantes.find((i) => i.coordina)?.userId === usuario.id;
  return (
    <div className="stack-lg">
      {locked ? (
        <Nota>
          {T.evaluacionFinalizadaEl} {fechaHora(ev.finalizadaEn)}: {ev.nota} % · {ev.resultado}
          {T.estaBloqueadaSoloLaAsistente}
        </Nota>
      ) : (
        <CajaInstrucciones title={T.evaluacionIndividual}>
          {T.suEvaluacionEsIndependienteNo}
        </CajaInstrucciones>
      )}
      <ProductosNoSumativos p={p} params={params} />
      <RubricaForm
        rub={rub}
        scores={scores}
        reasons={reasons}
        locked={locked}
        umbral={params.umbralComite}
        onScore={(id, v) => setScores({ ...scores, [id]: v })}
        onReason={(id, v) => setReasons({ ...reasons, [id]: v })}
      />
      {!locked && (
        <div className="action-row end">
          <Boton
            variant="secondary"
            icon={Save}
            onClick={() =>
              act("guardarEvaluacion", { id: p.id, evaluadorId: usuario.id, scores, reasons })
            }
          >
            {T.guardarAvance}
          </Boton>
          <Boton icon={FileCheck2} onClick={() => setConfirmar(true)}>
            {T.finalizarEvaluacion}
          </Boton>
        </div>
      )}
      {p.estado === "Evaluada" && p.consolidacion && (
        <div className="action-row">
          <Boton
            variant="secondary"
            icon={FileText}
            onClick={() =>
              abrirDocumento(`Documento del Comité ${p.consolidacion.oficio}`, htmlComite(db, p))
            }
          >
            {T.verDocumentoDelComite}
          </Boton>
          {!p.consolidacion.firmas[usuario.id] ? (
            <Boton icon={Stamp} onClick={() => act("firmarDocumentoComite", { id: p.id })}>
              {T.firmarDocumento}
              {coord ? T.coordinacion : ""}
            </Boton>
          ) : (
            <Insignia tono="success">{T.firmado}</Insignia>
          )}
        </div>
      )}
      <Ventana
        open={confirmar}
        onClose={() => setConfirmar(false)}
        title={T.finalizarEvaluacion}
        description={T.alFinalizarLaEvaluacionSe}
        footer={
          <>
            <Boton variant="secondary" onClick={() => setConfirmar(false)}>
              {T.cancelar}
            </Boton>
            <Boton
              onClick={() => {
                const r = act("finalizarEvaluacion", {
                  id: p.id,
                  evaluadorId: usuario.id,
                  scores,
                  reasons,
                });
                setConfirmar(false);
              }}
            >
              {T.finalizar}
            </Boton>
          </>
        }
      >
        <div className="detail-grid">
          <Dato k="Nota" v={`${calcularEvaluacion(rub, scores, params.umbralComite).nota} %`} />
          <Dato k="Resultado" v={calcularEvaluacion(rub, scores, params.umbralComite).resultado} />
        </div>
      </Ventana>
    </div>
  );
}
