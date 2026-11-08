// ============================================================
// Pantalla · notificaciones
// Lista de notificaciones internas de la persona y marca de leídas.
// ERS: RF-NOT-01 a RF-NOT-05.
// ============================================================
import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Insignia } from "../../componentes/comunes/Insignias.jsx";
import { Pestanas } from "../../componentes/comunes/Pestanas.jsx";
import { Vacio } from "../../componentes/comunes/Vacio.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { Caja } from "../../componentes/ui/Caja.jsx";
import { EncabezadoPagina } from "../../componentes/ui/Encabezados.jsx";
import { useApp } from "../../estado/contexto.js";
import { BANDEJAS } from "../bandejas/registro.js";
import { fechaHora } from "../../utilidades/fechas.js";
import { ver } from "../../utilidades/rutas.js";
import { textos as T } from "../../textos/pantallas/plantilla/Notificaciones.js";

export function Notificaciones() {
  const { db, usuario, act, nav, rol } = useApp();
  const mias = db.notifications.filter((n) => n.userId === usuario.id);
  const [filtro, setFiltro] = useState("todas");
  const lista = mias.filter((n) =>
    filtro === "todas" ? true : filtro === "no" ? !n.leida : n.leida,
  );
  const abrir = (n) => {
    act("marcarLeida", { id: n.id });
    if (n.propId) {
      const p = db.proposals.find((x) => x.id === n.propId);
      if (p) nav(rol === "investigador" || !BANDEJAS[rol] ? ver(p.id) : `/bandeja/${p.id}`);
    }
  };
  return (
    <div>
      <EncabezadoPagina
        eyebrow={T.centroDeNotificaciones}
        title={T.notificaciones}
        description={T.avisosDelFlujoDeLa}
        actions={
          <Boton variant="secondary" icon={CheckCheck} onClick={() => act("marcarTodasLeidas")}>
            {T.marcarTodasComoLeidas}
          </Boton>
        }
      />
      <Caja>
        <Pestanas
          valor={filtro}
          onChange={setFiltro}
          items={[
            ["todas", T.todas, mias.length],
            ["no", T.noLeidas, mias.filter((n) => !n.leida).length],
            ["si", T.leidas, mias.filter((n) => n.leida).length],
          ]}
        />
        {lista.length === 0 ? (
          <Vacio titulo={T.sinNotificaciones} texto={T.cuandoOcurraUnEventoDel} />
        ) : (
          <div className="notifications-card">
            {lista.slice(0, 60).map((n) => (
              <div
                key={n.id}
                className={`notification-row ${n.leida ? "" : "unread"}`}
                onClick={() => abrir(n)}
                style={{ cursor: "pointer" }}
              >
                <div className="notification-symbol">
                  <Bell size={17} />
                </div>
                <div className="notification-copy">
                  <strong>{n.titulo}</strong>
                  <p>{n.detalle}</p>
                  <span>
                    {fechaHora(n.fecha)}
                    {n.propId ? ` · ${n.propId}` : ""}
                  </span>
                </div>
                {!n.leida && <Insignia tono="primary">{T.nueva}</Insignia>}
              </div>
            ))}
          </div>
        )}
      </Caja>
    </div>
  );
}
