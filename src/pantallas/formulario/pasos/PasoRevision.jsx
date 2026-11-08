// ============================================================
// Formulario · paso 17 · Revisión y envío
// Resumen de pasos completos e incidencias antes de enviar.
// ERS: CU-05 (RF-FOR-43 a RF-FOR-47).
// ============================================================
import { Insignia } from "../../../componentes/comunes/Insignias.jsx";
import { Nota } from "../../../componentes/comunes/Mensajes.jsx";
import { Boton } from "../../../componentes/ui/Boton.jsx";
import { Estadistica } from "../../../componentes/ui/Caja.jsx";
import { PASOS } from "../../../datos/pasos.js";
import { avanceGlobal, pasosCompletos } from "../../../reglas/formulario.js";
import { totalSolicitado } from "../../../reglas/presupuesto.js";
import { colones } from "../../../utilidades/formato.js";
import { textos as T } from "../../../textos/pantallas/formulario/pasos/PasoRevision.js";

// ---------- Paso final: revisión y envío ----------
export function PasoRevision({ f, issues, irA, params, db, mor, estado }) {
  const total = totalSolicitado(f, params);
  const errores = issues.filter((x) => x.nivel === "error");
  const avisos = issues.filter((x) => x.nivel === "aviso");
  const comp = pasosCompletos(issues);
  return (
    <div className="stack-xl">
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <Estadistica label={T.avance} value={`${avanceGlobal(issues)} %`} />
        <Estadistica label={T.elementosObligatoriosPendientes} value={errores.length} />
        <Estadistica label={T.avisos} value={avisos.length} />
        <Estadistica label={T.totalSolicitado} value={colones(total)} />
      </div>
      {mor.length > 0 && (
        <Nota tipo="aviso">
          {T.participantesConInformesPendientesAnte} {mor.join(", ")}.{" "}
          {params.politicaMorosidad === "bloquear"
            ? T.elEnvioEstaBloqueadoHasta
            : T.laPropuestaPuedeEnviarsePero}
        </Nota>
      )}
      <div className="stack-md">
        {PASOS.slice(0, 16).map((nombre, i) => {
          const es = issues.filter((x) => x.paso === i);
          return (
            <div key={nombre} className="ers-row" style={{ alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <strong>
                  {i + 1}. {nombre}
                </strong>
                {es.map((x, k) => (
                  <span
                    key={k}
                    style={{
                      display: "block",
                      fontSize: 13,
                      color: x.nivel === "error" ? "#9b1c1c" : "#8a5a00",
                    }}
                  >
                    {x.nivel === "error" ? T.falta : T.aviso}
                    {x.msg}
                  </span>
                ))}
              </div>
              {comp[i] ? (
                <Insignia tono="success">{T.completo}</Insignia>
              ) : (
                <Boton variant="secondary" onClick={() => irA(i)}>
                  {T.irAlPaso}
                </Boton>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
