// ============================================================
// Pantalla · convocatorias
// Lista, creación y publicación de convocatorias y edición del cronograma.
// ERS: CU-02 (RF-CON-01 a RF-CON-05, RF-CON-09).
// ============================================================
import { useState } from "react";
import { Megaphone, PencilLine, Plus } from "lucide-react";
import { Insignia } from "../../componentes/comunes/Insignias.jsx";
import { Vacio } from "../../componentes/comunes/Vacio.jsx";
import { Area, Sel, Txt } from "../../componentes/formulario/campos.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { Caja } from "../../componentes/ui/Caja.jsx";
import { EncabezadoPagina, TituloSeccion } from "../../componentes/ui/Encabezados.jsx";
import { Tabla } from "../../componentes/ui/Tablas.jsx";
import { Ventana } from "../../componentes/ui/Ventanas.jsx";
import { useApp } from "../../estado/contexto.js";
import { fechaCorta, fechaHora } from "../../utilidades/fechas.js";
import { textos as T } from "../../textos/pantallas/convocatorias/Convocatorias.js";

export function Convocatorias() {
  const { db, act, rol, ahora, toast } = useApp();
  const puede = rol === "vie_publicacion" || rol === "admin";
  const [sel, setSel] = useState(null);
  const [nueva, setNueva] = useState(false);
  const [f, setF] = useState({
    nombre: "",
    descripcion: "",
    apertura: "",
    cierre: "",
    copiarDe: "",
    estado: "Borrador",
  });
  const [etapa, setEtapa] = useState(null);
  const conv = db.convocatorias.find((c) => c.id === sel);
  const crear = () => {
    const r = act("crearConvocatoria", f);
    if (r.ok) {
      setNueva(false);
      setSel(r.resultado);
      setF({
        nombre: "",
        descripcion: "",
        apertura: "",
        cierre: "",
        copiarDe: "",
        estado: "Borrador",
      });
    }
  };
  return (
    <div>
      <EncabezadoPagina
        eyebrow={T.convocatorias}
        title={T.gestionDeConvocatorias}
        description={T.cronogramaEstadoDePublicacionY}
        actions={
          puede ? (
            <Boton icon={Plus} onClick={() => setNueva(true)}>
              {T.nuevaConvocatoria}
            </Boton>
          ) : null
        }
      />
      <div className="dashboard-grid">
        <Caja>
          <Tabla
            columns={[
              { key: "id", label: T.codigo },
              { key: "nombre", label: T.nombre },
              {
                key: "periodo",
                label: T.formulacion,
                render: (_, r) => `${fechaCorta(r.apertura)} – ${fechaCorta(r.cierre)}`,
              },
              {
                key: "estado",
                label: T.estado,
                render: (v) => (
                  <Insignia
                    tono={v === "Publicada" ? "success" : v === "Borrador" ? "warning" : "neutral"}
                  >
                    {v}
                  </Insignia>
                ),
              },
            ]}
            rows={db.convocatorias}
            onRowClick={(r) => setSel(r.id)}
          />
        </Caja>
        {conv ? (
          <Caja>
            <TituloSeccion
              title={conv.nombre}
              description={conv.descripcion}
              action={
                puede && conv.estado !== "Publicada" && conv.estado !== "Finalizada" ? (
                  <Boton
                    icon={Megaphone}
                    onClick={() => act("publicarConvocatoria", { id: conv.id })}
                  >
                    {T.publicar}
                  </Boton>
                ) : null
              }
            />
            <Tabla
              columns={[
                { key: "etapa", label: T.etapa },
                { key: "responsable", label: T.responsable },
                { key: "inicio", label: T.inicio, render: (v) => fechaCorta(v) },
                { key: "fin", label: T.fin, render: (v) => fechaCorta(v) },
                {
                  key: "x",
                  label: "",
                  render: (_, r) =>
                    puede ? (
                      <Boton
                        variant="ghost"
                        icon={PencilLine}
                        onClick={() => setEtapa({ ...r, motivo: "" })}
                      >
                        {T.editar}
                      </Boton>
                    ) : null,
                },
              ]}
              rows={conv.cronograma}
            />
            {conv.cambios.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <strong>{T.historialDeCambios}</strong>
                {conv.cambios.map((c_, i) => (
                  <div
                    key={i}
                    style={{ fontSize: 13, padding: "6px 0", borderBottom: "1px solid #eef0f3" }}
                  >
                    {fechaHora(c_.fecha)} · {c_.etapa}: {c_.antes} → {c_.despues}. {c_.motivo}{" "}
                    <span style={{ opacity: 0.6 }}>({c_.por})</span>
                  </div>
                ))}
              </div>
            )}
          </Caja>
        ) : (
          <Caja>
            <Vacio titulo={T.seleccioneUnaConvocatoria} texto={T.veraSuCronogramaYPodra} />
          </Caja>
        )}
      </div>
      <Ventana
        open={nueva}
        onClose={() => setNueva(false)}
        title={T.nuevaConvocatoria}
        description={T.puedeCopiarLosParametrosLas}
        footer={
          <>
            <Boton variant="secondary" onClick={() => setNueva(false)}>
              {T.cancelar}
            </Boton>
            <Boton onClick={crear}>{T.guardar}</Boton>
          </>
        }
      >
        <div className="stack-md">
          <Txt label={T.nombre} value={f.nombre} onChange={(v) => setF({ ...f, nombre: v })} />
          <Area
            label={T.descripcion}
            rows={3}
            value={f.descripcion}
            onChange={(v) => setF({ ...f, descripcion: v })}
          />
          <div className="form-grid two-col">
            <Txt
              label={T.apertura}
              type="date"
              value={f.apertura}
              onChange={(v) => setF({ ...f, apertura: v })}
            />
            <Txt
              label={T.cierreDeFormulacion}
              type="date"
              value={f.cierre}
              onChange={(v) => setF({ ...f, cierre: v })}
            />
          </div>
          <Sel
            label={T.copiarDesde}
            value={f.copiarDe}
            onChange={(v) => setF({ ...f, copiarDe: v })}
            vacio="Empezar con los valores por defecto"
            opciones={db.convocatorias.map((c) => [c.id, c.nombre])}
          />
          <Sel
            label={T.guardarComo}
            value={f.estado}
            onChange={(v) => setF({ ...f, estado: v })}
            opciones={["Borrador", "Programada"]}
          />
        </div>
      </Ventana>
      <Ventana
        open={!!etapa}
        onClose={() => setEtapa(null)}
        title={etapa ? `Editar «${etapa.etapa}»` : ""}
        description={T.todoCambioDeFechasQueda}
        footer={
          <>
            <Boton variant="secondary" onClick={() => setEtapa(null)}>
              {T.cancelar}
            </Boton>
            <Boton
              onClick={() => {
                const r = act("editarEtapa", {
                  convId: conv.id,
                  etapaId: etapa.id,
                  inicio: etapa.inicio,
                  fin: etapa.fin,
                  motivo: etapa.motivo,
                });
                if (r.ok) setEtapa(null);
              }}
            >
              {T.guardarCambio}
            </Boton>
          </>
        }
      >
        {etapa && (
          <div className="stack-md">
            <div className="form-grid two-col">
              <Txt
                label={T.inicio}
                type="date"
                value={etapa.inicio}
                onChange={(v) => setEtapa({ ...etapa, inicio: v })}
              />
              <Txt
                label={T.fin}
                type="date"
                value={etapa.fin}
                onChange={(v) => setEtapa({ ...etapa, fin: v })}
              />
            </div>
            <Area
              label={T.motivoDelCambio}
              rows={3}
              value={etapa.motivo}
              onChange={(v) => setEtapa({ ...etapa, motivo: v })}
            />
          </div>
        )}
      </Ventana>
    </div>
  );
}
