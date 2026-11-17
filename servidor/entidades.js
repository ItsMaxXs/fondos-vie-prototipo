// ============================================================
// Servidor · definición de las cinco entidades con CRUD
// tabla, llavePrimaria, columnasEditables (editables), camposObligatorios y validaciones propias de cada una.
// ============================================================
const correoValido = (correo) => /^\S+@\S+\.\S+$/.test(correo || "");

export const ENTIDADES = {
  instancias: {
    tabla: "instancias", llavePrimaria: "id", llavePrimariaManual: true, ordenarPor: "nombre",
    columnasEditables: ["nombre", "tipo", "horas_vie", "horas_vie_centros"],
    camposObligatorios: ["id", "nombre", "tipo"],
    etiquetas: { id: "Código", nombre: "Nombre" },
    validar: (datos) => (Number(datos.horas_vie) < 0 || Number(datos.horas_vie_centros) < 0 ? "Las horas no pueden ser negativas." : null),
  },
  usuarios: {
    tabla: "usuarios", llavePrimaria: "id", llavePrimariaManual: true, ordenarPor: "nombre",
    columnasEditables: ["nombre", "email", "cedula", "orcid", "plaza", "rol", "instancia_id", "estado"],
    camposObligatorios: ["id", "nombre", "email", "rol"],
    etiquetas: { id: "Identificador", nombre: "Nombre", email: "Correo", rol: "Rol" },
    validar: (datos) => (correoValido(datos.email) ? null : "Escriba un correo institucional válido."),
  },
  comites: {
    tabla: "comites", llavePrimaria: "id", ordenarPor: "nombre",
    columnasEditables: ["instancia_id", "nombre", "coordinador_id", "tamano"],
    camposObligatorios: ["instancia_id", "nombre", "coordinador_id"],
    etiquetas: { instancia_id: "Instancia", nombre: "Nombre", coordinador_id: "Coordinación" },
    validar: (datos) => (Number(datos.tamano) < 1 ? "El comité debe tener al menos 1 integrante." : null),
  },
  catalogos: {
    tabla: "catalogos", llavePrimaria: "id", ordenarPor: "catalogo, valor",
    columnasEditables: ["catalogo", "valor", "puntos"],
    camposObligatorios: ["catalogo", "valor"],
    etiquetas: { catalogo: "Catálogo", valor: "Valor" },
  },
  informes: {
    tabla: "informes_pendientes", llavePrimaria: "id", ordenarPor: "fecha DESC",
    columnasEditables: ["nombre", "cedula", "proyecto", "detalle", "estado", "registrado_por", "fecha"],
    camposObligatorios: ["nombre", "detalle", "fecha"],
    etiquetas: { nombre: "Nombre", detalle: "Detalle", fecha: "Fecha" },
  },
};
