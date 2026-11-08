// ============================================================
// Administración · correos simulados
// Bandeja de los correos que el sistema "envía". ERS: RF-NOT-01 a RF-NOT-05.
// ============================================================
import { Nota } from "../../componentes/comunes/Mensajes.jsx";
import { Tabla } from "../../componentes/ui/Tablas.jsx";
import { useApp } from "../../estado/contexto.js";
import { fechaHora } from "../../utilidades/fechas.js";
import { textos as T } from "../../textos/pantallas/administracion/AdmCorreos.js";

export function AdmCorreos() {
  const { db } = useApp();
  return (
    <div className="stack-lg" style={{ marginTop: 12 }}>
      <Nota>{T.registroDeLosCorreosQue}</Nota>
      <Tabla
        columns={[
          { key: "fecha", label: T.fecha, render: (v) => fechaHora(v) },
          { key: "para", label: T.para },
          { key: "asunto", label: T.asunto },
          { key: "resultado", label: T.resultado },
        ]}
        rows={db.correos.slice(0, 150)}
      />
    </div>
  );
}
