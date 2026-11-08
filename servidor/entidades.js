// ============================================================
// Servidor · definición de las cinco entidades con CRUD
// tabla, pk, columnas (editables), obligatorias y validaciones propias de cada una.
// ============================================================
const emailOk = (s) => /^\S+@\S+\.\S+$/.test(s || "");

export const ENTIDADES = {
  instancias: {
    tabla: "instancias", pk: "id", pkManual: true, orden: "nombre",
    columnas: ["nombre", "tipo", "horas_vie", "horas_vie_centros"],
    obligatorias: ["id", "nombre", "tipo"],
    etiquetas: { id: "Código", nombre: "Nombre" },
    validar: (b) => (Number(b.horas_vie) < 0 || Number(b.horas_vie_centros) < 0 ? "Las horas no pueden ser negativas." : null),
  },
  usuarios: {
    tabla: "usuarios", pk: "id", pkManual: true, orden: "nombre",
    columnas: ["nombre", "email", "cedula", "orcid", "plaza", "rol", "instancia_id", "estado"],
    obligatorias: ["id", "nombre", "email", "rol"],
    etiquetas: { id: "Identificador", nombre: "Nombre", email: "Correo", rol: "Rol" },
    validar: (b) => (emailOk(b.email) ? null : "Escriba un correo institucional válido."),
  },
  comites: {
    tabla: "comites", pk: "id", orden: "nombre",
    columnas: ["instancia_id", "nombre", "coordinador_id", "tamano"],
    obligatorias: ["instancia_id", "nombre", "coordinador_id"],
    etiquetas: { instancia_id: "Instancia", nombre: "Nombre", coordinador_id: "Coordinación" },
    validar: (b) => (Number(b.tamano) < 1 ? "El comité debe tener al menos 1 integrante." : null),
  },
  catalogos: {
    tabla: "catalogos", pk: "id", orden: "catalogo, valor",
    columnas: ["catalogo", "valor", "puntos"],
    obligatorias: ["catalogo", "valor"],
    etiquetas: { catalogo: "Catálogo", valor: "Valor" },
  },
  informes: {
    tabla: "informes_pendientes", pk: "id", orden: "fecha DESC",
    columnas: ["nombre", "cedula", "proyecto", "detalle", "estado", "registrado_por", "fecha"],
    obligatorias: ["nombre", "detalle", "fecha"],
    etiquetas: { nombre: "Nombre", detalle: "Detalle", fecha: "Fecha" },
  },
};
