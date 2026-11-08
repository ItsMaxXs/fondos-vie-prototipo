// ============================================================
// Administración · instancias
// Escuelas y centros, con sus horas. ERS: RF-USR-10.
// ============================================================
import { useState } from "react";
import { PencilLine, Plus } from "lucide-react";
import { Sel, Txt } from "../../componentes/formulario/campos.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { Tabla } from "../../componentes/ui/Tablas.jsx";
import { Ventana } from "../../componentes/ui/Ventanas.jsx";
import { useApp } from "../../estado/contexto.js";
import { num } from "../../utilidades/formato.js";
import { textos as T } from "../../textos/pantallas/administracion/AdmInstancias.js";

export function AdmInstancias() {
  const { db, act } = useApp();
  const [ed, setEd] = useState(null);
  return (
    <div className="stack-lg" style={{ marginTop: 12 }}>
      <div className="action-row">
        <Boton
          icon={Plus}
          onClick={() =>
            setEd({
              id: "",
              nombre: "",
              tipo: "Escuela",
              horasVIE: 0,
              horasVIECentros: 0,
              nueva: true,
            })
          }
        >
          {T.nuevaInstancia}
        </Boton>
      </div>
      <Tabla
        columns={[
          { key: "id", label: T.codigo },
          { key: "nombre", label: T.nombre },
          { key: "tipo", label: T.tipo },
          { key: "horasVIE", label: T.horasVie },
          { key: "horasVIECentros", label: T.horasVieCentros },
          {
            key: "x",
            label: "",
            render: (_, i) => (
              <Boton variant="ghost" icon={PencilLine} onClick={() => setEd({ ...i })}>
                {T.editar}
              </Boton>
            ),
          },
        ]}
        rows={db.instancias}
      />
      <Ventana
        open={!!ed}
        onClose={() => setEd(null)}
        title={T.instanciaAcademica}
        footer={
          <>
            <Boton variant="secondary" onClick={() => setEd(null)}>
              {T.cancelar}
            </Boton>
            <Boton
              onClick={() => {
                if (!ed.id.trim() || !ed.nombre.trim()) return;
                const { nueva, ...inst } = ed;
                const r = act("guardarInstancia", {
                  instancia: {
                    ...inst,
                    horasVIE: num(inst.horasVIE),
                    horasVIECentros: num(inst.horasVIECentros),
                  },
                });
                if (r.ok) setEd(null);
              }}
            >
              {T.guardar}
            </Boton>
          </>
        }
      >
        {ed && (
          <div className="form-grid two-col">
            <Txt
              label={T.codigo}
              value={ed.id}
              disabled={!ed.nueva}
              onChange={(v) => setEd({ ...ed, id: v.toUpperCase() })}
            />
            <Txt label={T.nombre} value={ed.nombre} onChange={(v) => setEd({ ...ed, nombre: v })} />
            <Sel
              label={T.tipo}
              value={ed.tipo}
              onChange={(v) => setEd({ ...ed, tipo: v })}
              opciones={["Escuela", "Centro", "Departamento"]}
            />
            <Txt
              label={T.horasVieAsignadas}
              type="number"
              value={ed.horasVIE}
              onChange={(v) => setEd({ ...ed, horasVIE: v })}
            />
            <Txt
              label={T.horasVieCentrosAsignadas}
              type="number"
              value={ed.horasVIECentros}
              onChange={(v) => setEd({ ...ed, horasVIECentros: v })}
            />
          </div>
        )}
      </Ventana>
    </div>
  );
}
