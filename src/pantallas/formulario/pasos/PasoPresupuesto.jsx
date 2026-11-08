// ============================================================
// Formulario · paso 8 · Presupuesto y financiamiento
// Cuadro de presupuesto por año y financiamiento externo.
// ERS: RF-FOR-26 a RF-FOR-32, RF-FOR-48 a RF-FOR-50.
// ============================================================
import { useState } from "react";
import { Plus } from "lucide-react";
import { Pestanas } from "../../../componentes/comunes/Pestanas.jsx";
import { Area, Bloque, Sel, Tarjeta, Txt } from "../../../componentes/formulario/campos.jsx";
import { Boton } from "../../../componentes/ui/Boton.jsx";
import { CajaInstrucciones } from "../../../componentes/ui/Campos.jsx";
import { Tabla } from "../../../componentes/ui/Tablas.jsx";
import { aniosDe, costoBeca, presupuestoPorAnio } from "../../../reglas/presupuesto.js";
import { colones } from "../../../utilidades/formato.js";
import { uid } from "../../../utilidades/ids.js";
import { textos as T } from "../../../textos/pantallas/formulario/pasos/PasoPresupuesto.js";

export function PasoPresupuesto({ f, b, upd, db, params, esFort_ }) {
  const anios = aniosDe(f);
  const [anio, setAnio] = useState(1);
  const a = Math.min(anio, anios);
  const filas = presupuestoPorAnio(f, params);
  const total = filas.reduce((s, x) => s + x.total, 0);
  const objetos = db.catalogos.objetosGasto;
  const lineasAnio = f.presupuesto
    .map((l, idx) => ({ l, idx }))
    .filter((x) => Number(x.l.anio) === a);
  const becasAnio = f.becas.map((l, idx) => ({ l, idx })).filter((x) => Number(x.l.anio) === a);
  return (
    <div className="stack-xl">
      <CajaInstrucciones title={T.presupuestoYFinanciamiento}>
        {T.montoMaximo} {colones(params.montoMax[f.modalidad])} {esFort_ ? T.enTotal : T.porAno}
        {T.losServiciosProfesionalesExternosNo} {params.serviciosProfPct}{" "}
        {T.delPresupuestoOperativoYLos} {params.becasHorasMin} {T.horasSemanalesDeBecasDe}
      </CajaInstrucciones>
      <Pestanas
        valor={String(a)}
        onChange={(v) => setAnio(Number(v))}
        items={Array.from({ length: anios }, (_, i) => [String(i + 1), `Año ${i + 1}`])}
      />
      <div className="stack-md">
        <strong>
          {T.requerimientosDelAno} {a}
        </strong>
        {lineasAnio.map(({ l, idx }) => (
          <Tarjeta
            key={l.id}
            titulo={l.detalle || T.nuevoRequerimiento}
            onQuitar={() => upd((c) => c.presupuesto.splice(idx, 1))}
          >
            <div className="form-grid two-col">
              <Sel
                label={T.objetoDeGasto}
                value={l.codigo}
                onChange={(v) =>
                  upd((c) => {
                    const o = objetos.find((x) => x[0] === v);
                    Object.assign(c.presupuesto[idx], {
                      codigo: v,
                      detalle: o ? o[1] : "",
                      tipo: o ? o[2] : "O",
                    });
                  })
                }
                vacio="Seleccione"
                opciones={objetos.map((o) => [o[0], `${o[0]} · ${o[1]}`])}
              />
              <Txt
                label={T.montoSolicitado}
                type="number"
                min="0"
                {...b(`presupuesto.${idx}.monto`)}
              />
            </div>
            <Area label={T.justificacion} rows={2} {...b(`presupuesto.${idx}.justificacion`)} />
            {l.tipo === "S" && (
              <Txt label={T.perfilDeLaPersonaPor} {...b(`presupuesto.${idx}.perfil`)} />
            )}
            <span style={{ fontSize: 12.5, opacity: 0.7 }}>
              {T.clasificacion}{" "}
              {l.tipo === "S"
                ? T.servicioProfesionalExterno
                : l.tipo === "D"
                  ? T.bienDuradero
                  : l.tipo === "X"
                    ? T.noPresupuestable
                    : T.gastoOperativo}
            </span>
          </Tarjeta>
        ))}
        <div className="action-row">
          <Boton
            variant="secondary"
            icon={Plus}
            onClick={() =>
              upd((c) =>
                c.presupuesto.push({
                  id: uid("p"),
                  anio: a,
                  codigo: "",
                  detalle: "",
                  tipo: "O",
                  monto: "",
                  justificacion: "",
                }),
              )
            }
          >
            {T.agregarRequerimiento}
          </Boton>
        </div>
      </div>
      {!esFort_ && (
        <div className="stack-md">
          <strong>
            {T.becasDeEstudianteAsistenteEspecial} {a}
          </strong>
          {becasAnio.map(({ l, idx }) => (
            <Tarjeta
              key={idx}
              titulo={`Beca · costo ${colones(costoBeca(l, params))}`}
              onQuitar={() => upd((c) => c.becas.splice(idx, 1))}
            >
              <div className="form-grid two-col">
                <Txt
                  label={T.horasSemanales}
                  type="number"
                  min="0"
                  {...b(`becas.${idx}.horasSemana`)}
                />
                <Txt
                  label={T.mesesDeNombramiento}
                  type="number"
                  min="1"
                  {...b(`becas.${idx}.meses`)}
                  hint={`Máximo ${params.mesesBecaMax} meses por año (RN-31). Valor hora ${colones(params.valorHoraBeca)}.`}
                />
              </div>
            </Tarjeta>
          ))}
          <div className="action-row">
            <Boton
              variant="secondary"
              icon={Plus}
              onClick={() => upd((c) => c.becas.push({ anio: a, horasSemana: "", meses: "" }))}
            >
              {T.agregarBeca}
            </Boton>
          </div>
        </div>
      )}
      <Bloque n="2" titulo={T.resumenPorAno}>
        <Tabla
          columns={[
            { key: "anio", label: T.ano, render: (v) => `Año ${v}` },
            { key: "operativo", label: T.operativoConBecas, render: (v) => colones(v) },
            { key: "servicios", label: T.serviciosProf, render: (v) => colones(v) },
            { key: "duraderos", label: T.bienesDuraderos, render: (v) => colones(v) },
            { key: "horasBeca", label: T.horasBeca },
            { key: "total", label: T.total, render: (v) => <strong>{colones(v)}</strong> },
          ]}
          rows={filas.map((x) => ({ ...x, id: x.anio }))}
        />
        <p style={{ margin: "8px 0 0", fontSize: 14 }}>
          {T.totalSolicitadoALaVie} <strong>{colones(total)}</strong>
        </p>
      </Bloque>
      <Bloque n="3" titulo={T.otrasFuentesDeFinanciamiento}>
        <div className="stack-md">
          {f.financiamiento.map((r, i) => (
            <Tarjeta key={r.tipo} titulo={r.tipo}>
              <div className="form-grid three-col">
                <Txt label={T.ano1} type="number" min="0" {...b(`financiamiento.${i}.anio1`)} />
                <Txt label={T.ano2} type="number" min="0" {...b(`financiamiento.${i}.anio2`)} />
                <Txt label={T.ano3} type="number" min="0" {...b(`financiamiento.${i}.anio3`)} />
                <Txt label={T.numeroDeOficio} {...b(`financiamiento.${i}.oficio`)} />
                <Txt label={T.entidadEmisora} {...b(`financiamiento.${i}.entidad`)} />
              </div>
            </Tarjeta>
          ))}
        </div>
      </Bloque>
    </div>
  );
}
