// ============================================================
// Administración · catálogos
// Edición de las listas desplegables. ERS: RF-CON-06.
// ============================================================
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Area, Sel } from "../../componentes/formulario/campos.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { useApp } from "../../estado/contexto.js";
import { lineas, num } from "../../utilidades/formato.js";
import { textos as T } from "../../textos/pantallas/administracion/AdmCatalogos.js";

export function AdmCatalogos() {
  const { db, act } = useApp();
  const claves = {
    odsLista: "Objetivos de Desarrollo Sostenible",
    activosPI: "Tipos de activo de propiedad intelectual",
    entesEticos: "Entes éticos y regulatorios",
    tiposDocumento: "Tipos de documento",
    productosAcademicos: "Productos académicos",
    productosAcademicosDT: "Productos académicos (desarrollo tecnológico)",
    productosFortalecimiento: "Productos de fortalecimiento",
    objetosGasto: "Objetos de gasto",
  };
  const [k, setK] = useState("odsLista");
  const aTexto = (v) => (v || []).map((x) => (Array.isArray(x) ? x.join(" | ") : x)).join("\n");
  const [txt, setTxt] = useState(aTexto(db.catalogos[k]));
  useEffect(() => setTxt(aTexto(db.catalogos[k])), [k]);
  const guardar = () => {
    const muestra = db.catalogos[k][0];
    const filas = lineas(txt);
    const valor = Array.isArray(muestra)
      ? filas.map((l) => {
          const p = l.split("|").map((x) => x.trim());
          return k === "objetosGasto" ? [p[0], p[1], p[2] || "O"] : [p[0], num(p[1]) || 1];
        })
      : filas;
    act("guardarCatalogo", { clave: k, valor });
  };
  return (
    <div className="stack-lg" style={{ marginTop: 12 }}>
      <Sel label={T.catalogo} value={k} onChange={setK} opciones={Object.entries(claves)} />
      <Area
        label={
          Array.isArray(db.catalogos[k][0])
            ? k === "objetosGasto"
              ? T.unElementoPorLineaCodigo
              : T.unElementoPorLineaNombre
            : T.unElementoPorLinea
        }
        rows={14}
        value={txt}
        onChange={setTxt}
      />
      <div className="action-row end">
        <Boton icon={Save} onClick={guardar}>
          {T.guardarCatalogo}
        </Boton>
      </div>
    </div>
  );
}
