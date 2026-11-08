// ============================================================
// Pantalla · lista de propuestas
// Tabla con búsqueda y filtros por estado.
// ERS: CU-16 (RF-REP-01).
// ============================================================
import { useState } from "react";
import { Plus } from "lucide-react";
import { EstadoInsignia } from "../../componentes/comunes/Insignias.jsx";
import { Vacio } from "../../componentes/comunes/Vacio.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { Caja } from "../../componentes/ui/Caja.jsx";
import { CampoBusqueda, Selector } from "../../componentes/ui/Campos.jsx";
import { EncabezadoPagina } from "../../componentes/ui/Encabezados.jsx";
import { Tabla } from "../../componentes/ui/Tablas.jsx";
import { useApp } from "../../estado/contexto.js";
import { visiblesPara } from "../../reglas/alcance.js";
import { recepcionAbierta } from "../../reglas/recepcion.js";
import { ver } from "../../utilidades/rutas.js";
import { textos as T } from "../../textos/pantallas/propuestas/ListaPropuestas.js";

export function ListaPropuestas() {
  const { db, usuario, rol, nav, ahora } = useApp();
  const [q_, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const conv = db.convocatorias.find((c) => c.estado === "Publicada");
  const lista = visiblesPara(db, usuario, rol).filter(
    (p) =>
      (!estado || p.estado === estado) &&
      (!q_ || `${p.id} ${p.titulo} ${p.investigadora}`.toLowerCase().includes(q_.toLowerCase())),
  );
  const estados = [...new Set(visiblesPara(db, usuario, rol).map((p) => p.estado))];
  return (
    <div>
      <EncabezadoPagina
        eyebrow={T.propuestas}
        title={rol === "investigador" ? T.misPropuestas : T.propuestasDeLaConvocatoria}
        description={T.estadoDeCadaExpedienteA}
        actions={
          rol === "investigador" && conv && recepcionAbierta(db, conv.id, ahora) ? (
            <Boton icon={Plus} onClick={() => nav("/propuestas/nueva")}>
              {T.nuevaPropuesta}
            </Boton>
          ) : null
        }
      />
      <Caja>
        <div className="action-row" style={{ marginBottom: 12 }}>
          <CampoBusqueda value={q_} onChange={setQ} placeholder={T.buscarPorCodigoTituloO} />
          <Selector
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            style={{ maxWidth: 260 }}
          >
            <option value="">{T.todosLosEstados}</option>
            {estados.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </Selector>
        </div>
        {lista.length === 0 ? (
          <Vacio titulo={T.sinPropuestas} texto={T.noHayPropuestasQueCoincidan} />
        ) : (
          <Tabla
            columns={[
              { key: "id", label: T.codigo },
              {
                key: "titulo",
                label: T.proyecto,
                render: (v, r) => (
                  <div className="table-primary">
                    <strong>{v || T.borradorSinTitulo}</strong>
                    <span>
                      {r.investigadora} · {r.escuela}
                    </span>
                  </div>
                ),
              },
              { key: "modalidad", label: T.modalidad },
              { key: "presupuesto", label: T.monto },
              { key: "estado", label: T.estado, render: (v) => <EstadoInsignia estado={v} /> },
            ]}
            rows={lista}
            onRowClick={(r) =>
              nav(
                rol === "investigador" &&
                  ["Borrador", "Devuelta por faltantes", "Con observaciones"].includes(r.estado)
                  ? `/propuestas/${r.id}/editar`
                  : ver(r.id),
              )
            }
          />
        )}
      </Caja>
    </div>
  );
}
