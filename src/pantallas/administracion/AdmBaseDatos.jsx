// ============================================================
// Administración · mantenimientos en base de datos MySQL
// Cinco CRUD completos (crear, leer, actualizar, eliminar) contra la API del servidor (servidor/server.js):
// instancias, usuarios, comités técnicos, catálogos e informes pendientes.
// ============================================================
import { useCallback, useEffect, useState } from "react";
import { PencilLine, Plus, Trash2 } from "lucide-react";
import { Pestanas } from "../../componentes/comunes/Pestanas.jsx";
import { Sel, Txt } from "../../componentes/formulario/campos.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { Tabla } from "../../componentes/ui/Tablas.jsx";
import { Ventana } from "../../componentes/ui/Ventanas.jsx";
import { ROLES } from "../../datos/roles.js";
import { useApp } from "../../estado/contexto.js";
import { textos as T } from "../../textos/pantallas/administracion/AdmBaseDatos.js";

const API = (typeof window !== "undefined" && window.API_URL) || "http://localhost:3001/api";

async function llamar(metodo, ruta, cuerpo) {
  const r = await fetch(`${API}/${ruta}`, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(datos.error || "Error del servidor.");
  return datos;
}


// Cada entidad: ruta de la API, columnas de la tabla y campos del formulario
const ENT = {
  instancias: {
    titulo: "Instancias", pk: "id", pkManual: true,
    nuevo: () => ({ id: "", nombre: "", tipo: "Escuela", horas_vie: 0, horas_vie_centros: 0 }),
    cols: [["id", "Código"], ["nombre", "Nombre"], ["tipo", "Tipo"], ["horas_vie", "Horas VIE"], ["horas_vie_centros", "Horas VIE-Centros"]],
    campos: [["id", "Código", "txt", { pk: true }], ["nombre", "Nombre", "txt"], ["tipo", "Tipo", "sel", { op: ["Escuela", "Centro", "Departamento"] }], ["horas_vie", "Horas VIE", "num"], ["horas_vie_centros", "Horas VIE-Centros", "num"]],
  },
  usuarios: {
    titulo: "Usuarios", pk: "id", pkManual: true,
    nuevo: () => ({ id: "u_" + Math.random().toString(36).slice(2, 8), nombre: "", email: "", cedula: "", orcid: "", plaza: "Propiedad", rol: "investigador", instancia_id: "", estado: "Activo" }),
    cols: [["nombre", "Nombre"], ["email", "Correo"], ["rol", "Rol"], ["instancia_id", "Instancia"], ["estado", "Estado"]],
    campos: [["nombre", "Nombre", "txt"], ["email", "Correo institucional", "txt"], ["cedula", "Cédula", "txt"], ["orcid", "ORCID", "txt"], ["rol", "Rol", "sel", { op: ROLES.map((r) => [r.id, r.label]) }], ["instancia_id", "Instancia", "ref", { ref: "instancias", vacio: "Sin instancia" }], ["estado", "Estado", "sel", { op: ["Activo", "Inactivo"] }]],
  },
  comites: {
    titulo: "Comités técnicos", pk: "id",
    nuevo: () => ({ instancia_id: "", nombre: "", coordinador_id: "", tamano: 5 }),
    cols: [["nombre", "Comité"], ["instancia_id", "Instancia"], ["coordinador_id", "Coordina", "usuarios"], ["tamano", "Integrantes"]],
    campos: [["nombre", "Nombre del comité", "txt"], ["instancia_id", "Instancia", "ref", { ref: "instancias", vacio: "Elija una instancia" }], ["coordinador_id", "Persona que coordina", "ref", { ref: "usuarios", vacio: "Elija una persona" }], ["tamano", "Cantidad de integrantes", "num"]],
  },
  catalogos: {
    titulo: "Catálogos", pk: "id",
    nuevo: () => ({ catalogo: "", valor: "", puntos: "" }),
    cols: [["catalogo", "Catálogo"], ["valor", "Valor"], ["puntos", "Puntos"]],
    campos: [["catalogo", "Catálogo", "txt"], ["valor", "Valor", "txt"], ["puntos", "Puntos (opcional)", "num"]],
  },
  informes: {
    titulo: "Informes pendientes", pk: "id",
    nuevo: () => ({ nombre: "", cedula: "", proyecto: "", detalle: "", estado: "Pendiente", registrado_por: "", fecha: new Date().toISOString().slice(0, 10) }),
    cols: [["nombre", "Persona"], ["proyecto", "Proyecto"], ["detalle", "Detalle"], ["estado", "Estado"], ["fecha", "Fecha"]],
    campos: [["nombre", "Nombre", "txt"], ["cedula", "Cédula", "txt"], ["proyecto", "Proyecto", "txt"], ["detalle", "Detalle", "txt"], ["estado", "Estado", "sel", { op: ["Pendiente", "Regularizado"] }], ["registrado_por", "Registrado por", "txt"], ["fecha", "Fecha", "date"]],
  },
};

function Mantenimiento({ ruta, ref_ }) {
  const { toast } = useApp();
  const e = ENT[ruta];
  const [filas, setFilas] = useState(null);
  const [error, setError] = useState("");
  const [ed, setEd] = useState(null);
  const [borrar, setBorrar] = useState(null);
  const [aviso, setAviso] = useState("");

  const cargar = useCallback(async () => {
    setError("");
    try { setFilas(await llamar("GET", ruta)); } catch (x) { setFilas(null); setError(x.message === "Failed to fetch" ? T.sinServidor : x.message); }
  }, [ruta]);
  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async () => {
    setAviso("");
    try {
      const { _nuevo, ...datos } = ed;
      if (_nuevo) await llamar("POST", ruta, datos);
      else await llamar("PUT", `${ruta}/${ed[e.pk]}`, datos);
      toast(_nuevo ? T.creado : T.actualizado);
      setEd(null);
      cargar();
    } catch (x) { setAviso(x.message); }
  };
  const eliminar = async () => {
    try {
      await llamar("DELETE", `${ruta}/${borrar[e.pk]}`);
      toast(T.eliminado);
      setBorrar(null);
      cargar();
    } catch (x) { toast(x.message, "error"); setBorrar(null); }
  };
  const nombreDe = (lista, id) => lista?.find((r) => r.id === id)?.nombre || id;

  return (
    <div className="stack-lg" style={{ marginTop: 12 }}>
      <div className="action-row">
        <Boton icon={Plus} onClick={() => setEd({ ...e.nuevo(), _nuevo: true })}>{T.nuevo}</Boton>
      </div>
      {error && (
        <div className="alert alert-error" role="alert">
          <span>{error}</span> <Boton variant="secondary" onClick={cargar}>{T.reintentar}</Boton>
        </div>
      )}
      {filas && (
        <Tabla
          columns={[
            ...e.cols.map(([k, label, ref]) => ({ key: k, label, render: (v) => (ref ? nombreDe(ref_?.[ref], v) : v ?? "") })),
            {
              key: "x", label: "",
              render: (_, r) => (
                <div className="action-row">
                  <Boton variant="ghost" icon={PencilLine} onClick={() => setEd({ ...r })}>{T.editar}</Boton>
                  <Boton variant="ghost" icon={Trash2} onClick={() => setBorrar(r)}>{T.eliminar}</Boton>
                </div>
              ),
            },
          ]}
          rows={filas}
        />
      )}
      {filas && !filas.length && <p>{T.sinRegistros}</p>}
      {!filas && !error && <p>{T.cargando}</p>}

      <Ventana
        open={!!ed} onClose={() => setEd(null)} title={e.titulo}
        footer={<><Boton variant="secondary" onClick={() => setEd(null)}>{T.cancelar}</Boton><Boton onClick={guardar}>{T.guardar}</Boton></>}
      >
        {ed && (
          <div className="form-grid two-col">
            {e.campos.map(([k, label, tipo, o = {}]) =>
              tipo === "sel" ? (
                <Sel key={k} label={label} value={ed[k]} onChange={(v) => setEd({ ...ed, [k]: v })} opciones={o.op} />
              ) : tipo === "ref" ? (
                <Sel key={k} label={label} value={ed[k]} vacio={o.vacio} onChange={(v) => setEd({ ...ed, [k]: v })}
                  opciones={(ref_?.[o.ref] || []).map((r) => [r.id, r.nombre])} />
              ) : (
                <Txt key={k} label={label} type={tipo === "num" ? "number" : tipo === "date" ? "date" : "text"} value={ed[k]}
                  disabled={o.pk && !ed._nuevo} onChange={(v) => setEd({ ...ed, [k]: o.pk ? v.toUpperCase() : v })} />
              ),
            )}
            {aviso && <p className="field-error" role="alert">{aviso}</p>}
          </div>
        )}
      </Ventana>
      <Ventana
        open={!!borrar} onClose={() => setBorrar(null)} title={T.eliminar} description={T.confirmarEliminar}
        footer={<><Boton variant="secondary" onClick={() => setBorrar(null)}>{T.cancelar}</Boton><Boton icon={Trash2} onClick={eliminar}>{T.si}</Boton></>}
      />
    </div>
  );
}

export function AdmBaseDatos() {
  const [tab, setTab] = useState("instancias");
  const [ref_, setRef] = useState({});
  useEffect(() => {
    // listas de apoyo para los campos que apuntan a otra tabla (instancias y usuarios)
    Promise.all([llamar("GET", "instancias"), llamar("GET", "usuarios")])
      .then(([instancias, usuarios]) => setRef({ instancias, usuarios }))
      .catch(() => {});
  }, [tab]);
  return (
    <div style={{ marginTop: 12 }}>
      <p>{T.aviso}</p>
      <Pestanas valor={tab} onChange={setTab} items={Object.entries(ENT).map(([k, v]) => [k, v.titulo])} />
      <Mantenimiento key={tab} ruta={tab} ref_={ref_} />
    </div>
  );
}
