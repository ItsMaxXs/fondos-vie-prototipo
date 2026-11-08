// ============================================================
// Administración · roles
// Tabla de roles y permisos. ERS: RF-USR-06, RF-USR-07.
// ============================================================
import { Tabla } from "../../componentes/ui/Tablas.jsx";
import { PERMISOS } from "../../datos/permisos.js";
import { ROLES } from "../../datos/roles.js";
import { useApp } from "../../estado/contexto.js";
import { textos as T } from "../../textos/pantallas/administracion/AdmRoles.js";

export function AdmRoles() {
  const { db } = useApp();
  return (
    <div style={{ marginTop: 12 }}>
      <Tabla
        columns={[
          { key: "label", label: T.rol },
          { key: "permisos", label: T.permisos, render: (_, r) => PERMISOS[r.id] },
          {
            key: "n",
            label: T.personas,
            render: (_, r) =>
              db.users.filter((u) => u.estado === "Activo" && u.roles.some((x) => x.rol === r.id))
                .length,
          },
        ]}
        rows={ROLES}
      />
    </div>
  );
}
