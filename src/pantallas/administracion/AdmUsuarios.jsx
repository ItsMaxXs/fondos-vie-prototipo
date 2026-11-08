// ============================================================
// Administración · usuarios
// Alta, edición y baja de personas y asignación de roles. ERS: CU-17 (RF-USR-06 a RF-USR-11).
// ============================================================
import { useState } from "react";
import { PencilLine, Plus } from "lucide-react";
import { Campo } from "../../componentes/comunes/Campo.jsx";
import { Insignia } from "../../componentes/comunes/Insignias.jsx";
import { Nota } from "../../componentes/comunes/Mensajes.jsx";
import { Chk, Sel, Txt } from "../../componentes/formulario/campos.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { CampoBusqueda, Selector } from "../../componentes/ui/Campos.jsx";
import { Tabla } from "../../componentes/ui/Tablas.jsx";
import { Ventana } from "../../componentes/ui/Ventanas.jsx";
import { ROLES, ROL_CORTO } from "../../datos/roles.js";
import { useApp } from "../../estado/contexto.js";
import { pendienteDe, rolesDeUsuario } from "../../reglas/alcance.js";
import { clone } from "../../utilidades/ids.js";
import { textos as T } from "../../textos/pantallas/administracion/AdmUsuarios.js";

export function AdmUsuarios() {
  const { db, act, toast } = useApp();
  const [q_, setQ] = useState("");
  const [ed, setEd] = useState(null);
  const [aviso, setAviso] = useState(null);
  const lista = db.users.filter(
    (u) => !q_ || `${u.nombre} ${u.email}`.toLowerCase().includes(q_.toLowerCase()),
  );
  const pendientesDe = (u) =>
    db.proposals.filter((p) => rolesDeUsuario(u).some((r) => pendienteDe(db, u, r, p))).length;
  const guardar = () => {
    if (!/@(tec|itcr)\.ac\.cr$/i.test(ed.email || ""))
      return toast(
        "La persona no tiene cuenta institucional del TEC: no se le puede asignar un rol.",
        "error",
      );
    const r = act("guardarUsuario", { usuario: ed });
    if (r.ok) setEd(null);
  };
  const alternar = (u) => {
    const n = u.estado === "Activo" ? pendientesDe(u) : 0;
    if (n > 0) setAviso({ u, n });
    else act("cambiarEstadoUsuario", { id: u.id });
  };
  const nuevo = () =>
    setEd({
      id: "",
      nombre: "",
      email: "",
      cedula: "",
      orcid: "",
      plaza: "Propiedad",
      instancia: "COMP",
      estado: "Activo",
      roles: [{ rol: "investigador", instancia: "COMP" }],
    });
  const tieneRol = (r) => ed.roles.some((x) => x.rol === r);
  return (
    <div className="stack-lg" style={{ marginTop: 12 }}>
      <div className="action-row">
        <CampoBusqueda value={q_} onChange={setQ} placeholder={T.buscarPorNombreOCorreo} />
        <Boton icon={Plus} onClick={nuevo}>
          {T.nuevoUsuario}
        </Boton>
      </div>
      <Tabla
        columns={[
          {
            key: "nombre",
            label: T.persona,
            render: (v, u) => (
              <div className="table-primary">
                <strong>{v}</strong>
                <span>{u.email}</span>
              </div>
            ),
          },
          {
            key: "roles",
            label: T.roles,
            render: (v) =>
              v
                .map(
                  (r) =>
                    ROL_CORTO[r.rol] +
                    (r.instancia &&
                    [
                      "comite_asistente",
                      "comite_evaluador",
                      "consejo_asistente",
                      "consejo",
                      "direccion_escuela",
                    ].includes(r.rol)
                      ? ` (${r.instancia})`
                      : ""),
                )
                .join(", "),
          },
          { key: "instancia", label: T.instancia, render: (v) => v || "—" },
          {
            key: "estado",
            label: T.estado,
            render: (v) => <Insignia tono={v === "Activo" ? "success" : "neutral"}>{v}</Insignia>,
          },
          {
            key: "x",
            label: "",
            render: (_, u) => (
              <div className="action-row">
                <Boton variant="ghost" icon={PencilLine} onClick={() => setEd(clone(u))}>
                  {T.editar}
                </Boton>
                <Boton variant="ghost" onClick={() => alternar(u)}>
                  {u.estado === "Activo" ? T.desactivar : T.reactivar}
                </Boton>
              </div>
            ),
          },
        ]}
        rows={lista}
      />
      <Ventana
        open={!!ed}
        onClose={() => setEd(null)}
        title={ed?.id ? T.editarUsuario : T.nuevoUsuario}
        description={T.elRolSeAsignaAqui}
        footer={
          <>
            <Boton variant="secondary" onClick={() => setEd(null)}>
              {T.cancelar}
            </Boton>
            <Boton onClick={guardar}>{T.guardar}</Boton>
          </>
        }
      >
        {ed && (
          <div className="stack-md">
            <div className="form-grid two-col">
              <Txt
                label={T.nombreCompleto}
                value={ed.nombre}
                onChange={(v) => setEd({ ...ed, nombre: v })}
              />
              <Txt
                label={T.correoInstitucional}
                value={ed.email}
                onChange={(v) => setEd({ ...ed, email: v })}
              />
              <Txt
                label={T.cedula}
                value={ed.cedula}
                onChange={(v) => setEd({ ...ed, cedula: v })}
              />
              <Txt label={T.orcid} value={ed.orcid} onChange={(v) => setEd({ ...ed, orcid: v })} />
              <Sel
                label={T.tipoDePlaza}
                value={ed.plaza}
                onChange={(v) => setEd({ ...ed, plaza: v })}
                opciones={["Propiedad", "Interino", "Contratado", "Estudiante"]}
              />
              <Sel
                label={T.instancia}
                value={ed.instancia}
                onChange={(v) => setEd({ ...ed, instancia: v })}
                vacio="Sin instancia"
                opciones={db.instancias.map((i) => [i.id, i.nombre])}
              />
            </div>
            <Campo label={T.roles}>
              <div style={{ display: "grid", gap: 6 }}>
                {ROLES.map((r) => (
                  <div
                    key={r.id}
                    style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}
                  >
                    <Chk
                      checked={tieneRol(r.id)}
                      onChange={(v) =>
                        setEd({
                          ...ed,
                          roles: v
                            ? [...ed.roles, { rol: r.id, instancia: ed.instancia || "" }]
                            : ed.roles.filter((x) => x.rol !== r.id),
                        })
                      }
                    >
                      {r.label}
                    </Chk>
                    {tieneRol(r.id) &&
                      [
                        "comite_asistente",
                        "comite_evaluador",
                        "consejo_asistente",
                        "consejo",
                        "direccion_escuela",
                      ].includes(r.id) && (
                        <Selector
                          style={{ maxWidth: 220 }}
                          value={ed.roles.find((x) => x.rol === r.id).instancia}
                          onChange={(e) =>
                            setEd({
                              ...ed,
                              roles: ed.roles.map((x) =>
                                x.rol === r.id ? { ...x, instancia: e.target.value } : x,
                              ),
                            })
                          }
                        >
                          {db.instancias.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.id}
                            </option>
                          ))}
                        </Selector>
                      )}
                    {tieneRol(r.id) && r.id === "consejo" && (
                      <Chk
                        checked={!!ed.roles.find((x) => x.rol === "consejo").preside}
                        onChange={(v) =>
                          setEd({
                            ...ed,
                            roles: ed.roles.map((x) =>
                              x.rol === "consejo" ? { ...x, preside: v } : x,
                            ),
                          })
                        }
                      >
                        {T.preside}
                      </Chk>
                    )}
                  </div>
                ))}
              </div>
            </Campo>
          </div>
        )}
      </Ventana>
      <Ventana
        open={!!aviso}
        onClose={() => setAviso(null)}
        title={T.laPersonaTieneTareasPendientes}
        description={
          aviso
            ? `${aviso.u.nombre} tiene ${aviso.n} expediente(s) esperando su acción. Reasígnelos antes de desactivar la cuenta.`
            : ""
        }
        footer={
          <>
            <Boton variant="secondary" onClick={() => setAviso(null)}>
              {T.cancelar}
            </Boton>
            <Boton
              variant="danger"
              onClick={() => {
                act("cambiarEstadoUsuario", { id: aviso.u.id });
                setAviso(null);
              }}
            >
              {T.desactivarDeTodosModos}
            </Boton>
          </>
        }
      >
        <Nota tipo="aviso">{T.alDesactivarLaCuentaLa}</Nota>
      </Ventana>
    </div>
  );
}
