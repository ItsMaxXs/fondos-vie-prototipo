// ============================================================
// Pantalla · comparación de versiones
// Compara dos versiones guardadas de una propuesta. ERS: RF-FOR-46.
// ============================================================
import { useState } from "react";
import { Parrafo } from "../../componentes/comunes/Datos.jsx";
import { Nota } from "../../componentes/comunes/Mensajes.jsx";
import { Vacio } from "../../componentes/comunes/Vacio.jsx";
import { Selector } from "../../componentes/ui/Campos.jsx";
import { Tabla } from "../../componentes/ui/Tablas.jsx";
import { fechaCorta, fechaHora } from "../../utilidades/fechas.js";
import { textos as T } from "../../textos/pantallas/propuestas/VersionesComparar.js";

export function VersionesComparar({ p }) {
  const [a, setA] = useState(Math.max(1, (p.versiones?.length || 1) - 1));
  const [b_, setB] = useState(p.versiones?.length || 1);
  if ((p.versiones || []).length < 2)
    return <Vacio titulo={T.unaSolaVersion} texto={T.cuandoLaPropuestaSeCorrija} />;
  const va = p.versiones.find((v) => v.n === Number(a))?.form,
    vb = p.versiones.find((v) => v.n === Number(b_))?.form;
  const campos = [
    "titulo",
    "modalidad",
    "inicio",
    "fin",
    "resumen",
    "problema",
    "objetivoGeneral",
    "estadoArte",
    "metodologia",
    "hojaRuta",
    "referencias",
    "divulgacion",
  ];
  const dif = campos.filter((k) => JSON.stringify(va?.[k]) !== JSON.stringify(vb?.[k]));
  [
    "equipo",
    "plan",
    "presupuesto",
    "becas",
    "productos",
    "financiamiento",
    "colaboradores",
    "documentos",
  ].forEach((k) => JSON.stringify(va?.[k]) !== JSON.stringify(vb?.[k]) && dif.push(k));
  return (
    <div className="stack-lg">
      <div className="action-row">
        <Selector value={a} onChange={(e) => setA(e.target.value)}>
          {p.versiones.map((v) => (
            <option key={v.n} value={v.n}>
              {T.version} {v.n} · {fechaCorta(v.fecha)}
            </option>
          ))}
        </Selector>
        <span>{T.comparadaCon}</span>
        <Selector value={b_} onChange={(e) => setB(e.target.value)}>
          {p.versiones.map((v) => (
            <option key={v.n} value={v.n}>
              {T.version} {v.n} · {fechaCorta(v.fecha)}
            </option>
          ))}
        </Selector>
      </div>
      <Tabla
        columns={[
          { key: "n", label: T.version },
          { key: "fecha", label: T.fecha, render: (v) => fechaHora(v) },
          { key: "motivo", label: T.motivo },
          { key: "por", label: T.enviadaPor },
        ]}
        rows={p.versiones.map((v) => ({ ...v, id: v.n }))}
      />
      {dif.length === 0 ? (
        <Nota>{T.lasDosVersionesNoTienen}</Nota>
      ) : (
        <Nota tipo="aviso">
          {T.seccionesConCambiosEntreLas} {a} y {b_}: <strong>{dif.join(", ")}</strong>.
        </Nota>
      )}
      {dif
        .filter((k) => typeof va?.[k] === "string")
        .map((k) => (
          <div key={k} className="form-grid two-col">
            <Parrafo titulo={`${k} · versión ${a}`} texto={va[k]} />
            <Parrafo titulo={`${k} · versión ${b_}`} texto={vb[k]} />
          </div>
        ))}
    </div>
  );
}
