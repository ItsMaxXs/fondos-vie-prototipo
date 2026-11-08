// ============================================================
// Pantalla · informes pendientes
// Carga y regularización de personas con informes pendientes y su efecto en las propuestas.
// ERS: CU-15 (RF-MOR-01 a RF-MOR-06).
// ============================================================
import { useState } from "react";
import { Check, FileSpreadsheet, FileUp, Plus } from "lucide-react";
import { EstadoInsignia, Insignia } from "../../componentes/comunes/Insignias.jsx";
import { Pestanas } from "../../componentes/comunes/Pestanas.jsx";
import { Vacio } from "../../componentes/comunes/Vacio.jsx";
import { Area, Txt } from "../../componentes/formulario/campos.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { Caja, Estadistica } from "../../componentes/ui/Caja.jsx";
import { EncabezadoPagina, TituloSeccion } from "../../componentes/ui/Encabezados.jsx";
import { Tabla } from "../../componentes/ui/Tablas.jsx";
import { Ventana } from "../../componentes/ui/Ventanas.jsx";
import { useApp } from "../../estado/contexto.js";
import { paramsDe } from "../../reglas/consultas.js";
import { esFinal } from "../../reglas/estados.js";
import { norm } from "../../reglas/formulario.js";
import { csv, descargar } from "../../utilidades/archivos.js";
import { fechaCorta } from "../../utilidades/fechas.js";
import { textos as T } from "../../textos/pantallas/reportes/Morosidad.js";

