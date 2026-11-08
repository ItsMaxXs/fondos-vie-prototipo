// ============================================================
// Formulario · paso 11 · Divulgación y socialización
// ERS: RF-FOR-38.
// ============================================================
import { Area } from "../../../componentes/formulario/campos.jsx";
import { textos as T } from "../../../textos/pantallas/formulario/pasos/PasoDivulgacion.js";

export function PasoDivulgacion({ b }) {
  return (
    <div className="stack-xl">
      <Area label={T.estrategiaDeDivulgacion} rows={4} {...b("divulgacion")} />
      <Area label={T.canalesDeDivulgacion} rows={3} {...b("canales")} />
      <Area label={T.eventosDeSocializacionDeResultados} rows={3} {...b("socializacion")} />
      <Area label={T.mediosDeComunicacionOpcional} rows={3} {...b("medios")} />
    </div>
  );
}
