// ============================================================
// Formulario · pasos de texto libre
// Paso genérico con un área de texto y límite de palabras. Se usa en el paso 5 (estado del arte), 6 (metodología), 13 (hoja de ruta) y 14 (referencias).
// ERS: RF-FOR-21, RF-FOR-40.
// ============================================================
import { Area } from "../../../componentes/formulario/campos.jsx";

export function PasoTexto({ b, campo, label, rows = 8, extra }) {
  return (
    <div className="stack-xl">
      {extra}
      <Area label={label} rows={rows} {...b(campo)} />
    </div>
  );
}
