// ============================================================
// Formulario · paso 1 · Datos y preguntas generales
// Identificación del proyecto, preguntas generales y escala de nivel.
// ERS: RF-FOR-07, RF-FOR-08, RF-FOR-10, RF-FOR-33, RF-FOR-34.
// ============================================================
import { Campo } from "../../../componentes/comunes/Campo.jsx";
import { Area, Bloque, Chk, Sel, Txt } from "../../../componentes/formulario/campos.jsx";
import { CajaInstrucciones, PreguntaSiNo } from "../../../componentes/ui/Campos.jsx";
import { MODALIDADES } from "../../../datos/modalidades.js";
import { mesesProyecto } from "../../../reglas/presupuesto.js";
import { colones } from "../../../utilidades/formato.js";
import { textos as T } from "../../../textos/pantallas/formulario/pasos/Paso1.js";

// ---------- Pasos ----------
export function Paso1({ f, b, upd, db, params, esFort_ }) {
  const otras = db.instancias.filter((i) => i.id !== f.instancia);
  const multi = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const Q = (n, key, texto, hijos) => (
    <PreguntaSiNo
      number={n}
      question={texto}
      value={f.q[key].r}
      onChange={(v) => upd((c) => (c.q[key].r = v))}
    >
      {hijos}
    </PreguntaSiNo>
  );
  return (
    <div className="stack-xl">
      <CajaInstrucciones title={T.identificacionYPreguntasGenerales}>
        {T.respondaTodasLasPreguntasLos}
      </CajaInstrucciones>
      <Bloque n="1" titulo={T.identificacionDelProyecto}>
        <div className="form-grid two-col">
          <Sel
            label={T.modalidad}
            value={f.modalidad}
            onChange={(v) => upd((c) => (c.modalidad = v))}
            opciones={MODALIDADES}
            hint={`Monto máximo ${colones(params.montoMax[f.modalidad])}${esFort_ ? " en total" : " por año"} · duración máxima ${params.duracionMaxAnios[f.modalidad]} ${params.duracionMaxAnios[f.modalidad] === 1 ? "año" : "años"}`}
          />
          <Sel
            label={T.instanciaAcademicaCoordinadora}
            value={f.instancia}
            onChange={(v) => upd((c) => (c.instancia = v))}
            opciones={db.instancias.map((i) => [i.id, i.nombre])}
          />
        </div>
        <Txt label={T.nombreDelProyecto} {...b("titulo")} />
        <div className="form-grid two-col">
          <Txt label={T.fechaDeInicio} type="date" {...b("inicio")} />
          <Txt
            label={T.fechaDeFinalizacion}
            type="date"
            {...b("fin")}
            hint={
              f.inicio && f.fin
                ? `Duración: ${mesesProyecto(f)} meses`
                : T.noSeAdmitenAmpliacionesDe
            }
          />
        </div>
        <Campo
          label={T.instanciasAcademicasParticipantes}
          hint={T.cadaInstanciaParticipanteDebeAvalar}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
            {otras.map((i) => (
              <Chk
                key={i.id}
                checked={f.participantes.includes(i.id)}
                onChange={() => upd((c) => (c.participantes = multi(c.participantes, i.id)))}
              >
                {i.nombre}
              </Chk>
            ))}
          </div>
        </Campo>
        <Txt label={T.lineaDeInvestigacion} {...b("linea")} />
        <Campo label={T.objetivosDeDesarrolloSostenibleQue}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
            {db.catalogos.odsLista.map((o) => (
              <Chk
                key={o}
                checked={f.ods.includes(o)}
                onChange={() => upd((c) => (c.ods = multi(c.ods, o)))}
              >
                {o}
              </Chk>
            ))}
          </div>
        </Campo>
        {!esFort_ && (
          <div className="form-grid two-col">
            <Sel
              label={T.trlInicial}
              value={f.trlInicial}
              onChange={(v) => upd((c) => (c.trlInicial = v))}
              vacio="Seleccione"
              opciones={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(String)}
              hint={
                params.trl[f.modalidad]
                  ? `Rango de ${f.modalidad}: TRL ${params.trl[f.modalidad][0]} a ${params.trl[f.modalidad][1]}`
                  : ""
              }
            />
            <Sel
              label={T.trlEsperadoAlFinalizar}
              value={f.trlFinal}
              onChange={(v) => upd((c) => (c.trlFinal = v))}
              vacio="Seleccione"
              opciones={[1, 2, 3, 4, 5, 6, 7, 8, 9].map(String)}
            />
          </div>
        )}
      </Bloque>
      <Bloque n="2" titulo={T.preguntasGenerales}>
        <div className="stack-lg">
          {Q(
            1,
            "fuentes",
            "¿La iniciativa fue presentada, o está aprobada, en convocatorias de fuentes externas de financiamiento?",
            <Area label={T.entidadEstadoDeLaGestion} rows={3} {...b("q.fuentes.detalle")} />,
          )}
          {Q(
            2,
            "continuidad",
            "¿Es continuidad de otro proyecto o está relacionada con uno existente?",
            <div className="form-grid two-col">
              <Txt label={T.proyectoRelacionado} {...b("q.continuidad.proyecto")} />
              <Sel
                label={T.tipoDeRelacion}
                value={f.q.continuidad.tipo}
                onChange={(v) => upd((c) => (c.q.continuidad.tipo = v))}
                vacio="Seleccione"
                opciones={["Continuidad", "Complemento", "Escalamiento"]}
              />
            </div>,
          )}
          {Q(
            3,
            "prioridad",
            "¿Atiende un problema prioritario definido en un documento oficial de referencia?",
            <Area
              label={T.problemaYDocumentoDeReferencia}
              rows={3}
              {...b("q.prioridad.detalle")}
            />,
          )}
          {Q(
            4,
            "instrumento",
            "¿Se vincula con un convenio o instrumento de cooperación vigente?",
            <Sel
              label={T.ambitoDelInstrumento}
              value={f.q.instrumento.ambito}
              onChange={(v) => upd((c) => (c.q.instrumento.ambito = v))}
              opciones={["Convenio Nacional", "Convenio Internacional", "Carta de entendimiento"]}
            />,
          )}
          {Q(
            5,
            "convenioMarco",
            "¿Se desarrolla en el marco de un convenio marco?",
            <Txt label={T.nombreCompletoDelConvenio} {...b("q.convenioMarco.nombre")} />,
          )}
          {Q(
            6,
            "grado",
            "¿Incluye trabajo final de graduación o tesis de posgrado?",
            <div className="form-grid three-col">
              <Txt label={T.personaCandidata} {...b("q.grado.candidato")} />
              <Txt label={T.programa} {...b("q.grado.programa")} />
              <Txt label={T.universidad} {...b("q.grado.universidad")} />
            </div>,
          )}
          {Q(
            7,
            "confidencial",
            "¿Trabaja con información confidencial o con restricciones de acceso?",
            <Area label={T.tipoDeInformacionYFuente} rows={3} {...b("q.confidencial.detalle")} />,
          )}
          {Q(
            8,
            "pi",
            "¿Los resultados podrían generar activos de propiedad intelectual?",
            <Area
              label={T.descripcionPreliminarDeLosPosibles}
              rows={3}
              {...b("q.pi.descripcion")}
              hint={T.siRespondeSiLaPropuesta}
            />,
          )}
          {Q(
            9,
            "innovacion",
            "¿Genera innovación en producto, proceso o servicio?",
            <Sel
              label={T.tipoDeInnovacion}
              value={f.q.innovacion.tipo}
              onChange={(v) => upd((c) => (c.q.innovacion.tipo = v))}
              opciones={["Producto", "Proceso", "Servicio", "Organizacional"]}
            />,
          )}
          {Q(10, "remunerada", "¿Es una iniciativa de vinculación remunerada externa?", null)}
        </div>
      </Bloque>
    </div>
  );
}
