// ============================================================
// Formulario · paso 7 · Plan de acción y riesgos
// Plan de acción y gestión de riesgos.
// ERS: RF-FOR-22 a RF-FOR-25.
// ============================================================
import { Plus, Trash2 } from "lucide-react";
import { Campo } from "../../../componentes/comunes/Campo.jsx";
import { Bloque, Chk, Sel, Tarjeta, Txt } from "../../../componentes/formulario/campos.jsx";
import { Boton } from "../../../componentes/ui/Boton.jsx";
import { CajaInstrucciones, PreguntaSiNo } from "../../../componentes/ui/Campos.jsx";
import { mesesProyecto } from "../../../reglas/presupuesto.js";
import { uid } from "../../../utilidades/ids.js";
import { textos as T } from "../../../textos/pantallas/formulario/pasos/PasoPlan.js";

export function PasoPlan({ f, b, upd }) {
  const meses = mesesProyecto(f);
  const gente = [...f.equipo.map((p) => p.nombre), ...f.colaboradores.map((c) => c.nombre)].filter(
    (x) => x?.trim(),
  );
  const multi = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  return (
    <div className="stack-xl">
      <CajaInstrucciones title={T.planDeAccionYGestion}>
        {T.cadaActividadSeAsociaA} {meses ? `El proyecto dura ${meses} meses.` : ""}
      </CajaInstrucciones>
      <div className="stack-md">
        {f.plan.map((a, i) => (
          <Tarjeta
            key={a.id}
            titulo={`Actividad ${i + 1}`}
            onQuitar={() => upd((c) => c.plan.splice(i, 1))}
          >
            <div className="form-grid two-col">
              <Sel
                label={T.objetivoEspecifico}
                value={a.objetivoId}
                onChange={(v) => upd((c) => (c.plan[i].objetivoId = v))}
                vacio="Seleccione"
                opciones={f.objetivos.map((o) => [o.id, `${o.id} · ${o.texto.slice(0, 50)}`])}
              />
              <Txt label={T.actividad} {...b(`plan.${i}.actividad`)} />
              <Txt label={T.resultadoEsperado} {...b(`plan.${i}.resultado`)} />
              <Sel
                label={T.responsabilidad}
                value={a.responsabilidad}
                onChange={(v) => upd((c) => (c.plan[i].responsabilidad = v))}
                opciones={["Ejecuta", "Supervisa", "Apoya"]}
              />
              <Txt label={T.mesDeInicio} type="number" min="1" {...b(`plan.${i}.inicio`)} />
              <Txt label={T.duracionEnMeses} type="number" min="1" {...b(`plan.${i}.duracion`)} />
            </div>
            <Campo label={T.participantes}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
                {gente.map((n) => (
                  <Chk
                    key={n}
                    checked={(a.participantes || []).includes(n)}
                    onChange={() =>
                      upd(
                        (c) => (c.plan[i].participantes = multi(c.plan[i].participantes || [], n)),
                      )
                    }
                  >
                    {n}
                  </Chk>
                ))}
              </div>
            </Campo>
            <Chk checked={a.gira} onChange={(v) => upd((c) => (c.plan[i].gira = v))}>
              {T.estaActividadIncluyeGiras}
            </Chk>
            <div className="stack-md" style={{ borderLeft: "3px solid #d9e6f2", paddingLeft: 12 }}>
              <strong style={{ fontSize: 13 }}>{T.riesgosDeLaActividad}</strong>
              {(a.riesgos || []).map((r, k) => (
                <div key={r.id} style={{ display: "grid", gap: 8 }}>
                  <div className="form-grid three-col">
                    <Txt label={T.riesgo} {...b(`plan.${i}.riesgos.${k}.riesgo`)} />
                    <Txt label={T.medidaDeMitigacion} {...b(`plan.${i}.riesgos.${k}.mitigacion`)} />
                    <Txt
                      label={T.responsableDeGestionarlo}
                      {...b(`plan.${i}.riesgos.${k}.responsable`)}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <Chk
                      checked={r.permiso}
                      onChange={(v) => upd((c) => (c.plan[i].riesgos[k].permiso = v))}
                    >
                      {T.esElTramiteDeUn}
                    </Chk>
                    <Boton
                      variant="ghost"
                      icon={Trash2}
                      onClick={() => upd((c) => c.plan[i].riesgos.splice(k, 1))}
                    >
                      {T.quitarRiesgo}
                    </Boton>
                  </div>
                </div>
              ))}
              <div className="action-row">
                <Boton
                  variant="secondary"
                  icon={Plus}
                  onClick={() =>
                    upd(
                      (c) =>
                        (c.plan[i].riesgos = [
                          ...(c.plan[i].riesgos || []),
                          {
                            id: uid("r"),
                            riesgo: "",
                            mitigacion: "",
                            responsable: "",
                            permiso: false,
                          },
                        ]),
                    )
                  }
                >
                  {T.agregarRiesgo}
                </Boton>
              </div>
            </div>
          </Tarjeta>
        ))}
      </div>
      <div className="action-row">
        <Boton
          variant="secondary"
          icon={Plus}
          onClick={() =>
            upd((c) =>
              c.plan.push({
                id: uid("a"),
                objetivoId: "",
                actividad: "",
                resultado: "",
                participantes: [],
                responsabilidad: "Ejecuta",
                inicio: "",
                duracion: "",
                gira: false,
                riesgos: [
                  { id: uid("r"), riesgo: "", mitigacion: "", responsable: "", permiso: false },
                ],
              }),
            )
          }
        >
          {T.agregarActividad}
        </Boton>
      </div>
      <Bloque n="2" titulo={T.giras}>
        <PreguntaSiNo
          number=""
          question="¿Se proyectan giras de trabajo?"
          value={f.giras.proyecta}
          onChange={(v) => upd((c) => (c.giras.proyecta = v))}
        >
          <Txt
            label={T.cantidadDeGirasProyectadas}
            type="number"
            min="1"
            {...b("giras.cantidad")}
            hint={T.elTransporteInstitucionalNoSe}
          />
        </PreguntaSiNo>
      </Bloque>
    </div>
  );
}
