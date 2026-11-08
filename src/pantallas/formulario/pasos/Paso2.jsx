// ============================================================
// Formulario · paso 2 · Resumen y palabras clave
// Resumen y abstract con límite de palabras.
// ERS: RF-FOR-09.
// ============================================================
import { Area, Txt } from "../../../componentes/formulario/campos.jsx";
import { textos as T } from "../../../textos/pantallas/formulario/pasos/Paso2.js";

export function Paso2({ f, b, params }) {
  return (
    <div className="stack-xl">
      <Area
        label={T.resumenDelProyecto}
        rows={7}
        max={params.resumenMaxPalabras}
        {...b("resumen")}
      />
      <Txt
        label={T.palabrasClave}
        hint={`Entre ${params.palabrasClave[0]} y ${params.palabrasClave[1]}, separadas por comas.`}
        {...b("palabras")}
      />
      <Area label={T.abstractEnIngles} rows={6} {...b("abstract")} />
      <Txt label={T.keywordsEnIngles} hint={T.separadasPorComas} {...b("keywords")} />
    </div>
  );
}
