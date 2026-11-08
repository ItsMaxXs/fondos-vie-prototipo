// ============================================================
// Pantalla · reportes
// Selector de reporte, tabla y exportación a CSV/PDF. ERS: CU-16 (RF-REP-03 a RF-REP-09).
// ============================================================
import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Nota } from "../../componentes/comunes/Mensajes.jsx";
import { Pestanas } from "../../componentes/comunes/Pestanas.jsx";
import { Vacio } from "../../componentes/comunes/Vacio.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { TituloSeccion } from "../../componentes/ui/Encabezados.jsx";
import { Tabla } from "../../componentes/ui/Tablas.jsx";
import { useApp } from "../../estado/contexto.js";
import { construirReporte } from "../../reglas/reportes.js";
import { abrirDocumento, csv, descargar } from "../../utilidades/archivos.js";
import { esc } from "../../utilidades/formato.js";
import { textos as T } from "../../textos/pantallas/reportes/Reportes.js";

export function Reportes({ lista }) {
  const { db, rol } = useApp();
  const [id, setId] = useState("cantidad");
  const r = construirReporte(db, id, lista, rol);
  const opciones = [
    ["cantidad", "Cantidad de propuestas"],
    ["montos", "Montos y horas"],
    ["tiempos", "Tiempo por etapa"],
    ["devueltas", "Devueltas por faltantes"],
    ["productos", "Productos y activos de PI"],
    ["evaluaciones", "Notas por evaluador"],
  ];
  const html = r.filas
    ? `<table><tr>${r.cab.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>${r.filas.map((f) => `<tr>${f.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table>`
    : "";
  return (
    <div className="stack-lg">
      <Pestanas valor={id} onChange={setId} items={opciones} />
      {r.denegado ? (
        <Nota tipo="error">{T.esteReporteEstaRestringidoA}</Nota>
      ) : (
        <>
          <TituloSeccion
            title={r.titulo}
            description={r.extra}
            action={
              <>
                <Boton
                  variant="secondary"
                  icon={FileSpreadsheet}
                  onClick={() =>
                    descargar(`reporte_${id}.csv`, csv([r.cab, ...r.filas]), "text/csv")
                  }
                >
                  {T.excel}
                </Boton>
                <Boton
                  variant="secondary"
                  icon={FileText}
                  onClick={() => abrirDocumento(r.titulo, html)}
                >
                  {T.pdf}
                </Boton>
              </>
            }
          />
          {r.filas.length === 0 ? (
            <Vacio titulo={T.sinResultados} texto={T.noHayDatosParaLos} />
          ) : (
            <Tabla
              columns={r.cab.map((c, i) => ({ key: String(i), label: c }))}
              rows={r.filas.map((f, k) =>
                Object.fromEntries([["id", k], ...f.map((c, i) => [String(i), c])]),
              )}
            />
          )}
        </>
      )}
    </div>
  );
}
