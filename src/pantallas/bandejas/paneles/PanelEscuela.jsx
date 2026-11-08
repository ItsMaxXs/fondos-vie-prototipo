// ============================================================
// Panel · Dirección de Escuela
// Comunica el aval a la VIE y confirma recepción. ERS: CU-11.
// ============================================================
import { Send } from "lucide-react";
import { Nota } from "../../../componentes/comunes/Mensajes.jsx";
import { Boton } from "../../../componentes/ui/Boton.jsx";
import { Tabla } from "../../../componentes/ui/Tablas.jsx";
import { useApp } from "../../../estado/contexto.js";
import { nombreInstancia } from "../../../reglas/alcance.js";
import { fechaCorta, fechaHora } from "../../../utilidades/fechas.js";
import { textos as T } from "../../../textos/pantallas/bandejas/paneles/PanelEscuela.js";

// ---------- Dirección de Escuela (CU-11) ----------
export function PanelEscuela({ p }) {
  const { act, db } = useApp();
  if (!p.consejo?.avales) return <Nota>{T.laPropuestaAunNoTiene}</Nota>;
  return (
    <div className="stack-lg">
      <Tabla
        columns={[
          { key: "instanciaId", label: T.instancia, render: (v) => nombreInstancia(db, v) },
          { key: "estado", label: T.aval },
          {
            key: "articulo",
            label: T.acuerdo,
            render: (v, r) => (v ? `${v} · ${fechaCorta(r.fechaAcuerdo)}` : "—"),
          },
        ]}
        rows={p.consejo.avales.map((a) => ({ ...a, id: a.instanciaId }))}
      />
      {p.estado === "Avalada" ? (
        <>
          <Nota>
            {T.todasLasInstanciasAprobaronEl} <strong>{p.oficioAval}</strong>
            {T.alComunicarloElSistemaEnvia}
          </Nota>
          <div className="action-row end">
            <Boton icon={Send} onClick={() => act("comunicarAvalAVIE", { id: p.id })}>
              {T.comunicarAvalALaVie}
            </Boton>
          </div>
        </>
      ) : p.comunicacionVIE ? (
        <Nota>
          {T.avalComunicadoEl} {fechaHora(p.comunicacionVIE.fecha)} {T.medianteElOficio}{" "}
          {p.comunicacionVIE.oficio}.{" "}
          {p.comunicacionVIE.confirmada
            ? T.laVieConfirmoLaRecepcion
            : T.pendienteDeConfirmacionDeLa}
        </Nota>
      ) : null}
    </div>
  );
}
