// ============================================================
// Pantalla · inicio de sesión
// Simula la autenticación institucional: se elige una persona de demostración.
// ERS: CU-01 (RF-USR-01 a RF-USR-05).
// ============================================================
import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Campo } from "../../componentes/comunes/Campo.jsx";
import { Nota } from "../../componentes/comunes/Mensajes.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { Entrada } from "../../componentes/ui/Campos.jsx";
import { ROLES } from "../../datos/roles.js";
import { useApp } from "../../estado/contexto.js";
import { guardarBase } from "../../estado/persistencia.js";
import { rolesDeUsuario } from "../../reglas/alcance.js";
import { clone, uid } from "../../utilidades/ids.js";
import { textos as T } from "../../textos/pantallas/plantilla/Login.js";

export function Login() {
  const { db, setSesion, nav, toast } = useApp();
  const [email, setEmail] = useState("mrodriguez@tec.ac.cr");
  const [clave, setClave] = useState("prototipo2026");
  const [ver_, setVer] = useState(false);
  const [error, setError] = useState("");
  const entrar = (e) => {
    e?.preventDefault();
    const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u) return setError("Las credenciales no coinciden con ninguna cuenta del TEC.");
    if (u.estado !== "Activo")
      return setError("La cuenta está desactivada. Comuníquese con la administración del sistema.");
    if (!clave.trim()) return setError("Escriba su contraseña institucional.");
    const rolInicial = rolesDeUsuario(u)[0];
    setSesion({ userId: u.id, rol: rolInicial });
    const d = clone(db);
    d.bitacora.push({
      id: uid("b"),
      fecha: d.clock,
      usuario: u.nombre,
      rol: rolInicial,
      enNombreDe: "",
      accion: "Inicio de sesión",
      propId: "",
      anterior: "",
      nuevo: "",
    });
    guardarBase(d);
    nav("/inicio");
  };
  const grupos = ROLES.map((r) => ({
    r,
    usuarios: db.users.filter((u) => u.estado === "Activo" && u.roles.some((x) => x.rol === r.id)),
  }));
  return (
    <div className="login-page">
      <div className="login-brand-panel">
        <div className="login-brand-copy">
          <div className="login-tec-lockup">
            <span>{T.tec}</span>
            <i />
          </div>
          <div className="eyebrow light">{T.institutoTecnologicoDeCostaRica}</div>
          <h1>{T.gestionDeLaConvocatoriaDe}</h1>
          <p>{T.formulacionEvaluacionAvalResolucionY}</p>
          <div className="login-stage-list">
            <span>{T.reglasDeLaConvocatoria}</span>
            <span>{T.evaluacionConRubricaOficial}</span>
            <span>{T.bitacoraYTrazabilidad}</span>
          </div>
        </div>
        <div className="login-footer">{T.vicerrectoriaDeInvestigacionYExtension}</div>
      </div>
      <div className="login-form-panel">
        <form className="login-form" onSubmit={entrar}>
          <div className="login-form-title">
            <span className="eyebrow">{T.accesoInstitucional}</span>
            <h2>{T.iniciarSesion}</h2>
            <p>{T.useElMismoUsuarioY}</p>
          </div>
          <Campo label={T.correoInstitucional}>
            <div className="input-icon-wrap">
              <Mail size={17} />
              <Entrada
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
              />
            </div>
          </Campo>
          <Campo label={T.contrasena}>
            <div className="input-icon-wrap">
              <LockKeyhole size={17} />
              <Entrada
                type={ver_ ? "text" : "password"}
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setVer(!ver_)}>
                {ver_ ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </Campo>
          {error && <Nota tipo="error">{error}</Nota>}
          <div className="prototype-role-box" style={{ display: "block" }}>
            <strong>{T.cuentasDeDemostracion}</strong>
            <span style={{ display: "block", marginBottom: 8 }}>{T.elPrototipoNoSeConecta}</span>
            <select
              className="input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            >
              {grupos.map(
                ({ r, usuarios }) =>
                  usuarios.length > 0 && (
                    <optgroup key={r.id} label={r.label}>
                      {usuarios.map((u) => (
                        <option key={r.id + u.id} value={u.email}>
                          {u.nombre} · {u.email}
                        </option>
                      ))}
                    </optgroup>
                  ),
              )}
            </select>
          </div>
          <Boton type="submit" className="full-width">
            {T.iniciarSesion}
          </Boton>
          <p className="login-help">{T.losDatosSeGuardanEn}</p>
        </form>
      </div>
    </div>
  );
}
