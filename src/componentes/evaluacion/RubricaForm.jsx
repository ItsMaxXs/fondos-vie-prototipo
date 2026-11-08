// ============================================================
// Componentes de evaluación · formulario de rúbrica
// Tabla de criterios con nivel, puntaje y justificación. La usan el Cuerpo Evaluador (CU-08) y el CIE (CU-13).
// ERS: RF-EVA-02 a RF-EVA-09.
// ============================================================
import { Insignia } from "../comunes/Insignias.jsx";
import { Nota } from "../comunes/Mensajes.jsx";
import { Estadistica } from "../ui/Caja.jsx";
import { AreaTexto } from "../ui/Campos.jsx";
import { NIVELES } from "../../datos/rubricas.js";
import { calcularEvaluacion } from "../../reglas/evaluacion.js";
import { textos as T } from "../../textos/componentes/evaluacion/RubricaForm.js";

// ---------- Rúbrica (CU-08) ----------
export function RubricaForm({ rub, scores, reasons, onScore, onReason, locked, umbral }) {
  const calc = calcularEvaluacion(rub, scores, umbral);
  return (
    <div className="stack-lg">
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <Estadistica
          label={T.notaAcumulada}
          value={`${calc.nota} %`}
          hint={`Umbral del Comité: ${umbral} %`}
        />
        <Estadistica label={T.criteriosSinEvaluar} value={calc.sinEvaluar.length} />
        <Estadistica
          label={T.resultadoProvisional}
          value={calc.sinEvaluar.length ? "En curso" : calc.resultado}
          hint={
            calc.obligatoriosBajos.length
              ? `${calc.obligatoriosBajos.length} obligatorio(s) bajo 8`
              : ""
          }
        />
      </div>
      {calc.obligatoriosBajos.length > 0 && (
        <Nota tipo="aviso">{T.hayCriteriosObligatoriosConNivel}</Nota>
      )}
      {rub.map((s, si) => (
        <section key={s.id} className="form-section-block">
          <div className="numbered-title">
            <span>{si + 1}</span>
            <h3>
              {s.title}{" "}
              <small style={{ fontWeight: 400, opacity: 0.7 }}>
                ({s.weight} {T.puntosSubtotal}{" "}
                {(Math.round((calc.subtotales[s.title] || 0) * 10) / 10).toFixed(1)})
              </small>
            </h3>
          </div>
          {s.criteria.map((c) => (
            <div key={c.id} style={{ borderBottom: "1px solid #eef0f3", padding: "10px 0" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 260, fontSize: 14.5 }}>
                  {c.label} {c.required && <Insignia tono="danger">{T.obligatorio}</Insignia>}{" "}
                  <span style={{ opacity: 0.6, fontSize: 12.5 }}>· {c.weight} pts</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {NIVELES.map((n) => (
                    <button
                      key={n.valor}
                      type="button"
                      disabled={locked}
                      onClick={() => onScore(c.id, n.valor)}
                      style={{
                        border: "1px solid " + (scores[c.id] === n.valor ? "#0b4f8a" : "#cfd6de"),
                        background: scores[c.id] === n.valor ? "#e4effa" : "#fff",
                        color: scores[c.id] === n.valor ? "#0b4f8a" : "#33404d",
                        borderRadius: 8,
                        padding: "5px 10px",
                        fontSize: 12.5,
                        cursor: locked ? "default" : "pointer",
                        fontWeight: scores[c.id] === n.valor ? 700 : 500,
                      }}
                    >
                      {n.nombre}
                    </button>
                  ))}
                </div>
              </div>
              {(c.required || reasons[c.id]) && (
                <div style={{ marginTop: 8 }}>
                  <AreaTexto
                    rows={2}
                    disabled={locked}
                    placeholder={
                      c.required ? T.justificacionEscritaObligatoria : T.comentarioOpcional
                    }
                    value={reasons[c.id] || ""}
                    onChange={(e) => onReason(c.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
