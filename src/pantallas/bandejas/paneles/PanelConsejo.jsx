// ============================================================
// Panel · Integrante del Consejo
// Voto secreto en la consulta. ERS: CU-10 (RF-CSJ-05, RF-CSJ-06).
// ============================================================
import { useState } from "react";
import { FileCheck2, FileText, LockKeyhole } from "lucide-react";
import { Nota } from "../../../componentes/comunes/Mensajes.jsx";
import { Bloque } from "../../../componentes/formulario/campos.jsx";
import { Boton } from "../../../componentes/ui/Boton.jsx";
import { Estadistica } from "../../../componentes/ui/Caja.jsx";
import { useApp } from "../../../estado/contexto.js";
import { abrirDocumento } from "../../../utilidades/archivos.js";
import { htmlComite } from "../../../utilidades/exportaciones.js";
import { fechaHora } from "../../../utilidades/fechas.js";
import { textos as T } from "../../../textos/pantallas/bandejas/paneles/PanelConsejo.js";

// ---------- Integrante del Consejo (CU-10) ----------
export function PanelConsejo({ p }) {
  const { db, usuario, act, ahora } = useApp();
  const cons = p.consejo?.consulta;
  const c = p.consolidacion;
  const pres = usuario.roles.some((r) => r.rol === "consejo" && r.preside);
  const [voto, setVoto] = useState("");
  if (p.estado === "No recomendada por el Comité")
    return (
      <Nota tipo="error">
        {T.elComiteTecnicoNoRecomienda}
        {c.nota} {T.laAsistenteDelConsejoRegistrara}
      </Nota>
    );
  if (p.estado !== "En trámite de aval")
    return <Nota>{p.consejo?.avales ? T.elAvalDeEstaPropuesta : T.estaPropuestaNoEstaEn}</Nota>;
  const yaVoto = cons?.votaron.includes(usuario.id);
  return (
    <div className="stack-lg">
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <Estadistica label={T.notaDelComite} value={`${c.nota} %`} hint={c.resultado} />
        <Estadistica label={T.oficio} value={c.oficio} />
        <Estadistica
          label={T.sesionOConsulta}
          value={
            p.consejo?.sesion
              ? `${p.consejo.sesion.tipo} ${p.consejo.sesion.numero}`
              : "Sin asignar"
          }
        />
      </div>
      <div className="action-row">
        <Boton
          variant="secondary"
          icon={FileText}
          onClick={() => abrirDocumento(`Documento del Comité ${c.oficio}`, htmlComite(db, p))}
        >
          {T.verDocumentoDelComite}
        </Boton>
      </div>
      {!cons && (
        <Nota>{p.consejo?.sesion ? T.laPropuestaSeVotaraEn : T.laAsistenteDelConsejoAun}</Nota>
      )}
      {cons?.abierta && !yaVoto && (
        <Bloque n="1" titulo={T.suVotoEnLaConsulta}>
          <p style={{ margin: 0, fontSize: 14 }}>
            {T.plazo} {fechaHora(cons.plazo)}
            {T.elVotoEsSecretoQueda}
          </p>
          <div className="choice-row">
            {["Aprobar", "No aprobar", "Abstención"].map((o) => (
              <label key={o} className={`radio-choice ${voto === o ? "selected" : ""}`}>
                <input type="radio" checked={voto === o} onChange={() => setVoto(o)} />
                <span className="radio-dot" />
                <span>{o}</span>
              </label>
            ))}
          </div>
          <div className="action-row end">
            <Boton
              icon={FileCheck2}
              disabled={!voto}
              onClick={() => act("votarConsulta", { id: p.id, voto })}
            >
              {T.emitirVoto}
            </Boton>
          </div>
        </Bloque>
      )}
      {cons?.abierta && yaVoto && (
        <Nota>
          {T.suVotoYaFueRegistrado} {cons.votaron.length} {T.integrantes}
        </Nota>
      )}
      {cons && !cons.abierta && (
        <Nota>
          {T.votacionCerrada} {cons.conteo.favor} {T.aFavor} {cons.conteo.contra} {T.enContra}{" "}
          {cons.conteo.abst} {T.abstenciones} {cons.desempate || ""}
        </Nota>
      )}
      {cons?.abierta && pres && (
        <div className="action-row end">
          <Boton
            variant="secondary"
            icon={LockKeyhole}
            onClick={() => act("cerrarConsulta", { id: p.id })}
          >
            {T.cerrarVotacionPresidencia}
          </Boton>
        </div>
      )}
    </div>
  );
}
