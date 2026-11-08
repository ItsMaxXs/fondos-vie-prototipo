// ============================================================
// Pantalla · resumen de solo lectura de un formulario
// Muestra todos los pasos de la propuesta en formato de lectura (se reutiliza en el detalle y en las bandejas).
// ============================================================
import { useState } from "react";
import { Dato, Parrafo } from "../../componentes/comunes/Datos.jsx";
import { Nota } from "../../componentes/comunes/Mensajes.jsx";
import { Pestanas } from "../../componentes/comunes/Pestanas.jsx";
import { Tabla } from "../../componentes/ui/Tablas.jsx";
import { PREGUNTAS_ETICA } from "../../datos/catalogos.js";
import { esDT } from "../../datos/modalidades.js";
import { useApp } from "../../estado/contexto.js";
import { nombreInstancia } from "../../reglas/alcance.js";
import { paramsDe } from "../../reglas/consultas.js";
import { mesesProyecto, presupuestoPorAnio } from "../../reglas/presupuesto.js";
import { colones } from "../../utilidades/formato.js";
import { textos as T } from "../../textos/pantallas/propuestas/ResumenFormulario.js";

export function ResumenFormulario({ p }) {
  const { db } = useApp();
  const f = p.form;
  const params = paramsDe(db, p.convocatoriaId);
  const pres = presupuestoPorAnio(f, params);
  const [sec, setSec] = useState("generales");
  const secs = [
    ["generales", "Datos generales"],
    ["equipo", "Equipo"],
    ["contenido", "Contenido"],
    ["plan", "Plan y riesgos"],
    ["presupuesto", "Presupuesto"],
    ["productos", "Productos y ética"],
    ["docs", "Documentos"],
  ];
  return (
    <div>
      <Pestanas valor={sec} onChange={setSec} items={secs} />
      {sec === "generales" && (
        <div className="stack-lg">
          <div className="detail-grid">
            <Dato k="Modalidad" v={f.modalidad} />
            <Dato k="Instancia coordinadora" v={nombreInstancia(db, f.instancia)} />
            <Dato
              k="Instancias participantes"
              v={(f.participantes || []).map((i) => nombreInstancia(db, i)).join(", ") || "Ninguna"}
            />
            <Dato k="Duración" v={`${f.inicio} a ${f.fin} (${mesesProyecto(f)} meses)`} />
            <Dato k="Línea de investigación" v={f.linea} />
            <Dato k="ODS" v={(f.ods || []).join(", ")} />
            <Dato k="TRL" v={f.trlInicial ? `${f.trlInicial} → ${f.trlFinal}` : "No aplica"} />
            <Dato
              k="Propiedad intelectual"
              v={f.q.pi.r === "Sí" || esDT(f.modalidad) ? "Requiere dictamen" : "No requiere"}
            />
          </div>
          <Parrafo titulo={T.resumen} texto={f.resumen} />
          <Parrafo titulo={T.palabrasClave} texto={f.palabras} />
          <Parrafo titulo={T.abstract} texto={f.abstract} />
          <Parrafo titulo={T.keywords} texto={f.keywords} />
        </div>
      )}
      {sec === "equipo" && (
        <div className="stack-lg">
          <Tabla
            columns={[
              { key: "nombre", label: T.persona },
              { key: "instancia", label: T.instancia, render: (v) => nombreInstancia(db, v) },
              { key: "rol", label: T.rol },
              { key: "horas", label: T.horas },
              { key: "tipoHora", label: T.tipo },
              { key: "periodo", label: T.periodo },
            ]}
            rows={(f.equipo || []).map((x) => ({ ...x }))}
          />
          {(f.colaboradores || []).length > 0 && (
            <Tabla
              columns={[
                { key: "nombre", label: T.colaboradorExterno },
                { key: "institucion", label: T.institucion },
                { key: "carta", label: T.carta, render: (v) => (v ? "Adjunta" : "Falta") },
              ]}
              rows={f.colaboradores}
            />
          )}
          {(f.sectorSocio?.orgs || []).length > 0 && (
            <Tabla
              columns={[
                { key: "nombre", label: T.organizacion },
                { key: "alcance", label: T.alcance },
              ]}
              rows={f.sectorSocio.orgs}
            />
          )}
          {(p.morosidad || []).length > 0 && (
            <Nota tipo="aviso">
              {T.informesPendientesAnteLaVie} {p.morosidad.join(", ")}.
            </Nota>
          )}
        </div>
      )}
      {sec === "contenido" && (
        <div>
          <Parrafo titulo={T.problemaDeInvestigacion} texto={f.problema} />
          <Parrafo titulo={T.objetivoGeneral} texto={f.objetivoGeneral} />
          <Parrafo
            titulo={T.objetivosEspecificos}
            texto={(f.objetivos || []).map((o) => `${o.id}. ${o.texto}`).join("\n")}
          />
          <Parrafo titulo={T.estadoDelArte} texto={f.estadoArte} />
          <Parrafo titulo={T.metodologia} texto={f.metodologia} />
          <Parrafo titulo={T.hojaDeRuta} texto={f.hojaRuta} />
          <Parrafo titulo={T.referencias} texto={f.referencias} />
        </div>
      )}
      {sec === "plan" && (
        <div className="stack-lg">
          <Tabla
            columns={[
              { key: "objetivoId", label: T.objetivo },
              { key: "actividad", label: T.actividad },
              { key: "resultado", label: T.resultado },
              { key: "participantes", label: T.participantes, render: (v) => (v || []).join(", ") },
              { key: "inicio", label: T.mes },
              { key: "duracion", label: T.duracion },
            ]}
            rows={(f.plan || []).map((a) => ({ ...a }))}
          />
          <Tabla
            columns={[
              { key: "act", label: T.actividad },
              { key: "riesgo", label: T.riesgo },
              { key: "mitigacion", label: T.mitigacion },
              { key: "responsable", label: T.responsable },
            ]}
            rows={(f.plan || []).flatMap((a, i) =>
              (a.riesgos || []).map((r) => ({ id: r.id, act: `Actividad ${i + 1}`, ...r })),
            )}
          />
        </div>
      )}
      {sec === "presupuesto" && (
        <div className="stack-lg">
          <Tabla
            columns={[
              { key: "anio", label: T.ano },
              { key: "operativo", label: T.operativo, render: (v) => colones(v) },
              { key: "servicios", label: T.servicios, render: (v) => colones(v) },
              { key: "duraderos", label: T.duraderos, render: (v) => colones(v) },
              { key: "total", label: T.total, render: (v) => <strong>{colones(v)}</strong> },
            ]}
            rows={pres.map((x) => ({ ...x, id: x.anio }))}
          />
          <Tabla
            columns={[
              { key: "anio", label: T.ano },
              { key: "detalle", label: T.requerimiento },
              { key: "monto", label: T.monto, render: (v) => colones(v) },
              { key: "justificacion", label: T.justificacion },
            ]}
            rows={(f.presupuesto || []).map((l) => ({ ...l }))}
          />
          <Tabla
            columns={[
              { key: "tipo", label: T.otrasFuentes },
              { key: "entidad", label: T.entidad },
              { key: "oficio", label: T.oficio },
              { key: "anio1", label: T.ano1, render: (v) => (v ? colones(v) : "—") },
              { key: "anio2", label: T.ano2, render: (v) => (v ? colones(v) : "—") },
            ]}
            rows={(f.financiamiento || []).map((x) => ({ ...x, id: x.tipo }))}
          />
        </div>
      )}
      {sec === "productos" && (
        <div className="stack-lg">
          <Tabla
            columns={[
              { key: "tipo", label: T.productoComprometido },
              { key: "objetivoId", label: T.objetivo },
            ]}
            rows={(f.productos || []).map((x, i) => ({ ...x, id: i }))}
          />
          {(f.activosPI || []).length > 0 && (
            <Tabla
              columns={[
                { key: "tipo", label: T.activoDePi },
                { key: "consecutivo", label: T.consecutivoDelDictamen },
              ]}
              rows={f.activosPI.map((x, i) => ({ ...x, id: i }))}
            />
          )}
          <div className="detail-grid">
            {PREGUNTAS_ETICA.map(([k, tx]) => (
              <Dato key={k} k={tx.slice(0, 60) + "…"} v={f.etica[k]} />
            ))}
          </div>
          <Parrafo titulo={T.enteOJustificacion} texto={f.etica.ente || f.etica.exencion} />
        </div>
      )}
      {sec === "docs" && (
        <Tabla
          columns={[
            { key: "nombre", label: T.documento },
            { key: "archivo", label: T.archivo },
          ]}
          rows={Object.entries(f.documentos || {}).map(([k, v]) => ({
            id: k,
            nombre: k,
            archivo: v.nombre,
          }))}
        />
      )}
    </div>
  );
}
