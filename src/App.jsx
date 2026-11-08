// ============================================================
// Aplicación · raíz
// AppERS: guarda la base en memoria y en localStorage, la sesión, la función act() que ejecuta acciones, el cierre por inactividad y el contexto. Rutas: tabla de rutas y control de acceso por rol.
// ERS: CU-01, RNF-SEG-01.
// ============================================================
import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import { ejecutarAccion } from "./acciones/ejecutar.js";
import { avanzarTiempo } from "./acciones/tiempo.js";
import { NAV } from "./datos/navegacion.js";
import { AppCtx, useApp } from "./estado/contexto.js";
import { SESSION_KEY, cargarBase, guardarBase, leerSesion } from "./estado/persistencia.js";
import { Administracion } from "./pantallas/administracion/Administracion.jsx";
import { Bandeja } from "./pantallas/bandejas/Bandeja.jsx";
import { Convocatorias } from "./pantallas/convocatorias/Convocatorias.jsx";
import { Formulario } from "./pantallas/formulario/Formulario.jsx";
import { Inicio } from "./pantallas/inicio/Inicio.jsx";
import { Login } from "./pantallas/plantilla/Login.jsx";
import { Notificaciones } from "./pantallas/plantilla/Notificaciones.jsx";
import { Shell } from "./pantallas/plantilla/Shell.jsx";
import { DetallePropuesta } from "./pantallas/propuestas/DetallePropuesta.jsx";
import { ListaPropuestas } from "./pantallas/propuestas/ListaPropuestas.jsx";
import { HistoricoReportes } from "./pantallas/reportes/HistoricoReportes.jsx";
import { Morosidad } from "./pantallas/reportes/Morosidad.jsx";
import { usuarioEfectivo } from "./reglas/alcance.js";
import { clone } from "./utilidades/ids.js";
import { textos as T } from "./textos/App.js";

export function AppERS() {
  const loc = useLocation();
  const nav = useNavigate();
  const [db, setDbState] = useState(cargarBase);
  const dbRef = useRef(db);
  const [sesion, setSesionState] = useState(leerSesion);
  const [aviso, setAviso] = useState(null);
  const avisoTimer = useRef();
  const ultimaActividad = useRef(Date.now());

  const setDb = (nuevo) => {
    dbRef.current = nuevo;
    setDbState(nuevo);
    guardarBase(nuevo);
  };
  const toast = (texto, tipo = "ok") => {
    if (!texto) return;
    setAviso({ texto, tipo });
    window.clearTimeout(avisoTimer.current);
    avisoTimer.current = window.setTimeout(() => setAviso(null), tipo === "error" ? 6500 : 3800);
  };
  const setSesion = (s) => {
    setSesionState(s);
    try {
      if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      else localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
  };

  const real = sesion ? db.users.find((u) => u.id === sesion.userId) : null;
  const rol = sesion?.rol;
  const usuario = real && rol ? usuarioEfectivo(db, real, rol) : real;

  // Ejecuta una acción del motor y muestra el resultado
  const act = (nombre, payload, opts = {}) => {
    const r = ejecutarAccion(dbRef.current, nombre, payload, { user: usuario, real, rol });
    if (r.error) {
      toast(r.error, "error");
      return { ok: false, error: r.error };
    }
    setDb(r.db);
    if (r.msg && !opts.silent) toast(r.msg);
    return { ok: true, msg: r.msg, resultado: r.resultado };
  };

  // Cierre de sesión por inactividad (RNF-SEG-03)
  useEffect(() => {
    const marca = () => (ultimaActividad.current = Date.now());
    ["mousemove", "keydown", "click"].forEach((e) => window.addEventListener(e, marca));
    const t_ = window.setInterval(() => {
      const min = dbRef.current.ajustes?.sesionMinutos || 30;
      if (leerSesion() && Date.now() - ultimaActividad.current > min * 60000) {
        setSesion(null);
        toast("La sesión se cerró por inactividad.", "error");
      }
    }, 20000);
    return () => {
      ["mousemove", "keydown", "click"].forEach((e) => window.removeEventListener(e, marca));
      window.clearInterval(t_);
    };
  }, []);
  // Al cargar, aplica los cambios automáticos por fecha
  useEffect(() => {
    const d = clone(dbRef.current);
    const antes = JSON.stringify(d.convocatorias.map((c) => c.estado)) + d.proposals.length;
    avanzarTiempo(d, { ahora: d.clock });
    if (
      JSON.stringify(d.convocatorias.map((c) => c.estado)) + d.proposals.length !== antes ||
      d.bitacora.length !== dbRef.current.bitacora.length ||
      d.notifications.length !== dbRef.current.notifications.length
    )
      setDb(d);
  }, []);

  const enLogin = loc.pathname === "/login";
  if (!real && !enLogin) return <Navigate to="/login" replace />;
  if (real && enLogin) return <Navigate to="/inicio" replace />;

  const ctx = {
    db,
    act,
    toast,
    real,
    usuario,
    rol,
    setRol: (r) => setSesion({ ...sesion, rol: r }),
    setSesion,
    setDb,
    ahora: db.clock,
    nav,
  };

  return (
    <AppCtx.Provider value={ctx}>
      {enLogin ? (
        <Login />
      ) : (
        <Shell>
          <Rutas />
        </Shell>
      )}
      {aviso && (
        <div
          className="toast"
          style={aviso.tipo === "error" ? { background: "#7a1b1b" } : undefined}
        >
          <Check size={18} />
          <span>{aviso.texto}</span>
          <button onClick={() => setAviso(null)} aria-label={T.cerrar}>
            <X size={16} />
          </button>
        </div>
      )}
    </AppCtx.Provider>
  );
}

function Rutas() {
  const { rol, db, usuario } = useApp();
  const permitido = (to) => {
    const it = NAV.find((n) => n.to === to);
    return it && (it.roles === "*" || it.roles.includes(rol));
  };
  const guard = (to, el) => (permitido(to) ? el : <Navigate to="/inicio" replace />);
  return (
    <Routes>
      <Route path="/inicio" element={<Inicio />} />
      <Route path="/convocatorias" element={guard("/convocatorias", <Convocatorias />)} />
      <Route path="/propuestas" element={guard("/propuestas", <ListaPropuestas />)} />
      <Route
        path="/propuestas/nueva"
        element={rol === "investigador" ? <Formulario /> : <Navigate to="/inicio" replace />}
      />
      <Route
        path="/propuestas/:id/editar"
        element={rol === "investigador" ? <Formulario /> : <Navigate to="/inicio" replace />}
      />
      <Route path="/propuestas/:id" element={<DetallePropuesta />} />
      <Route path="/bandeja" element={guard("/bandeja", <Bandeja />)} />
      <Route path="/bandeja/:id" element={guard("/bandeja", <Bandeja />)} />
      <Route path="/evaluaciones" element={<Navigate to="/bandeja" replace />} />
      <Route path="/morosidad" element={guard("/morosidad", <Morosidad />)} />
      <Route path="/historico" element={<HistoricoReportes />} />
      <Route path="/notificaciones" element={<Notificaciones />} />
      <Route path="/administracion" element={guard("/administracion", <Administracion />)} />
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}
