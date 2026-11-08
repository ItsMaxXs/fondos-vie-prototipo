// ============================================================
// Pantalla · bandeja de trabajo por rol
// Lista las propuestas de competencia del rol y, al abrir una, muestra el panel de acción que le corresponde (ver registro.js).
// ============================================================
import { useState } from "react";
import { useParams } from "react-router-dom";
import { EstadoInsignia } from "../../componentes/comunes/Insignias.jsx";
import { Pestanas } from "../../componentes/comunes/Pestanas.jsx";
import { Vacio } from "../../componentes/comunes/Vacio.jsx";
import { Caja } from "../../componentes/ui/Caja.jsx";
import { CampoBusqueda } from "../../componentes/ui/Campos.jsx";
import { EncabezadoPagina } from "../../componentes/ui/Encabezados.jsx";
import { Tabla } from "../../componentes/ui/Tablas.jsx";
import { NOMBRE_BANDEJA } from "../../datos/navegacion.js";
import { ROL_NOMBRE } from "../../datos/roles.js";
import { useApp } from "../../estado/contexto.js";
import { DetallePropuesta } from "../propuestas/DetallePropuesta.jsx";
import { pendienteDe, visiblesPara } from "../../reglas/alcance.js";
import { fechaCorta } from "../../utilidades/fechas.js";
import { textos as T } from "../../textos/pantallas/bandejas/Bandeja.js";

export function Bandeja() {
  const { id } = useParams();
  const { db, usuario, rol, nav } = useApp();
  const [tab, setTab] = useState("pend");
  const [q_, setQ] = useState("");
  if (id) return <DetallePropuesta />;
  const todas = visiblesPara(db, usuario, rol);
  const pend = todas.filter((p) => pendienteDe(db, usuario, rol, p));
  const lista = (tab === "pend" ? pend : todas).filter(
    (p) => !q_ || `${p.id} ${p.titulo} ${p.investigadora}`.toLowerCase().includes(q_.toLowerCase()),
  );
  const borradores =
    rol === "gestora_vie" ? db.proposals.filter((p) => p.estado === "Borrador" && !p.vencida) : [];
  return (
    <div>
      <EncabezadoPagina
        eyebrow={ROL_NOMBRE[rol]}
        title={NOMBRE_BANDEJA[rol] || T.bandeja}
        description={T.expedientesDeSuCompetenciaAbra}
      />
      <Caja>
        <Pestanas
          valor={tab}
          onChange={setTab}
          items={[
            ["pend", T.pendientes, pend.length],
            ["todas", T.todas, todas.length],
            ...(borradores.length ? [["bor", T.borradores, borradores.length]] : []),
          ]}
        />
        <div className="action-row" style={{ margin: "10px 0" }}>
          <CampoBusqueda value={q_} onChange={setQ} placeholder={T.buscarPorCodigoTituloO} />
        </div>
        {(tab === "bor" ? borradores : lista).length === 0 ? (
          <Vacio
            titulo={tab === "pend" ? T.sinPendientes : T.sinResultados}
            texto={T.noHayExpedientesEnEsta}
          />
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
              { key: "estado", label: T.estado, render: (v) => <EstadoInsignia estado={v} /> },
              {
                key: "ult",
                label: T.ultimaActividad,
                render: (_, r) => fechaCorta((r.timeline || []).slice(-1)[0]?.fecha),
              },
            ]}
            rows={tab === "bor" ? borradores : lista}
            onRowClick={(r) => nav(`/bandeja/${r.id}`)}
          />
        )}
      </Caja>
    </div>
  );
}
