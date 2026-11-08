// ============================================================
// Formulario · paso 3 · Equipo de investigación
// Personas del equipo, horas y verificación de informes pendientes.
// ERS: RF-FOR-11 a RF-FOR-17, RF-FOR-51, RF-MOR-02.
// ============================================================
import { Plus } from "lucide-react";
import { Nota } from "../../../componentes/comunes/Mensajes.jsx";
import { Area, Bloque, Chk, Sel, Tarjeta, Txt } from "../../../componentes/formulario/campos.jsx";
import { Boton } from "../../../componentes/ui/Boton.jsx";
import { Estadistica } from "../../../componentes/ui/Caja.jsx";
import { CajaInstrucciones, PreguntaSiNo, Selector } from "../../../componentes/ui/Campos.jsx";
import { TIPOS_HORA } from "../../../datos/parametros.js";
import { nombreInstancia } from "../../../reglas/alcance.js";
import { buscarMoroso } from "../../../reglas/morosidad.js";
import { num } from "../../../utilidades/formato.js";
import { uid } from "../../../utilidades/ids.js";
import { textos as T } from "../../../textos/pantallas/formulario/pasos/Paso3.js";

export function Paso3({ f, b, upd, db, params, esFort_, usuario }) {
  const horasVIE = f.equipo
    .filter((p) => ["VIE", "VIE-Centros", "CONS"].includes(p.tipoHora))
    .reduce((s, p) => s + num(p.horas), 0);
  const horasTot = f.equipo.reduce((s, p) => s + num(p.horas), 0);
  const directorio = db.users.filter(
    (u) =>
      u.estado === "Activo" &&
      u.roles.some((r) => r.rol === "investigador" || r.rol === "comite_evaluador"),
  );
  const agregar = (userId) => {
    const u = db.users.find((x) => x.id === userId);
    upd((c) =>
      c.equipo.push({
        id: uid("m"),
        nombre: u ? u.nombre : "",
        cedula: u?.cedula || "",
        orcid: u?.orcid || "",
        instancia: u?.instancia || f.instancia,
        rol: "Investigación",
        horas: "",
        tipoHora: "VIE",
        titularCons: "",
        periodo: "",
        esApoyo: false,
        avalApoyo: false,
      }),
    );
  };
  return (
    <div className="stack-xl">
      <CajaInstrucciones title={T.equipoDeInvestigacion}>
        {T.cadaPersonaNecesitaDedicacionMinima} {params.horasMinPersona} {T.horasSemanales}
        {params.horasMinPersonaREC} {T.siSonHorasRec}{" "}
        {esFort_
          ? `La actividad de fortalecimiento admite como máximo ${params.horasMaxFortalecimiento} horas semanales en total.`
          : `El proyecto requiere al menos ${params.horasMinProyecto} horas semanales VIE, VIE-Centros o CONS.`}
      </CajaInstrucciones>
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <Estadistica label={T.horasSemanalesTotales} value={horasTot} />
        <Estadistica
          label={T.horasVieVieCentrosY}
          value={horasVIE}
          hint={esFort_ ? `Mínimo ${params.horasMinFortVIE}` : `Mínimo ${params.horasMinProyecto}`}
        />
        <Estadistica label={T.personasEnElEquipo} value={f.equipo.length} />
      </div>
      <div className="stack-md">
        {f.equipo.map((p, i) => {
          const mor = buscarMoroso(db, p);
          return (
            <Tarjeta
              key={p.id}
              titulo={`${i + 1}. ${p.nombre || "Nueva persona"}${i === 0 ? " · persona coordinadora" : ""}`}
              onQuitar={i > 0 ? () => upd((c) => c.equipo.splice(i, 1)) : null}
            >
              {mor && (
                <Nota tipo="aviso">
                  {T.estaPersonaFiguraConInformes} {mor.detalle}
                  {T.soloPuedenParticiparPersonasAl}
                </Nota>
              )}
              <div className="form-grid three-col">
                <Txt label={T.nombreCompleto} {...b(`equipo.${i}.nombre`)} />
                <Txt label={T.cedula} {...b(`equipo.${i}.cedula`)} />
                <Txt label={T.orcid} {...b(`equipo.${i}.orcid`)} />
                <Sel
                  label={T.instancia}
                  value={p.instancia}
                  onChange={(v) => upd((c) => (c.equipo[i].instancia = v))}
                  opciones={db.instancias.map((x) => [x.id, x.nombre])}
                />
                <Sel
                  label={T.rolEnElProyecto}
                  value={p.rol}
                  onChange={(v) => upd((c) => (c.equipo[i].rol = v))}
                  opciones={[
                    "Coordinación",
                    "Investigación",
                    "Estudiante asistente",
                    "Personal de apoyo",
                  ]}
                />
                <Txt label={T.horasSemanales2} type="number" min="0" {...b(`equipo.${i}.horas`)} />
                <Sel
                  label={T.tipoDeHora}
                  value={p.tipoHora}
                  onChange={(v) => upd((c) => (c.equipo[i].tipoHora = v))}
                  opciones={TIPOS_HORA}
                />
                {p.tipoHora === "CONS" ? (
                  <Txt label={T.personaConsolidadaTitular} {...b(`equipo.${i}.titularCons`)} />
                ) : (
                  <div />
                )}
                <Txt
                  label={T.periodoDeNombramiento}
                  placeholder={T.ene2027Jun2028}
                  {...b(`equipo.${i}.periodo`)}
                />
              </div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <Chk checked={p.esApoyo} onChange={(v) => upd((c) => (c.equipo[i].esApoyo = v))}>
                  {T.personalDeApoyoHorasRec} {params.horasApoyoREC[0]} a {params.horasApoyoREC[1]}{" "}
                  {T.porSemana}
                </Chk>
                {p.esApoyo && (
                  <Chk
                    checked={p.avalApoyo}
                    onChange={(v) => upd((c) => (c.equipo[i].avalApoyo = v))}
                  >
                    {T.cuentaConElAvalEscrito}
                  </Chk>
                )}
              </div>
            </Tarjeta>
          );
        })}
      </div>
      <div className="action-row">
        <Selector
          value=""
          onChange={(e) =>
            e.target.value && agregar(e.target.value === "__nuevo" ? "" : e.target.value)
          }
          className="input"
          style={{ maxWidth: 360 }}
        >
          <option value="">{T.agregarPersonaDesdeElDirectorio}</option>
          <option value="__nuevo">{T.personaNuevaEscribirLosDatos}</option>
          {directorio.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre} · {nombreInstancia(db, u.instancia)}
            </option>
          ))}
        </Selector>
      </div>
      <Bloque n="2" titulo={T.colaboradoresExternos}>
        <div className="stack-md">
          {f.colaboradores.map((c_, i) => (
            <Tarjeta
              key={c_.id}
              titulo={`Colaborador ${i + 1}`}
              onQuitar={() => upd((c) => c.colaboradores.splice(i, 1))}
            >
              <div className="form-grid three-col">
                <Txt label={T.nombre} {...b(`colaboradores.${i}.nombre`)} />
                <Txt label={T.orcid} {...b(`colaboradores.${i}.orcid`)} />
                <Txt label={T.institucion} {...b(`colaboradores.${i}.institucion`)} />
              </div>
              <Chk checked={c_.carta} onChange={(v) => upd((c) => (c.colaboradores[i].carta = v))}>
                {T.seAdjuntaLaCartaDe}
              </Chk>
            </Tarjeta>
          ))}
        </div>
        <div className="action-row">
          <Boton
            variant="secondary"
            icon={Plus}
            onClick={() =>
              upd((c) =>
                c.colaboradores.push({
                  id: uid("c"),
                  nombre: "",
                  orcid: "",
                  institucion: "",
                  carta: false,
                }),
              )
            }
          >
            {T.agregarColaborador}
          </Boton>
        </div>
      </Bloque>
      <Bloque n="3" titulo={T.sectorSocioproductivo}>
        <PreguntaSiNo
          number=""
          question="¿Participan organizaciones del sector socioproductivo?"
          value={f.sectorSocio.participa}
          onChange={(v) => upd((c) => (c.sectorSocio.participa = v))}
        >
          <div className="stack-md">
            {f.sectorSocio.orgs.map((o, i) => (
              <Tarjeta
                key={o.id}
                titulo={`Organización ${i + 1}`}
                onQuitar={() => upd((c) => c.sectorSocio.orgs.splice(i, 1))}
              >
                <Txt label={T.nombreDeLaOrganizacion} {...b(`sectorSocio.orgs.${i}.nombre`)} />
                <Area
                  label={T.alcanceDeSuParticipacion}
                  rows={3}
                  {...b(`sectorSocio.orgs.${i}.alcance`)}
                />
                <Chk
                  checked={o.carta}
                  onChange={(v) => upd((c) => (c.sectorSocio.orgs[i].carta = v))}
                >
                  {T.seAdjuntaLaCartaDe2}
                </Chk>
              </Tarjeta>
            ))}
            <div className="action-row">
              <Boton
                variant="secondary"
                icon={Plus}
                onClick={() =>
                  upd((c) =>
                    c.sectorSocio.orgs.push({
                      id: uid("o"),
                      nombre: "",
                      alcance: "",
                      carta: false,
                    }),
                  )
                }
              >
                {T.agregarOrganizacion}
              </Boton>
            </div>
          </div>
        </PreguntaSiNo>
      </Bloque>
    </div>
  );
}
