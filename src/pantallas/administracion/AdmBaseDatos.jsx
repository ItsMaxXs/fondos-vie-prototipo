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
  const respuesta = await fetch(`${API}/${ruta}`, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.error || "Error del servidor.");
  return datos;
}


// Cada entidad: ruta de la API, columnas de la tabla y campos del formulario
const ENTIDADES = {
  instancias: {
    titulo: "Instancias", llavePrimaria: "id", llavePrimariaManual: true,
    nuevo: () => ({ id: "", nombre: "", tipo: "Escuela", horas_vie: 0, horas_vie_centros: 0 }),
    columnasTabla: [["id", "Código"], ["nombre", "Nombre"], ["tipo", "Tipo"], ["horas_vie", "Horas VIE"], ["horas_vie_centros", "Horas VIE-Centros"]],
    campos: [["id", "Código", "txt", { esLlavePrimaria: true }], ["nombre", "Nombre", "txt"], ["tipo", "Tipo", "sel", { opciones: ["Escuela", "Centro", "Departamento"] }], ["horas_vie", "Horas VIE", "num"], ["horas_vie_centros", "Horas VIE-Centros", "num"]],
  },
  usuarios: {
    titulo: "Usuarios", llavePrimaria: "id", llavePrimariaManual: true,
    nuevo: () => ({ id: "u_" + Math.random().toString(36).slice(2, 8), nombre: "", email: "", cedula: "", orcid: "", plaza: "Propiedad", rol: "investigador", instancia_id: "", estado: "Activo" }),
    columnasTabla: [["nombre", "Nombre"], ["email", "Correo"], ["rol", "Rol"], ["instancia_id", "Instancia"], ["estado", "Estado"]],
    campos: [["nombre", "Nombre", "txt"], ["email", "Correo institucional", "txt"], ["cedula", "Cédula", "txt"], ["orcid", "ORCID", "txt"], ["rol", "Rol", "sel", { opciones: ROLES.map((rol) => [rol.id, rol.label]) }], ["instancia_id", "Instancia", "ref", { entidadReferida: "instancias", vacio: "Sin instancia" }], ["estado", "Estado", "sel", { opciones: ["Activo", "Inactivo"] }]],
  },
  comites: {
    titulo: "Comités técnicos", llavePrimaria: "id",
    nuevo: () => ({ instancia_id: "", nombre: "", coordinador_id: "", tamano: 5 }),
    columnasTabla: [["nombre", "Comité"], ["instancia_id", "Instancia"], ["coordinador_id", "Coordina", "usuarios"], ["tamano", "Integrantes"]],
    campos: [["nombre", "Nombre del comité", "txt"], ["instancia_id", "Instancia", "ref", { entidadReferida: "instancias", vacio: "Elija una instancia" }], ["coordinador_id", "Persona que coordina", "ref", { entidadReferida: "usuarios", vacio: "Elija una persona" }], ["tamano", "Cantidad de integrantes", "num"]],
  },
  catalogos: {
    titulo: "Catálogos", llavePrimaria: "id",
    nuevo: () => ({ catalogo: "", valor: "", puntos: "" }),
    columnasTabla: [["catalogo", "Catálogo"], ["valor", "Valor"], ["puntos", "Puntos"]],
    campos: [["catalogo", "Catálogo", "txt"], ["valor", "Valor", "txt"], ["puntos", "Puntos (opcional)", "num"]],
  },
  informes: {
    titulo: "Informes pendientes", llavePrimaria: "id",
    nuevo: () => ({ nombre: "", cedula: "", proyecto: "", detalle: "", estado: "Pendiente", registrado_por: "", fecha: new Date().toISOString().slice(0, 10) }),
    columnasTabla: [["nombre", "Persona"], ["proyecto", "Proyecto"], ["detalle", "Detalle"], ["estado", "Estado"], ["fecha", "Fecha"]],
    campos: [["nombre", "Nombre", "txt"], ["cedula", "Cédula", "txt"], ["proyecto", "Proyecto", "txt"], ["detalle", "Detalle", "txt"], ["estado", "Estado", "sel", { opciones: ["Pendiente", "Regularizado"] }], ["registrado_por", "Registrado por", "txt"], ["fecha", "Fecha", "date"]],
  },
};

