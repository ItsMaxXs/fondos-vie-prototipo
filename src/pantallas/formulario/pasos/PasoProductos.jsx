// ============================================================
// Formulario · paso 9 · Compromisos de productos
// Productos comprometidos y su peso.
// ERS: RF-FOR-18 a RF-FOR-20.
// ============================================================
import { Plus } from "lucide-react";
import { Bloque, Sel, Tarjeta } from "../../../componentes/formulario/campos.jsx";
import { Boton } from "../../../componentes/ui/Boton.jsx";
import { CajaInstrucciones } from "../../../componentes/ui/Campos.jsx";
import { resumenProductos } from "../../../reglas/evaluacion.js";
import { textos as T } from "../../../textos/pantallas/formulario/pasos/PasoProductos.js";

export function PasoProductos({ f, b, upd, db, params, esFort_, esDT_ }) {
  const cat = esFort_
    ? db.catalogos.productosFortalecimiento
    : esDT_
      ? db.catalogos.productosAcademicosDT
      : db.catalogos.productosAcademicos;
  const r = resumenProductos(f, params);
  return (
    <div className="stack-xl">
      <CajaInstrucciones title={T.compromisosDeProductos}>
        {T.seExigeAlMenosUn} {params.horasPorProducto} {T.horasSemanalesDelEquipoRedondeado}{" "}
        {r.horas} {T.horasSeNecesitan} {r.minimo} {r.minimo === 1 ? T.producto : T.productos}
        {T.hay} {r.comprometidos} {T.comprometidos}
      </CajaInstrucciones>
      <div className="stack-md">
        {f.productos.map((p, i) => (
          <Tarjeta
            key={i}
            titulo={`Producto ${i + 1}`}
            onQuitar={() => upd((c) => c.productos.splice(i, 1))}
          >
            <div className="form-grid two-col">
              <Sel
                label={T.tipoDeProducto}
                value={p.tipo}
                onChange={(v) =>
                  upd((c) => {
                    const o = cat.find((x) => x[0] === v);
                    Object.assign(c.productos[i], {
                      tipo: v,
                      cuenta: o ? o[1] : 1,
                      academico: !esFort_,
                    });
                  })
                }
                vacio="Seleccione"
                opciones={cat.map((x) => x[0])}
              />
              <Sel
                label={T.objetivoEspecificoAsociado}
                value={p.objetivoId}
                onChange={(v) => upd((c) => (c.productos[i].objetivoId = v))}
                vacio="Seleccione"
                opciones={f.objetivos.map((o) => [o.id, `${o.id} · ${o.texto.slice(0, 50)}`])}
              />
            </div>
            <span style={{ fontSize: 12.5, opacity: 0.7 }}>
              {T.cuentaComo} {p.cuenta || 1} {(p.cuenta || 1) === 1 ? T.producto : T.productos}.
            </span>
          </Tarjeta>
        ))}
      </div>
      <div className="action-row">
        <Boton
          variant="secondary"
          icon={Plus}
          onClick={() =>
            upd((c) =>
              c.productos.push({ tipo: "", cuenta: 1, objetivoId: "", academico: !esFort_ }),
            )
          }
        >
          {T.agregarProducto}
        </Boton>
      </div>
      {(esDT_ || f.q.pi.r === "Sí") && (
        <Bloque n="2" titulo={T.activosDePropiedadIntelectualE}>
          <div className="stack-md">
            {f.activosPI.map((a, i) => (
              <Tarjeta
                key={i}
                titulo={`Activo ${i + 1}`}
                onQuitar={() => upd((c) => c.activosPI.splice(i, 1))}
              >
                <Sel
                  label={T.tipoDeActivo}
                  value={a.tipo}
                  onChange={(v) => upd((c) => (c.activosPI[i].tipo = v))}
                  vacio="Seleccione"
                  opciones={db.catalogos.activosPI}
                  hint={
                    a.consecutivo
                      ? `Consecutivo del dictamen: ${a.consecutivo}`
                      : T.elCentroDeVinculacionAsigna
                  }
                />
              </Tarjeta>
            ))}
          </div>
          <div className="action-row">
            <Boton
              variant="secondary"
              icon={Plus}
              onClick={() => upd((c) => c.activosPI.push({ tipo: "", consecutivo: "" }))}
            >
              {T.agregarActivo}
            </Boton>
          </div>
        </Bloque>
      )}
    </div>
  );
}
