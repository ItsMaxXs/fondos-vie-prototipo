// ============================================================
// Pantalla · inicio
// Resumen según el rol: estadísticas, pendientes y accesos rápidos.
// ============================================================
import { Plus } from "lucide-react";
import { EstadoInsignia } from "../../componentes/comunes/Insignias.jsx";
import { Vacio } from "../../componentes/comunes/Vacio.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { Caja, Estadistica } from "../../componentes/ui/Caja.jsx";
import { EncabezadoPagina, TituloSeccion } from "../../componentes/ui/Encabezados.jsx";
import { ROL_NOMBRE } from "../../datos/roles.js";
import { useApp } from "../../estado/contexto.js";
import { BANDEJAS } from "../bandejas/registro.js";
import { pendienteDe, visiblesPara } from "../../reglas/alcance.js";
import { cierreRecepcion, recepcionAbierta } from "../../reglas/recepcion.js";
import { fechaCorta, fechaHora } from "../../utilidades/fechas.js";
import { ver } from "../../utilidades/rutas.js";
import { textos as T } from "../../textos/pantallas/inicio/Inicio.js";

export function Inicio() {
  const { db, usuario, rol, nav, ahora } = useApp();
  const conv = db.convocatorias.find((c) => c.estado === "Publicada");
  const mias = visiblesPara(db, usuario, rol);
  const pend = db.proposals.filter((p) => pendienteDe(db, usuario, rol, p));
  const noLeidas = db.notifications.filter((n) => n.userId === usuario.id && !n.leida);
  const cierre = conv ? cierreRecepcion(db, conv.id) : null;
  const proximas = conv
    ? conv.cronograma.filter((e) => e.fin >= ahora.slice(0, 10)).slice(0, 4)
    : [];
  const porEstado = {};
  db.proposals
    .filter((p) => !p.historico)
    .forEach((p) => (porEstado[p.estado] = (porEstado[p.estado] || 0) + 1));
  const irA = (p) =>
    nav(
      rol === "investigador"
        ? ["Borrador", "Devuelta por faltantes", "Con observaciones"].includes(p.estado)
          ? `/propuestas/${p.id}/editar`
          : ver(p.id)
        : BANDEJAS[rol]
          ? `/bandeja/${p.id}`
          : ver(p.id),
    );
  return (
    <div>
      <EncabezadoPagina
        eyebrow={ROL_NOMBRE[rol]}
        title={`Hola, ${usuario.nombre.split(" ")[0]}`}
        description={
          conv
            ? `${conv.nombre}. ${recepcionAbierta(db, conv.id, ahora) ? `La recepción de propuestas cierra el ${fechaHora(cierre)}.` : `La recepción de propuestas cerró el ${fechaHora(cierre)}.`}`
            : T.noHayUnaConvocatoriaPublicada
        }
        actions={
          rol === "investigador" && conv && recepcionAbierta(db, conv.id, ahora) ? (
            <Boton icon={Plus} onClick={() => nav("/propuestas/nueva")}>
              {T.nuevaPropuesta}
            </Boton>
          ) : null
        }
      />
      <div className="stats-grid">
        <Estadistica
          label={T.pendientesParaUsted}
          value={pend.length}
          hint={T.requierenUnaAccionDeSu}
        />
        <Estadistica label={T.propuestasVisibles} value={mias.length} hint={T.segunSuRolYSu} />
        <Estadistica label={T.notificacionesSinLeer} value={noLeidas.length} />
        <Estadistica
          label={T.propuestasDeLaConvocatoria}
          value={db.proposals.filter((p) => !p.historico && p.estado !== "Borrador").length}
          hint={`${db.proposals.filter((p) => p.estado === "Borrador").length} borradores`}
        />
      </div>
      <div className="dashboard-grid">
        <Caja>
          <TituloSeccion title={T.pendientes} description={T.expedientesQueEsperanUnaAccion} />
          {pend.length === 0 ? (
            <Vacio titulo={T.sinPendientes} texto={T.noTieneAccionesPorRealizar} />
          ) : (
            <div className="task-list">
              {pend.slice(0, 8).map((p) => (
                <div
                  key={p.id}
                  className="task-row"
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid #eef0f3",
                  }}
                  onClick={() => irA(p)}
                >
                  <div>
                    <strong>{p.titulo || T.borradorSinTitulo}</strong>
                    <div style={{ fontSize: 12.5, opacity: 0.7 }}>
                      {p.id} · {p.investigadora}
                    </div>
                  </div>
                  <EstadoInsignia estado={p.estado} />
                </div>
              ))}
            </div>
          )}
        </Caja>
        <Caja>
          <TituloSeccion
            title={T.proximasFechas}
            description={T.cronogramaDeLaConvocatoriaVigente}
          />
          {proximas.map((e) => (
            <div
              key={e.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                padding: "8px 0",
                borderBottom: "1px solid #eef0f3",
                fontSize: 14,
              }}
            >
              <div>
                <strong>{e.etapa}</strong>
                <div style={{ fontSize: 12.5, opacity: 0.7 }}>{e.responsable}</div>
              </div>
              <span style={{ whiteSpace: "nowrap" }}>
                {fechaCorta(e.inicio)}
                {e.fin !== e.inicio ? ` – ${fechaCorta(e.fin)}` : ""}
              </span>
            </div>
          ))}
        </Caja>
      </div>
      {["admin", "direccion_investigacion", "gestora_vie", "vie_publicacion"].includes(rol) && (
        <Caja style={{ marginTop: 18 }}>
          <TituloSeccion title={T.propuestasPorEstado} description={T.distribucionActualDelFlujo} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.entries(porEstado).map(([k, v]) => (
              <span key={k} style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <EstadoInsignia estado={k} />
                <strong>{v}</strong>
              </span>
            ))}
          </div>
        </Caja>
      )}
    </div>
  );
}
