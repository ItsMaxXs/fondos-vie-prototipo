// ============================================================
// Pantalla · histórico y reportes
// Convocatorias anteriores y acceso a los reportes. ERS: CU-16 (RF-CON-12, RF-REP-01, RF-REP-02).
// ============================================================
import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { EstadoInsignia } from "../../componentes/comunes/Insignias.jsx";
import { Pestanas } from "../../componentes/comunes/Pestanas.jsx";
import { Vacio } from "../../componentes/comunes/Vacio.jsx";
import { Sel, Txt } from "../../componentes/formulario/campos.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { Caja } from "../../componentes/ui/Caja.jsx";
import { EncabezadoPagina } from "../../componentes/ui/Encabezados.jsx";
import { Tabla } from "../../componentes/ui/Tablas.jsx";
import { ESTADOS } from "../../datos/estados.js";
import { useApp } from "../../estado/contexto.js";
import { BANDEJAS } from "../bandejas/registro.js";
import { Reportes } from "./Reportes.jsx";
import { csv, descargar } from "../../utilidades/archivos.js";
import { ver } from "../../utilidades/rutas.js";
import { textos as T } from "../../textos/pantallas/reportes/HistoricoReportes.js";

// ---------- Histórico y reportes ----------
export function HistoricoReportes() {
  const { db, rol, nav, usuario } = useApp();
  const [tab, setTab] = useState("historico");
  const [f, setF] = useState({ conv: "", inst: "", persona: "", tema: "", estado: "" });
  const todas = db.proposals.filter(
    (p) =>
      p.estado !== "Borrador" &&
      (rol !== "investigador" || p.historico || p.coordinadorId === usuario.id),
  );
  const lista = todas.filter(
    (p) =>
      (!f.conv || p.convocatoriaId === f.conv) &&
      (!f.inst || p.instancia === f.inst) &&
      (!f.persona ||
        `${p.investigadora} ${(p.form?.equipo || []).map((e) => e.nombre).join(" ")}`
          .toLowerCase()
          .includes(f.persona.toLowerCase())) &&
      (!f.tema ||
        `${p.tema || ""} ${p.form?.linea || ""} ${p.titulo}`
          .toLowerCase()
          .includes(f.tema.toLowerCase())) &&
      (!f.estado ||
        p.estado === f.estado ||
        p.cie?.resolucion?.resultado === f.estado ||
        p.resultado === f.estado),
  );
  const puedeReportes = rol !== "investigador";
  const abrir = (p) =>
    nav(
      p.historico || rol === "investigador"
        ? ver(p.id)
        : BANDEJAS[rol]
          ? `/bandeja/${p.id}`
          : ver(p.id),
    );
  return (
    <div>
      <EncabezadoPagina
        eyebrow={T.consulta}
        title={T.historicoYReportes}
        description={T.propuestasDeConvocatoriasAnterioresY}
      />
      <Caja>
        <Pestanas
          valor={tab}
          onChange={setTab}
          items={[["historico", T.historico], ...(puedeReportes ? [["reportes", T.reportes]] : [])]}
        />
        <div
          className="form-grid"
          style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))", margin: "12px 0" }}
        >
          <Sel
            label={T.convocatoria}
            value={f.conv}
            onChange={(v) => setF({ ...f, conv: v })}
            vacio="Todas"
            opciones={db.convocatorias.map((c) => [c.id, c.id])}
          />
          <Sel
            label={T.dependencia}
            value={f.inst}
            onChange={(v) => setF({ ...f, inst: v })}
            vacio="Todas"
            opciones={db.instancias.map((i) => [i.id, i.nombre])}
          />
          <Txt
            label={T.personaInvestigadora}
            value={f.persona}
            onChange={(v) => setF({ ...f, persona: v })}
          />
          <Txt label={T.tematica} value={f.tema} onChange={(v) => setF({ ...f, tema: v })} />
          <Sel
            label={T.estadoOResultado}
            value={f.estado}
            onChange={(v) => setF({ ...f, estado: v })}
            vacio="Todos"
            opciones={[...new Set([...Object.keys(ESTADOS), "Aprobada", "Rechazada"])]}
          />
        </div>
        {tab === "historico" ? (
          lista.length === 0 ? (
            <Vacio titulo={T.sinResultados} texto={T.noHayPropuestasConEsos} />
          ) : (
            <>
              <div className="action-row end" style={{ marginBottom: 8 }}>
                <Boton
                  variant="secondary"
                  icon={FileSpreadsheet}
                  onClick={() =>
                    descargar(
                      "historico.csv",
                      csv([
                        [
                          "Código",
                          "Convocatoria",
                          "Título",
                          "Persona",
                          "Instancia",
                          "Modalidad",
                          "Estado",
                          "Resolución",
                        ],
                        ...lista.map((p) => [
                          p.id,
                          p.convocatoriaId,
                          p.titulo,
                          p.investigadora,
                          p.escuela,
                          p.modalidad,
                          p.estado,
                          p.cie?.resolucion?.numero || "",
                        ]),
                      ]),
                      "text/csv",
                    )
                  }
                >
                  {T.exportar}
                </Boton>
              </div>
              <Tabla
                columns={[
                  { key: "id", label: T.codigo },
                  { key: "convocatoriaId", label: T.convocatoria },
                  {
                    key: "titulo",
                    label: T.proyecto,
                    render: (v, p) => (
                      <div className="table-primary">
                        <strong>{v}</strong>
                        <span>
                          {p.investigadora} · {p.escuela}
                        </span>
                      </div>
                    ),
                  },
                  { key: "modalidad", label: T.modalidad },
                  {
                    key: "estado",
                    label: T.estado,
                    render: (v, p) => (
                      <EstadoInsignia
                        estado={
                          p.cie?.resolucion && p.estado === "Notificada"
                            ? `${v} · ${p.cie.resolucion.resultado}`
                            : v
                        }
                      />
                    ),
                  },
                  {
                    key: "res",
                    label: T.resolucion,
                    render: (_, p) => p.cie?.resolucion?.numero || "—",
                  },
                ]}
                rows={lista}
                onRowClick={abrir}
              />
            </>
          )
        ) : (
          <Reportes lista={lista} />
        )}
      </Caja>
    </div>
  );
}
