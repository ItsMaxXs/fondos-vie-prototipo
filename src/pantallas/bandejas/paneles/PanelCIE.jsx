// ============================================================
// Panel · Consejo de Investigación y Extensión
// Resolución del CIE con su rúbrica. ERS: CU-13 (RF-VIE-08 a RF-VIE-10).
// ============================================================
import { useState } from "react";
import { BookOpenCheck, Save, SearchCheck, Stamp } from "lucide-react";
import { Nota } from "../../../componentes/comunes/Mensajes.jsx";
import { RubricaForm } from "../../../componentes/evaluacion/RubricaForm.jsx";
import { Area, Bloque, Sel, Txt } from "../../../componentes/formulario/campos.jsx";
import { Boton } from "../../../componentes/ui/Boton.jsx";
import { Estadistica } from "../../../componentes/ui/Caja.jsx";
import { useApp } from "../../../estado/contexto.js";
import { paramsDe } from "../../../reglas/consultas.js";
import { textos as T } from "../../../textos/pantallas/bandejas/paneles/PanelCIE.js";

// ---------- CIE (CU-13) ----------
export function PanelCIE({ p }) {
  const { db, act, ahora } = useApp();
  const rub = db.rubricas[p.convocatoriaId][p.form.modalidad].secciones;
  const params = paramsDe(db, p.convocatoriaId);
  const [scores, setScores] = useState(p.cie?.rubrica?.scores || {});
  const [reasons, setReasons] = useState(p.cie?.rubrica?.reasons || {});
  const [r, setR] = useState({
    resultado: "Aprobada",
    justificacion: "",
    condiciones: "",
    sesion: "",
    fecha: ahora.slice(0, 10),
  });
  const [verRub, setVerRub] = useState(false);
  if (p.estado === "Lista para CIE")
    return (
      <div className="stack-lg">
        <Nota>{T.elExpedienteFueVerificadoPor}</Nota>
        <div className="action-row end">
          <Boton icon={SearchCheck} onClick={() => act("abrirResolucionCIE", { id: p.id })}>
            {T.abrirExpedienteParaResolucion}
          </Boton>
        </div>
      </div>
    );
  if (p.estado !== "En resolución")
    return p.cie?.resolucion ? (
      <Nota>
        {T.resolucion} {p.cie.resolucion.numero}: {p.cie.resolucion.resultado}.
      </Nota>
    ) : (
      <Nota>{T.estaPropuestaNoEstaEn}</Nota>
    );
  return (
    <div className="stack-lg">
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <Estadistica
          label={T.notaDelComiteTecnico}
          value={`${p.consolidacion.nota} %`}
          hint={p.consolidacion.resultado}
        />
        <Estadistica
          label={T.dictamenDeLaDireccion}
          value={p.vie?.dictamenDI?.resultado || "—"}
          hint={p.vie?.dictamenDI?.oficio}
        />
        <Estadistica label={T.montoSolicitado} value={p.presupuesto} hint={p.modalidad} />
      </div>
      <div className="action-row">
        <Boton variant="secondary" icon={BookOpenCheck} onClick={() => setVerRub(!verRub)}>
          {verRub ? T.ocultarRubricaDeApoyo : T.rubricaDeApoyoDelCie}
        </Boton>
      </div>
      {verRub && (
        <>
          <Nota>{T.laRubricaDeApoyoEs}</Nota>
          <RubricaForm
            rub={rub}
            scores={scores}
            reasons={reasons}
            umbral={params.umbralComite}
            onScore={(id, v) => setScores({ ...scores, [id]: v })}
            onReason={(id, v) => setReasons({ ...reasons, [id]: v })}
          />
          <div className="action-row end">
            <Boton
              variant="secondary"
              icon={Save}
              onClick={() => act("guardarRubricaCIE", { id: p.id, scores, reasons })}
            >
              {T.guardarEvaluacionDeApoyo}
            </Boton>
          </div>
        </>
      )}
      <Bloque n="1" titulo={T.resolucion}>
        <div className="form-grid two-col">
          <Sel
            label={T.resolucion}
            value={r.resultado}
            onChange={(v) => setR({ ...r, resultado: v })}
            opciones={["Aprobada", "Aprobada con condiciones", "Rechazada"]}
          />
          <Txt
            label={T.sesionDelCie}
            value={r.sesion}
            onChange={(v) => setR({ ...r, sesion: v })}
            placeholder={T.sesionOrdinaria1232026}
          />
          <Txt
            label={T.fecha}
            type="date"
            value={r.fecha}
            onChange={(v) => setR({ ...r, fecha: v })}
          />
        </div>
        <Area
          label={T.justificacionObligatoria}
          rows={3}
          value={r.justificacion}
          onChange={(v) => setR({ ...r, justificacion: v })}
        />
        {r.resultado === "Aprobada con condiciones" && (
          <Area
            label={T.condiciones}
            rows={3}
            value={r.condiciones}
            onChange={(v) => setR({ ...r, condiciones: v })}
          />
        )}
        <div className="action-row end">
          <Boton icon={Stamp} onClick={() => act("resolverCIE", { id: p.id, ...r })}>
            {T.emitirResolucion}
          </Boton>
        </div>
      </Bloque>
    </div>
  );
}
