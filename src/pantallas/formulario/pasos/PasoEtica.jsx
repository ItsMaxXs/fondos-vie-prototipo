// ============================================================
// Formulario · paso 12 · Aspectos éticos
// ERS: RF-FOR-35, RF-FOR-36.
// ============================================================
import { Area, Sel } from "../../../componentes/formulario/campos.jsx";
import { CajaInstrucciones, PreguntaSiNo } from "../../../componentes/ui/Campos.jsx";
import { PREGUNTAS_ETICA } from "../../../datos/catalogos.js";
import { textos as T } from "../../../textos/pantallas/formulario/pasos/PasoEtica.js";

export function PasoEtica({ f, upd, b, db }) {
  const requiere_ = PREGUNTAS_ETICA.some(([k]) => f.etica[k] === "Sí");
  return (
    <div className="stack-xl">
      <CajaInstrucciones title={T.admisibilidadEticaYRegulatoria}>
        {T.siAlgunaRespuestaEsSi}
      </CajaInstrucciones>
      {PREGUNTAS_ETICA.map(([k, texto, ente], i) => (
        <PreguntaSiNo
          key={k}
          number={i + 1}
          question={texto}
          value={f.etica[k]}
          onChange={(v) => upd((c) => (c.etica[k] = v))}
        >
          <span style={{ fontSize: 13.5 }}>
            {T.enteCompetente} <strong>{ente}</strong>
          </span>
        </PreguntaSiNo>
      ))}
      {requiere_ ? (
        <Sel
          label={T.enteAnteElCualSe}
          value={f.etica.ente}
          onChange={(v) => upd((c) => (c.etica.ente = v))}
          vacio="Seleccione"
          opciones={db.catalogos.entesEticos}
        />
      ) : (
        <Area
          label={T.justificacionDePorQueNo}
          rows={4}
          hint={T.minimo30Caracteres}
          {...b("etica.exencion")}
        />
      )}
    </div>
  );
}