function Mantenimiento({ ruta, listasDeApoyo }) {
  const { toast } = useApp();
  const entidad = ENTIDADES[ruta];
  const [filas, setFilas] = useState(null);
  const [error, setError] = useState("");
  const [registroEnEdicion, setRegistroEnEdicion] = useState(null);
  const [registroPorEliminar, setRegistroPorEliminar] = useState(null);
  const [aviso, setAviso] = useState("");

  const cargar = useCallback(async () => {
    setError("");
    try { setFilas(await llamar("GET", ruta)); } catch (error) { setFilas(null); setError(error.message === "Failed to fetch" ? T.sinServidor : error.message); }
  }, [ruta]);
  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async () => {
    setAviso("");
    try {
      const { _nuevo, ...datos } = registroEnEdicion;
      if (_nuevo) await llamar("POST", ruta, datos);
      else await llamar("PUT", `${ruta}/${registroEnEdicion[entidad.llavePrimaria]}`, datos);
      toast(_nuevo ? T.creado : T.actualizado);
      setRegistroEnEdicion(null);
      cargar();
    } catch (error) { setAviso(error.message); }
  };
  const eliminar = async () => {
    try {
      await llamar("DELETE", `${ruta}/${registroPorEliminar[entidad.llavePrimaria]}`);
      toast(T.eliminado);
      setRegistroPorEliminar(null);
      cargar();
    } catch (error) { toast(error.message, "error"); setRegistroPorEliminar(null); }
  };
  const nombreDe = (listaRegistros, id) => listaRegistros?.find((registro) => registro.id === id)?.nombre || id;

  return (
    <div className="stack-lg" style={{ marginTop: 12 }}>
      <div className="action-row">
        <Boton icon={Plus} onClick={() => setRegistroEnEdicion({ ...entidad.nuevo(), _nuevo: true })}>{T.nuevo}</Boton>
      </div>
      {error && (
        <div className="alert alert-error" role="alert">
          <span>{error}</span> <Boton variant="secondary" onClick={cargar}>{T.reintentar}</Boton>
        </div>
      )}
      {filas && (
        <Tabla
          columns={[
            ...entidad.columnasTabla.map(([clave, label, refTabla]) => ({ key: clave, label, render: (valor) => (refTabla ? nombreDe(listasDeApoyo?.[refTabla], valor) : valor ?? "") })),
            {
              key: "x", label: "",
              render: (_, registro) => (
                <div className="action-row">
                  <Boton variant="ghost" icon={PencilLine} onClick={() => setRegistroEnEdicion({ ...registro })}>{T.editar}</Boton>
                  <Boton variant="ghost" icon={Trash2} onClick={() => setRegistroPorEliminar(registro)}>{T.eliminar}</Boton>
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
        open={!!registroEnEdicion} onClose={() => setRegistroEnEdicion(null)} title={entidad.titulo}
        footer={<><Boton variant="secondary" onClick={() => setRegistroEnEdicion(null)}>{T.cancelar}</Boton><Boton onClick={guardar}>{T.guardar}</Boton></>}
      >
        {registroEnEdicion && (
          <div className="form-grid two-col">
            {entidad.campos.map(([clave, label, tipo, configCampo = {}]) =>
              tipo === "sel" ? (
                <Sel key={clave} label={label} value={registroEnEdicion[clave]} onChange={(valorCampo) => setRegistroEnEdicion({ ...registroEnEdicion, [clave]: valorCampo })} opciones={configCampo.opciones} />
              ) : tipo === "ref" ? (
                <Sel key={clave} label={label} value={registroEnEdicion[clave]} vacio={configCampo.vacio} onChange={(valorCampo) => setRegistroEnEdicion({ ...registroEnEdicion, [clave]: valorCampo })}
                  opciones={(listasDeApoyo?.[configCampo.entidadReferida] || []).map((registroReferido) => [registroReferido.id, registroReferido.nombre])} />
              ) : (
                <Txt key={clave} label={label} type={tipo === "num" ? "number" : tipo === "date" ? "date" : "text"} value={registroEnEdicion[clave]}
                  disabled={configCampo.esLlavePrimaria && !registroEnEdicion._nuevo} onChange={(valorCampo) => setRegistroEnEdicion({ ...registroEnEdicion, [clave]: configCampo.esLlavePrimaria ? valorCampo.toUpperCase() : valorCampo })} />
              ),
            )}
            {aviso && <p className="field-error" role="alert">{aviso}</p>}
          </div>
        )}
      </Ventana>
      <Ventana
        open={!!registroPorEliminar} onClose={() => setRegistroPorEliminar(null)} title={T.eliminar} description={T.confirmarEliminar}
        footer={<><Boton variant="secondary" onClick={() => setRegistroPorEliminar(null)}>{T.cancelar}</Boton><Boton icon={Trash2} onClick={eliminar}>{T.si}</Boton></>}
      />
    </div>
  );
}

export function AdmBaseDatos() {
  const [tab, setTab] = useState("instancias");
  const [listasDeApoyo, setListasDeApoyo] = useState({});
  useEffect(() => {
    // listas de apoyo para los campos que apuntan a otra tabla (instancias y usuarios)
    Promise.all([llamar("GET", "instancias"), llamar("GET", "usuarios")])
      .then(([instancias, usuarios]) => setListasDeApoyo({ instancias, usuarios }))
      .catch(() => {});
  }, [tab]);
  return (
    <div style={{ marginTop: 12 }}>
      <p>{T.aviso}</p>
      <Pestanas valor={tab} onChange={setTab} items={Object.entries(ENTIDADES).map(([claveEntidad, configEntidad]) => [claveEntidad, configEntidad.titulo])} />
      <Mantenimiento key={tab} ruta={tab} listasDeApoyo={listasDeApoyo} />
    </div>
  );
}
