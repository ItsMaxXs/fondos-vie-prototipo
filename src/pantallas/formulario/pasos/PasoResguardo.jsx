// ============================================================
// Formulario · paso 10 · Resguardo de productos
// ERS: RF-FOR-39.
// ============================================================
import { Chk } from "../../../componentes/formulario/campos.jsx";
import { CajaInstrucciones } from "../../../componentes/ui/Campos.jsx";
import { textos as T } from "../../../textos/pantallas/formulario/pasos/PasoResguardo.js";

export function PasoResguardo({ f, upd }) {
  return (
    <div className="stack-xl">
      <CajaInstrucciones title={T.resguardoDeProductos}>
        {T.ambosCompromisosSonObligatoriosPara}
      </CajaInstrucciones>
      <Chk
        checked={f.resguardoRepositorio}
        onChange={(v) => upd((c) => (c.resguardoRepositorio = v))}
      >
        {T.meComprometoADepositarLos}
      </Chk>
      <Chk checked={f.resguardoSoftware} onChange={(v) => upd((c) => (c.resguardoSoftware = v))}>
        {T.meComprometoAResguardarEl}
      </Chk>
    </div>
  );
}
