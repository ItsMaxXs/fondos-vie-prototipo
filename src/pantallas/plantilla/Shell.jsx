// ============================================================
// Pantalla · estructura general
// Barra lateral, barra superior, reloj simulado y selector de rol. Envuelve todas las pantallas autenticadas.
// ERS: CU-01, RF-USR-06.
// ============================================================
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Bell, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { Campo } from "../../componentes/comunes/Campo.jsx";
import { Nota } from "../../componentes/comunes/Mensajes.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { Ventana } from "../../componentes/ui/Ventanas.jsx";
import { NAV, NOMBRE_BANDEJA } from "../../datos/navegacion.js";
import { ROLES, ROL_CORTO, ROL_NOMBRE } from "../../datos/roles.js";
import { useApp } from "../../estado/contexto.js";
import { rolesDeUsuario } from "../../reglas/alcance.js";
import { cierreRecepcion, recepcionAbierta } from "../../reglas/recepcion.js";
import { diasHasta, fechaHora, sumarDias } from "../../utilidades/fechas.js";
import { textos as T } from "../../textos/pantallas/plantilla/Shell.js";

export function Shell({ children }) {
  const { db, real, usuario, rol, setRol, setSesion, nav, ahora, act, toast } = useApp();
  const [reloj, setReloj] = useState(false);
  const [iso, setIso] = useState(ahora.slice(0, 16));
  const esAdmin = real.roles.some((r) => r.rol === "admin");
  const misRoles = esAdmin
    ? ROLES.filter((r) => r.id !== "admin")
        .map((r) => r.id)
        .concat("admin")
    : rolesDeUsuario(real);
  const items = NAV.filter((n) => n.roles === "*" || n.roles.includes(rol)).map((n) =>
    n.to === "/bandeja" ? { ...n, label: NOMBRE_BANDEJA[rol] || "Bandeja" } : n,
  );
  const noLeidas = db.notifications.filter((n) => n.userId === usuario.id && !n.leida).length;
  const conv = db.convocatorias.find((c) => c.estado === "Publicada");
  const cierre = conv ? cierreRecepcion(db, conv.id) : null;
  const abierta = conv ? recepcionAbierta(db, conv.id, ahora) : false;
  const actuando = esAdmin && rol !== "admin";
  const cerrarSesion = () => {
    setSesion(null);
    nav("/login");
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block brand-block-tec">
          <div className="tec-lockup" aria-label={T.tecnologicoDeCostaRica}>
            <span className="tec-wordmark">{T.tec}</span>
            <span className="tec-red-line" />
          </div>
          <div className="brand-copy">
            <strong>{T.vicerrectoriaDeInvestigacion}</strong>
            <span>{T.fondosDeInvestigacion}</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {items.map(({ to, label, icon: Icono }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <Icono size={18} />
              <span>{label}</span>
              {to === "/notificaciones" && noLeidas > 0 && (
                <span className="nav-counter">{noLeidas}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="security-note">
            <ShieldCheck size={15} /> {T.prototipoAcademicoTec}
          </div>
          <button className="nav-item logout" onClick={cerrarSesion}>
            <LogOut size={18} />
            <span>{T.cerrarSesion}</span>
          </button>
          <div className="copyright-note">{T.t2026ItcrCostaRica}</div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-product">
            <strong>{T.fondosVie}</strong>
            <span className="topbar-divider" />
            <span>{T.sistemaDeGestionDePropuestas}</span>
          </div>
          <div className="topbar-actions">
            <button
              onClick={() => esAdmin && setReloj(true)}
              title={esAdmin ? T.cambiarLaFechaDeDemostracion : T.fechaDelSistema}
              style={{
                border: "1px solid var(--ink-15)",
                background: abierta ? "#e9f6ee" : "#fdecec",
                color: abierta ? "#17653a" : "#9b1c1c",
                borderRadius: 10,
                padding: "6px 12px",
                fontSize: 12.5,
                cursor: esAdmin ? "pointer" : "default",
                textAlign: "left",
                lineHeight: 1.3,
              }}
            >
              <strong>{fechaHora(ahora)}</strong>
              <br />
              {abierta
                ? `Recepción abierta · cierra en ${diasHasta(ahora, cierre)} días`
                : T.recepcionDePropuestasCerrada}
            </button>
            {misRoles.length > 1 || esAdmin ? (
              <label className="admin-role-switch">
                <span>{esAdmin ? T.vistaActual : T.rolActivo}</span>
                <select
                  value={rol}
                  onChange={(e) => {
                    setRol(e.target.value);
                    nav("/inicio");
                  }}
                >
                  {misRoles.map((r) => (
                    <option key={r} value={r}>
                      {r === "admin" ? T.panelGlobal : ROL_CORTO[r]}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="current-role-chip">
                <span>{T.rol}</span>
                <strong>{ROL_CORTO[rol]}</strong>
              </div>
            )}
            <button
              className="topbar-icon"
              onClick={() => nav("/notificaciones")}
              aria-label={T.notificaciones}
            >
              <Bell size={19} />
              {noLeidas > 0 && <span className="notification-dot" />}
            </button>
            <div className="user-chip">
              <div className="avatar">
                <UserRound size={18} />
              </div>
              <div>
                <strong>{real.nombre}</strong>
                <span>{actuando ? `Actuando como ${ROL_CORTO[rol]}` : ROL_CORTO[rol]}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="content">
          {actuando && (
            <Nota tipo="aviso">
              {T.estaOperandoLaVistaDe} <strong>{ROL_NOMBRE[rol]}</strong>{" "}
              {T.comoAdministradorCadaAccionQue}
            </Nota>
          )}
          {children}
        </main>
      </div>
      <Ventana
        open={reloj}
        onClose={() => setReloj(false)}
        title={T.fechaDeDemostracion}
        description={T.elSistemaAplicaElCierre}
        footer={
          <>
            <Boton variant="secondary" onClick={() => setReloj(false)}>
              {T.cancelar}
            </Boton>
            <Boton
              onClick={() => {
                const r = act("fijarReloj", { iso: iso.length === 16 ? iso + ":00" : iso });
                if (r.ok) setReloj(false);
              }}
            >
              {T.aplicarFecha}
            </Boton>
          </>
        }
      >
        <Campo label={T.fechaYHoraSimuladas}>
          <input
            className="input"
            type="datetime-local"
            value={iso}
            onChange={(e) => setIso(e.target.value)}
          />
        </Campo>
        <div className="action-row" style={{ flexWrap: "wrap" }}>
          <Boton variant="secondary" onClick={() => setIso(sumarDias(iso, 1))}>
            {T.t1Dia}
          </Boton>
          <Boton variant="secondary" onClick={() => setIso(sumarDias(iso, 7))}>
            {T.t7Dias}
          </Boton>
          <Boton
            variant="secondary"
            onClick={() => conv && setIso(`${cierreRecepcion(db, conv.id).slice(0, 10)}T08:00`)}
          >
            {T.diaDelCierre800}
          </Boton>
          <Boton
            variant="secondary"
            onClick={() => conv && setIso(`${cierreRecepcion(db, conv.id).slice(0, 10)}T23:59`)}
          >
            {T.ultimoMinuto}
          </Boton>
          <Boton
            variant="secondary"
            onClick={() =>
              conv && setIso(sumarDias(`${cierreRecepcion(db, conv.id).slice(0, 10)}T08:00`, 1))
            }
          >
            {T.despuesDelCierre}
          </Boton>
          <Boton variant="secondary" onClick={() => setIso("2026-08-14T09:00")}>
            {T.restablecer}
          </Boton>
        </div>
      </Ventana>
    </div>
  );
}
