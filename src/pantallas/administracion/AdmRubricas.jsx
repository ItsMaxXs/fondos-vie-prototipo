// ============================================================
// Administración · rúbricas
// Edición de pesos y criterios de cada rúbrica. ERS: CU-03 (RF-CON-08).
// ============================================================
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Nota } from "../../componentes/comunes/Mensajes.jsx";
import { Bloque, Chk, Sel, Txt } from "../../componentes/formulario/campos.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { MODALIDADES } from "../../datos/modalidades.js";
import { useApp } from "../../estado/contexto.js";
import { num } from "../../utilidades/formato.js";
import { clone } from "../../utilidades/ids.js";
import { textos as T } from "../../textos/pantallas/administracion/AdmRubricas.js";

export function AdmRubricas() {
  const { db, act } = useApp();
  const [conv, setConv] = useState(db.convocatorias[0].id);
  const [mod, setMod] = useState(MODALIDADES[1]);
  const actual = db.rubricas[conv]?.[mod];
  const [secs, setSecs] = useState(clone(actual.secciones));
  useEffect(() => setSecs(clone(db.rubricas[conv][mod].secciones)), [conv, mod, db]);
  const total = secs.reduce((s, x) => s + x.criteria.reduce((a, c) => a + num(c.weight), 0), 0);
  const setC = (si_, ci, k, v) =>
    setSecs(
      secs.map((s, i) =>
        i !== si_
          ? s
          : { ...s, criteria: s.criteria.map((c, j) => (j === ci ? { ...c, [k]: v } : c)) },
      ),
    );
  return (
    <div className="stack-lg" style={{ marginTop: 12 }}>
      <div className="form-grid two-col">
        <Sel
          label={T.convocatoria}
          value={conv}
          onChange={setConv}
          opciones={db.convocatorias.map((c) => [c.id, c.nombre])}
        />
        <Sel label={T.modalidad} value={mod} onChange={setMod} opciones={MODALIDADES} />
      </div>
      <Nota tipo={Math.round(total) === 100 ? "info" : "error"}>
        {T.versionVigente} {actual.version}
        {T.losPesosSuman} <strong>{total}</strong> {T.de100AlGuardarSe}
      </Nota>
      {secs.map((s, si_) => (
        <Bloque key={s.id} n={secs.indexOf(s) + 1} titulo={s.title}>
          {s.criteria.map((c, ci) => (
            <div
              key={c.id}
              className="form-grid"
              style={{ gridTemplateColumns: "1fr 90px 130px", alignItems: "end" }}
            >
              <Txt label={T.criterio} value={c.label} onChange={(v) => setC(si_, ci, "label", v)} />
              <Txt
                label={T.peso}
                type="number"
                value={c.weight}
                onChange={(v) => setC(si_, ci, "weight", num(v))}
              />
              <Chk checked={c.required} onChange={(v) => setC(si_, ci, "required", v)}>
                {T.obligatorio}
              </Chk>
            </div>
          ))}
        </Bloque>
      ))}
      <div className="action-row end">
        <Boton
          icon={Save}
          onClick={() => act("guardarRubrica", { convId: conv, modalidad: mod, secciones: secs })}
        >
          {T.guardarNuevaVersion}
        </Boton>
      </div>
    </div>
  );
}