// ---------- Informes pendientes ----------
export function Morosidad() {
  const { db, act, rol } = useApp();
  const [filtro, setFiltro] = useState("Pendiente");
  const [nuevo, setNuevo] = useState(null);
  const [reg, setReg] = useState(null);
  const puedeRegularizar = rol === "direccion_investigacion" || rol === "admin";
  const lista = db.morosos.filter((m) => !filtro || m.estado === filtro);
  const afectadas = (m) =>
    db.proposals.filter(
      (p) =>
        !p.historico &&
        p.form &&
        !esFinal(p) &&
        (p.form.equipo || []).some(
          (e) => norm(e.nombre) === norm(m.nombre) || (m.cedula && e.cedula === m.cedula),
        ),
    );
  const leerArchivo = (file) => {
    if (!file) return;
    const lector = new FileReader();
    lector.onload = () => {
      const filas = String(lector.result || "")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.split(/[;,\t]/).map((x) => x.replace(/^"|"$/g, "").trim()))
        .filter((c, i) => !(i === 0 && /nombre/i.test(c[0])))
        .map(([nombre, cedula, proyecto, detalle]) => ({ nombre, cedula, proyecto, detalle }));
      act("cargarMorosos", { filas });
    };
    lector.readAsText(file);
  };
  const reporte = db.proposals.filter((p) => !p.historico && (p.morosidad || []).length > 0);
  return (
    <div>
      <EncabezadoPagina
        eyebrow={T.condicionAnteLaVie}
        title={T.personasConInformesPendientes}
        description={T.registroQueSeConsultaAl}
        actions={
          <>
            <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
              <FileUp size={17} />
              <span>{T.cargarArchivoCsv}</span>
              <input
                type="file"
                accept=".csv,.txt"
                style={{ display: "none" }}
                onChange={(e) => {
                  leerArchivo(e.target.files[0]);
                  e.target.value = "";
                }}
              />
            </label>
            <Boton
              icon={Plus}
              onClick={() => setNuevo({ nombre: "", cedula: "", proyecto: "", detalle: "" })}
            >
              {T.agregarPersona}
            </Boton>
          </>
        }
      />
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <Estadistica
          label={T.conInformesPendientes}
          value={db.morosos.filter((m) => m.estado === "Pendiente").length}
        />
        <Estadistica
          label={T.regularizadas}
          value={db.morosos.filter((m) => m.estado === "Regularizado").length}
        />
        <Estadistica
          label={T.propuestasAfectadas}
          value={reporte.length}
          hint={`Política vigente: ${paramsDe(db, db.convocatorias[0].id).politicaMorosidad === "bloquear" ? "bloquear el envío" : "advertir y dejar observación"}`}
        />
      </div>
      <Caja>
        <Pestanas
          valor={filtro}
          onChange={setFiltro}
          items={[
            ["Pendiente", T.pendientes],
            ["Regularizado", T.regularizadas],
            ["", T.todas],
          ]}
        />
        <Tabla
          columns={[
            { key: "nombre", label: T.persona },
            { key: "cedula", label: T.cedula },
            { key: "proyecto", label: T.proyecto },
            { key: "detalle", label: T.detalle },
            {
              key: "estado",
              label: T.estado,
              render: (v, m) => (
                <Insignia tono={v === "Pendiente" ? "danger" : "success"}>
                  {v}
                  {m.regularizado ? ` · ${fechaCorta(m.regularizado.fecha)}` : ""}
                </Insignia>
              ),
            },
            {
              key: "af",
              label: T.propuestas,
              render: (_, m) =>
                afectadas(m)
                  .map((p) => p.id)
                  .join(", ") || "—",
            },
            {
              key: "x",
              label: "",
              render: (_, m) =>
                m.estado === "Pendiente" && puedeRegularizar ? (
                  <Boton
                    variant="secondary"
                    icon={Check}
                    onClick={() => setReg({ id: m.id, nombre: m.nombre, soporte: "" })}
                  >
                    {T.regularizar}
                  </Boton>
                ) : null,
            },
          ]}
          rows={lista}
        />
      </Caja>
      <Caja style={{ marginTop: 16 }}>
        <TituloSeccion
          title={T.reporteParticipantesConPendientesEn}
          description={T.propuestasVigentesCuyoEquipoIncluye}
          action={
            <Boton
              variant="secondary"
              icon={FileSpreadsheet}
              onClick={() =>
                descargar(
                  "personas_con_pendientes.csv",
                  csv([
                    ["Propuesta", "Título", "Personas con pendientes", "Estado"],
                    ...reporte.map((p) => [p.id, p.titulo, p.morosidad.join(", "), p.estado]),
                  ]),
                  "text/csv",
                )
              }
            >
              {T.exportar}
            </Boton>
          }
        />
        {reporte.length === 0 ? (
          <Vacio titulo={T.sinCoincidencias} texto={T.ningunaPropuestaVigenteIncluyePersonas} />
        ) : (
          <Tabla
            columns={[
              { key: "id", label: T.propuesta },
              { key: "titulo", label: T.titulo },
              { key: "morosidad", label: T.personas, render: (v) => v.join(", ") },
              { key: "estado", label: T.estado, render: (v) => <EstadoInsignia estado={v} /> },
            ]}
            rows={reporte}
          />
        )}
      </Caja>
      <Ventana
        open={!!nuevo}
        onClose={() => setNuevo(null)}
        title={T.agregarPersonaAlRegistro}
        footer={
          <>
            <Boton variant="secondary" onClick={() => setNuevo(null)}>
              {T.cancelar}
            </Boton>
            <Boton
              onClick={() => {
                const r = act("agregarMoroso", nuevo);
                if (r.ok) setNuevo(null);
              }}
            >
              {T.agregar}
            </Boton>
          </>
        }
      >
        {nuevo && (
          <div className="stack-md">
            <Txt
              label={T.nombreCompleto}
              value={nuevo.nombre}
              onChange={(v) => setNuevo({ ...nuevo, nombre: v })}
            />
            <div className="form-grid two-col">
              <Txt
                label={T.cedula}
                value={nuevo.cedula}
                onChange={(v) => setNuevo({ ...nuevo, cedula: v })}
              />
              <Txt
                label={T.proyecto}
                value={nuevo.proyecto}
                onChange={(v) => setNuevo({ ...nuevo, proyecto: v })}
              />
            </div>
            <Area
              label={T.informeOProductoPendiente}
              rows={3}
              value={nuevo.detalle}
              onChange={(v) => setNuevo({ ...nuevo, detalle: v })}
            />
          </div>
        )}
      </Ventana>
      <Ventana
        open={!!reg}
        onClose={() => setReg(null)}
        title={reg ? `Regularizar a ${reg.nombre}` : ""}
        description={T.seRegistraLaFechaY}
        footer={
          <>
            <Boton variant="secondary" onClick={() => setReg(null)}>
              {T.cancelar}
            </Boton>
            <Boton
              onClick={() => {
                const r = act("regularizarMoroso", reg);
                if (r.ok) setReg(null);
              }}
            >
              {T.registrar}
            </Boton>
          </>
        }
      >
        {reg && (
          <Txt
            label={T.soporteOficioOInformeEntregado}
            value={reg.soporte}
            onChange={(v) => setReg({ ...reg, soporte: v })}
          />
        )}
      </Ventana>
    </div>
  );
}
