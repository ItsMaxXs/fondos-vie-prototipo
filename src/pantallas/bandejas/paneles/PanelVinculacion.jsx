// ============================================================
// Panel · Centro de Vinculación
// Dictamen de propiedad intelectual. ERS: CU-06 (RF-VIN-01 a RF-VIN-06).
// ============================================================
import { useState } from "react";
import { FileCheck2, FileText, SearchCheck } from "lucide-react";
import { Dato, Parrafo } from "../../../componentes/comunes/Datos.jsx";
import { Nota } from "../../../componentes/comunes/Mensajes.jsx";
import { Area, Bloque, Sel, Txt } from "../../../componentes/formulario/campos.jsx";
import { Boton } from "../../../componentes/ui/Boton.jsx";
import { CajaInstrucciones } from "../../../componentes/ui/Campos.jsx";
import { useApp } from "../../../estado/contexto.js";
import { abrirDocumento } from "../../../utilidades/archivos.js";
import { fechaCorta } from "../../../utilidades/fechas.js";
import { esc } from "../../../utilidades/formato.js";
import { textos as T } from "../../../textos/pantallas/bandejas/paneles/PanelVinculacion.js";

// ---------- Vinculación (CU-06) ----------
export function PanelVinculacion({ p }) {
  const { db, act, ahora } = useApp();
  const [x, setX] = useState({
    potencial: "Sí",
    innovacion: "Sí",
    tipoActivo: "",
    tipoPI: "",
    novedad: "",
    titularidad: "",
    divulgacion: "",
    confidencialidad: "",
    analisis: "",
    recomendaciones: "",
    oficio: "",
    fecha: ahora.slice(0, 10),
  });
  const set = (k) => (v) => setX({ ...x, [k]: v });
  const f = p.form;
  if (p.pi?.estado === "Emitido") {
    const d = p.pi.dictamen;
    return (
      <div className="stack-lg">
        <Nota>
          {T.dictamenEmitidoConElOficio} <strong>{p.pi.oficio}</strong> el {fechaCorta(p.pi.fecha)}.
        </Nota>
        <div className="detail-grid">
          {Object.entries(d).map(([k, v]) => (
            <Dato key={k} k={k} v={String(v)} />
          ))}
        </div>
        <div className="action-row">
          <Boton
            variant="secondary"
            icon={FileText}
            onClick={() =>
              abrirDocumento(
                `Dictamen de PI ${p.pi.oficio}`,
                `<h2>${esc(p.id)} · ${esc(p.titulo)}</h2><table>${Object.entries(d)
                  .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`)
                  .join("")}</table>`,
              )
            }
          >
            {T.verDocumento}
          </Boton>
        </div>
      </div>
    );
  }
  if (p.estado !== "Pendiente de dictamen PI")
    return (
      <Nota>
        {p.pi?.estado === "No requerido" ? p.pi.constancia : T.estaPropuestaNoEstaPendiente}
      </Nota>
    );
  return (
    <div className="stack-lg">
      <CajaInstrucciones title={T.alcanceDeLaRevision}>
        {T.elCentroDeVinculacionAnaliza}
      </CajaInstrucciones>
      <div className="detail-grid">
        <Dato k="Pregunta 8 (posibles activos)" v={f.q.pi.descripcion} />
        <Dato k="Activos declarados" v={(f.activosPI || []).map((a) => a.tipo).join(", ")} />
        <Dato k="Innovación" v={`${f.q.innovacion.r} · ${f.q.innovacion.tipo}`} />
        <Dato k="Información confidencial" v={f.q.confidencial.r} />
      </div>
      <Parrafo titulo={T.resumenDelProyecto} texto={f.resumen} />
      {p.pi?.estado === "Pendiente" && (
        <div className="action-row">
          <Boton
            variant="secondary"
            icon={SearchCheck}
            onClick={() => act("iniciarRevisionPI", { id: p.id })}
          >
            {T.iniciarRevision}
          </Boton>
        </div>
      )}
      <Bloque n="1" titulo={T.dictamenDePropiedadIntelectual}>
        <div className="form-grid two-col">
          <Sel
            label={T.potencialDePropiedadIntelectual}
            value={x.potencial}
            onChange={set("potencial")}
            opciones={["Sí", "No"]}
          />
          <Sel
            label={T.potencialDeInnovacion}
            value={x.innovacion}
            onChange={set("innovacion")}
            opciones={["Sí", "No"]}
          />
          <Sel
            label={T.tipoDeActivo}
            value={x.tipoActivo}
            onChange={set("tipoActivo")}
            vacio="Seleccione"
            opciones={db.catalogos.activosPI}
          />
          <Txt label={T.tipoDeProteccion} value={x.tipoPI} onChange={set("tipoPI")} />
          <Txt
            label={T.numeroDeOficio}
            value={x.oficio}
            onChange={set("oficio")}
            placeholder={T.cv0212026}
          />
          <Txt label={T.fechaDelDictamen} type="date" value={x.fecha} onChange={set("fecha")} />
        </div>
        <Area label={T.novedad} rows={2} value={x.novedad} onChange={set("novedad")} />
        <Area label={T.titularidad} rows={2} value={x.titularidad} onChange={set("titularidad")} />
        <Area
          label={T.recomendacionesSobreDivulgacion}
          rows={2}
          value={x.divulgacion}
          onChange={set("divulgacion")}
        />
        <Area
          label={T.confidencialidad}
          rows={2}
          value={x.confidencialidad}
          onChange={set("confidencialidad")}
        />
        <Area label={T.analisis} rows={3} value={x.analisis} onChange={set("analisis")} />
        <Area
          label={T.recomendaciones}
          rows={2}
          value={x.recomendaciones}
          onChange={set("recomendaciones")}
        />
        <div className="action-row end">
          <Boton
            icon={FileCheck2}
            onClick={() => act("emitirDictamenPI", { id: p.id, dictamen: x })}
          >
            {T.emitirDictamen}
          </Boton>
        </div>
      </Bloque>
    </div>
  );
}
