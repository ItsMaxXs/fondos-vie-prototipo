// ============================================================
// Formulario · paso 16 · Documentación
// Carga de los documentos requeridos.
// ERS: RF-FOR-37, RF-FOR-42.
// ============================================================
import { FileUp, Trash2 } from "lucide-react";
import { Boton } from "../../../componentes/ui/Boton.jsx";
import { CajaInstrucciones } from "../../../componentes/ui/Campos.jsx";
import { num } from "../../../utilidades/formato.js";
import { textos as T } from "../../../textos/pantallas/formulario/pasos/PasoDocumentos.js";

export function PasoDocumentos({ f, upd, db, params }) {
  const req = [
    ["Plan de acción y gestión de riesgos (XLSX)", true],
    ["Presupuesto detallado (XLSX)", true],
    ["Cartas de compromiso", f.colaboradores.length > 0 || f.sectorSocio.orgs.length > 0],
    [
      "Oficios de financiamiento",
      f.financiamiento.some((r) => num(r.anio1) + num(r.anio2) + num(r.anio3) > 0),
    ],
    ["Aval de jefatura (personal de apoyo REC)", f.equipo.some((p) => p.esApoyo)],
  ];
  const otros = db.catalogos.tiposDocumento.filter(
    (t_) => !req.some((r) => r[0] === t_) && !/Acuerdo|Dictamen|Formulario/.test(t_),
  );
  const lista = [...req.map(([t_, o]) => [t_, o]), ...otros.map((t_) => [t_, false])];
  return (
    <div className="stack-xl">
      <CajaInstrucciones title={T.documentacionDeRespaldo}>
        {T.losDocumentosSeAdjuntanEn}
      </CajaInstrucciones>
      <div className="stack-md">
        {lista.map(([t_, obligatorio]) => {
          const d = f.documentos[t_];
          return (
            <div key={t_} className="ers-row" style={{ alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <strong>{t_}</strong>
                <span style={{ display: "block", fontSize: 12.5 }}>
                  {obligatorio ? T.obligatorio : T.opcional}
                  {d?.adjunto ? ` · ${d.nombre}` : ""}
                </span>
              </div>
              {d?.adjunto ? (
                <Boton
                  variant="ghost"
                  icon={Trash2}
                  onClick={() => upd((c) => delete c.documentos[t_])}
                >
                  {T.quitar}
                </Boton>
              ) : (
                <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
                  <FileUp size={17} /> <span>{T.adjuntarArchivo}</span>
                  <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) =>
                      e.target.files[0] &&
                      upd(
                        (c) =>
                          (c.documentos[t_] = { adjunto: true, nombre: e.target.files[0].name }),
                      )
                    }
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
