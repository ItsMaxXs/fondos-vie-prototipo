// ============================================================
// Formulario · paso 4 · Problema y objetivos
// Problema, objetivo general y objetivos específicos.
// ERS: RF-FOR-21.
// ============================================================
import { Plus } from "lucide-react";
import { Area, Tarjeta, Txt } from "../../../componentes/formulario/campos.jsx";
import { Boton } from "../../../componentes/ui/Boton.jsx";
import { textos as T } from "../../../textos/pantallas/formulario/pasos/Paso4.js";

export function Paso4({ f, b, upd }) {
  return (
    <div className="stack-xl">
      <Area label={T.problemaDeInvestigacionEImportancia} rows={7} {...b("problema")} />
      <Txt label={T.objetivoGeneral} {...b("objetivoGeneral")} />
      <div className="stack-md">
        <strong>{T.objetivosEspecificos}</strong>
        {f.objetivos.map((o, i) => (
          <Tarjeta
            key={o.id}
            titulo={o.id}
            onQuitar={f.objetivos.length > 1 ? () => upd((c) => c.objetivos.splice(i, 1)) : null}
          >
            <Txt label={T.descripcion} {...b(`objetivos.${i}.texto`)} />
          </Tarjeta>
        ))}
        <div className="action-row">
          <Boton
            variant="secondary"
            icon={Plus}
            onClick={() =>
              upd((c) =>
                c.objetivos.push({
                  id: `OE${Math.max(0, ...c.objetivos.map((o) => Number(String(o.id).replace(/\D/g, "")) || 0)) + 1}`,
                  texto: "",
                }),
              )
            }
          >
            {T.agregarObjetivoEspecifico}
          </Boton>
        </div>
      </div>
    </div>
  );
}
