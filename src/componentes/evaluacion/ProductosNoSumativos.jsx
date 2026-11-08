// ============================================================
// Componentes de evaluación · productos no sumativos
// Revisión de productos que no suman puntaje (RF-EVA-17).
// ============================================================
import { Nota } from "../comunes/Mensajes.jsx";
import { resumenProductos } from "../../reglas/evaluacion.js";
import { textos as T } from "../../textos/componentes/evaluacion/ProductosNoSumativos.js";

export function ProductosNoSumativos({ p, params }) {
  const r = resumenProductos(p.form, params);
  return (
    <Nota tipo={r.cumple ? "info" : "aviso"}>
      <strong>{T.productosComprometidosSeccionNoSumativa}</strong> {r.comprometidos} de {r.minimo}{" "}
      {T.requeridosCon} {r.horas} {T.horasSemanales}{" "}
      {r.cumple ? T.cumpleElMinimo : T.noAlcanzaElMinimo} {T.estaSeccionSeInformaPero}
    </Nota>
  );
}
