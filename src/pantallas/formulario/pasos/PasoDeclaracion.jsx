// ============================================================
// Formulario · paso 15 · Declaración jurada
// ERS: RF-FOR-41.
// ============================================================
import { Chk, Txt } from "../../../componentes/formulario/campos.jsx";
import { CajaInstrucciones } from "../../../componentes/ui/Campos.jsx";
import { textos as T } from "../../../textos/pantallas/formulario/pasos/PasoDeclaracion.js";

export function PasoDeclaracion({ f, b, upd, usuario }) {
  return (
    <div className="stack-xl">
      <CajaInstrucciones title={T.declaracionJurada}>
        {T.declaroBajoFeDeJuramento}
      </CajaInstrucciones>
      <Chk checked={f.declaracion.acepta} onChange={(v) => upd((c) => (c.declaracion.acepta = v))}>
        {T.aceptoLaDeclaracionJurada}
      </Chk>
      <div className="form-grid two-col">
        <Txt label={T.numeroDeCedula} placeholder="1-2345-6789" {...b("declaracion.cedula")} />
        <Txt label={T.firmaDigitalNombreCompleto} {...b("declaracion.firma")} />
      </div>
    </div>
  );
}
