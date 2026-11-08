// ============================================================
// Administración · parámetros
// Edición de los parámetros normativos de la convocatoria. ERS: CU-03 (RF-CON-06, RF-CON-11).
// ============================================================
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Bloque, Chk, Sel, Txt } from "../../componentes/formulario/campos.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { Entrada } from "../../componentes/ui/Campos.jsx";
import { Tabla } from "../../componentes/ui/Tablas.jsx";
import { MODALIDADES } from "../../datos/modalidades.js";
import { useApp } from "../../estado/contexto.js";
import { paramsDe } from "../../reglas/consultas.js";
import { num } from "../../utilidades/formato.js";
import { clone } from "../../utilidades/ids.js";
import { textos as T } from "../../textos/pantallas/administracion/AdmParametros.js";

export function AdmParametros() {
  const { db, act } = useApp();
  const [conv, setConv] = useState(db.convocatorias[0].id);
  const [p, setP] = useState(clone(paramsDe(db, db.convocatorias[0].id)));
  useEffect(() => setP(clone(paramsDe(db, conv))), [conv]);
  const n = (k) => ({ value: p[k], onChange: (v) => setP({ ...p, [k]: num(v) }), type: "number" });
  return (
    <div className="stack-lg" style={{ marginTop: 12 }}>
      <Sel
        label={T.convocatoria}
        value={conv}
        onChange={setConv}
        opciones={db.convocatorias.map((c) => [c.id, c.nombre])}
      />
      <Bloque n="1" titulo={T.montosMaximosYDuracionPor}>
        <Tabla
          columns={[
            { key: "id", label: T.modalidad },
            {
              key: "m",
              label: T.montoMaximo,
              render: (_, r) => (
                <Entrada
                  type="number"
                  value={p.montoMax[r.id]}
                  onChange={(e) =>
                    setP({ ...p, montoMax: { ...p.montoMax, [r.id]: num(e.target.value) } })
                  }
                />
              ),
            },
            {
              key: "d",
              label: T.duracionMaximaAnos,
              render: (_, r) => (
                <Entrada
                  type="number"
                  value={p.duracionMaxAnios[r.id]}
                  onChange={(e) =>
                    setP({
                      ...p,
                      duracionMaxAnios: { ...p.duracionMaxAnios, [r.id]: num(e.target.value) },
                    })
                  }
                />
              ),
            },
          ]}
          rows={MODALIDADES.map((m) => ({ id: m }))}
        />
      </Bloque>
      <Bloque n="2" titulo={T.horasBecasYProductos}>
        <div className="form-grid three-col">
          <Txt label={T.horasMinimasPorPersona} {...n("horasMinPersona")} />
          <Txt label={T.horasMinimasPorPersonaRec} {...n("horasMinPersonaREC")} />
          <Txt label={T.horasMinimasDelProyecto} {...n("horasMinProyecto")} />
          <Txt label={T.horasMaximasDeFortalecimiento} {...n("horasMaxFortalecimiento")} />
          <Txt label={T.horasVieMinimasDeFortalecimiento} {...n("horasMinFortVIE")} />
          <Txt label={T.horasPorProductoComprometido} {...n("horasPorProducto")} />
          <Txt label={T.horasSemanalesMinimasDeBecas} {...n("becasHorasMin")} />
          <Txt label={T.valorDeLaHoraBeca} {...n("valorHoraBeca")} />
          <Txt label={T.mesesMaximosDeBecaPor} {...n("mesesBecaMax")} />
          <Txt label={T.serviciosProfesionalesMaximoDelOperativo} {...n("serviciosProfPct")} />
          <Txt label={T.referenciasMinimas} {...n("refsMin")} />
          <Txt label={T.palabrasMaximasDelResumen} {...n("resumenMaxPalabras")} />
        </div>
      </Bloque>
      <Bloque n="3" titulo={T.evaluacionConsejoYAvisos}>
        <div className="form-grid three-col">
          <Txt label={T.umbralDeRecomendacionDelComite} {...n("umbralComite")} />
          <Txt label={T.diferenciaMaximaEntreNotasPuntos} {...n("difMaxNotas")} />
          <Sel
            label={T.politicaConPersonasConInformes}
            value={p.politicaMorosidad}
            onChange={(v) => setP({ ...p, politicaMorosidad: v })}
            opciones={[
              ["advertir", "Advertir y dejar observación"],
              ["bloquear", "Bloquear el envío"],
            ]}
          />
          <Txt
            label={T.recordatoriosDiasAntesSeparadosPor}
            value={(p.recordatorios || []).join(", ")}
            onChange={(v) =>
              setP({
                ...p,
                recordatorios: v
                  .split(",")
                  .map((x) => num(x))
                  .filter(Boolean),
              })
            }
          />
          <Txt label={T.fondoDisponible} {...n("fondoDisponible")} />
          <Txt label={T.horasDisponibles} {...n("horasDisponibles")} />
        </div>
        <Chk
          checked={p.votoDobleDePresidencia}
          onChange={(v) => setP({ ...p, votoDobleDePresidencia: v })}
        >
          {T.laPresidenciaDelConsejoTiene}
        </Chk>
      </Bloque>
      <div className="action-row end">
        <Boton icon={Save} onClick={() => act("guardarParametros", { convId: conv, params: p })}>
          {T.guardarParametros}
        </Boton>
      </div>
    </div>
  );
}
