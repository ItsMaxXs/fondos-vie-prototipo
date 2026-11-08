// ============================================================
// Administración · bitácora
// Registro de auditoría de todas las acciones, con filtros y exportación. ERS: CU-18 (RF-ADM-05 a RF-ADM-07).
// ============================================================
import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { Nota } from "../../componentes/comunes/Mensajes.jsx";
import { Txt } from "../../componentes/formulario/campos.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { Tabla } from "../../componentes/ui/Tablas.jsx";
import { useApp } from "../../estado/contexto.js";
import { csv, descargar } from "../../utilidades/archivos.js";
import { fechaHora } from "../../utilidades/fechas.js";
import { textos as T } from "../../textos/pantallas/administracion/AdmBitacora.js";

export function AdmBitacora() {
  const { db } = useApp();
  const [f, setF] = useState({ prop: "", persona: "", accion: "", desde: "", hasta: "" });
  const lista = db.bitacora
    .filter(
      (b_) =>
        (!f.prop || b_.propId.toLowerCase().includes(f.prop.toLowerCase())) &&
        (!f.persona ||
          (b_.usuario + b_.enNombreDe).toLowerCase().includes(f.persona.toLowerCase())) &&
        (!f.accion || b_.accion.toLowerCase().includes(f.accion.toLowerCase())) &&
        (!f.desde || b_.fecha.slice(0, 10) >= f.desde) &&
        (!f.hasta || b_.fecha.slice(0, 10) <= f.hasta),
    )
    .slice()
    .reverse();
  return (
    <div className="stack-lg" style={{ marginTop: 12 }}>
      <Nota>{T.laBitacoraEsDeSolo}</Nota>
      <div className="form-grid" style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}>
        <Txt label={T.propuesta} value={f.prop} onChange={(v) => setF({ ...f, prop: v })} />
        <Txt label={T.persona} value={f.persona} onChange={(v) => setF({ ...f, persona: v })} />
        <Txt label={T.tipoDeAccion} value={f.accion} onChange={(v) => setF({ ...f, accion: v })} />
        <Txt
          label={T.desde}
          type="date"
          value={f.desde}
          onChange={(v) => setF({ ...f, desde: v })}
        />
        <Txt
          label={T.hasta}
          type="date"
          value={f.hasta}
          onChange={(v) => setF({ ...f, hasta: v })}
        />
      </div>
      <div className="action-row end">
        <Boton
          variant="secondary"
          icon={FileSpreadsheet}
          onClick={() =>
            descargar(
              "bitacora.csv",
              csv([
                [
                  "Fecha",
                  "Usuario",
                  "Rol",
                  "En nombre de",
                  "Acción",
                  "Propuesta",
                  "Valor anterior",
                  "Valor nuevo",
                ],
                ...lista.map((b_) => [
                  b_.fecha,
                  b_.usuario,
                  b_.rol,
                  b_.enNombreDe,
                  b_.accion,
                  b_.propId,
                  b_.anterior,
                  b_.nuevo,
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
          { key: "fecha", label: T.fecha, render: (v) => fechaHora(v) },
          {
            key: "usuario",
            label: T.usuario,
            render: (v, b_) => (b_.enNombreDe ? `${v} (en nombre de ${b_.enNombreDe})` : v),
          },
          { key: "accion", label: T.accion },
          { key: "propId", label: T.propuesta },
          { key: "anterior", label: T.anterior },
          { key: "nuevo", label: T.nuevo },
        ]}
        rows={lista.slice(0, 200)}
      />
      {lista.length > 200 && (
        <span style={{ fontSize: 13, opacity: 0.7 }}>{T.seMuestranLos200Registros}</span>
      )}
    </div>
  );
}
