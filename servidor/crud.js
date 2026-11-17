// ============================================================
// Servidor · CRUD genérico sobre MySQL
// crearRouter(pool, entidades): por cada entidad publica
//   GET /api/<ruta> (leer todos)   GET /api/<ruta>/:id (leer uno)
//   POST /api/<ruta> (crear)       PUT /api/<ruta>/:id (actualizar)   DELETE /api/<ruta>/:id (eliminar)
// Las consultas usan parámetros (?) para evitar inyección SQL.
// ============================================================
import { Router } from "express";

// Traduce errores de MySQL a mensajes claros para la persona usuaria
export function mensajeError(error) {
  if (error.code === "ER_DUP_ENTRY") return [409, "Ya existe un registro con ese valor."];
  if (error.code === "ER_ROW_IS_REFERENCED_2")
    return [409, "No se puede eliminar: hay otros registros que dependen de este. Elimine o cambie primero esos registros."];
  if (error.code === "ER_NO_REFERENCED_ROW_2") return [400, "El valor elegido en una lista no existe."];
  if (error.code === "ER_CHECK_CONSTRAINT_VIOLATED") return [400, "Hay un valor fuera del rango permitido."];
  return [500, "Error del servidor de base de datos."];
}

export function crearRouter(pool, entidades) {
  const router = Router();
  for (const [ruta, entidad] of Object.entries(entidades)) {
    const columnasEditables = entidad.columnasEditables;
    const consultaSeleccion = `SELECT * FROM ${entidad.tabla}`;

    // Valida los datos recibidos y devuelve un texto de error o null
    const validar = (datos, nuevo) => {
      for (const campo of entidad.camposObligatorios) if (datos[campo] === undefined || datos[campo] === null || String(datos[campo]).trim() === "") return `Falta el campo «${entidad.etiquetas?.[campo] || campo}».`;
      return entidad.validar ? entidad.validar(datos, nuevo) : null;
    };
    const valores = (datos) => columnasEditables.map((columna) => (datos[columna] === "" || datos[columna] === undefined ? null : datos[columna]));

    router.get(`/${ruta}`, async (_solicitud, respuesta) => {
      try {
        const [filas] = await pool.query(`${consultaSeleccion} ORDER BY ${entidad.ordenarPor}`);
        respuesta.json(filas);
      } catch (error) { const [codigoHttp, mensaje] = mensajeError(error); respuesta.status(codigoHttp).json({ error: mensaje }); }
    });

    router.get(`/${ruta}/:id`, async (solicitud, respuesta) => {
      try {
        const [filas] = await pool.query(`${consultaSeleccion} WHERE ${entidad.llavePrimaria} = ?`, [solicitud.params.id]);
        if (!filas.length) return respuesta.status(404).json({ error: "Registro no encontrado." });
        respuesta.json(filas[0]);
      } catch (error) { const [codigoHttp, mensaje] = mensajeError(error); respuesta.status(codigoHttp).json({ error: mensaje }); }
    });

    router.post(`/${ruta}`, async (solicitud, respuesta) => {
      const datos = solicitud.body || {};
      const mensajeValidacion = validar(datos, true);
      if (mensajeValidacion) return respuesta.status(400).json({ error: mensajeValidacion });
      try {
        const columnasInsertar = entidad.llavePrimariaManual ? [entidad.llavePrimaria, ...columnasEditables] : columnasEditables;
        const valoresInsertar = entidad.llavePrimariaManual ? [datos[entidad.llavePrimaria], ...valores(datos)] : valores(datos);
        const [resultado] = await pool.query(
          `INSERT INTO ${entidad.tabla} (${columnasInsertar.join(",")}) VALUES (${columnasInsertar.map(() => "?").join(",")})`, valoresInsertar);
        const id = entidad.llavePrimariaManual ? datos[entidad.llavePrimaria] : resultado.insertId;
        const [filas] = await pool.query(`${consultaSeleccion} WHERE ${entidad.llavePrimaria} = ?`, [id]);
        respuesta.status(201).json(filas[0]);
      } catch (error) { const [codigoHttp, mensaje] = mensajeError(error); respuesta.status(codigoHttp).json({ error: mensaje }); }
    });

    router.put(`/${ruta}/:id`, async (solicitud, respuesta) => {
      const datos = solicitud.body || {};
      const mensajeValidacion = validar(datos, false);
      if (mensajeValidacion) return respuesta.status(400).json({ error: mensajeValidacion });
      try {
        const [resultado] = await pool.query(
          `UPDATE ${entidad.tabla} SET ${columnasEditables.map((columna) => `${columna} = ?`).join(", ")} WHERE ${entidad.llavePrimaria} = ?`,
          [...valores(datos), solicitud.params.id]);
        if (!resultado.affectedRows) return respuesta.status(404).json({ error: "Registro no encontrado." });
        const [filas] = await pool.query(`${consultaSeleccion} WHERE ${entidad.llavePrimaria} = ?`, [solicitud.params.id]);
        respuesta.json(filas[0]);
      } catch (error) { const [codigoHttp, mensaje] = mensajeError(error); respuesta.status(codigoHttp).json({ error: mensaje }); }
    });

    router.delete(`/${ruta}/:id`, async (solicitud, respuesta) => {
      try {
        const [resultado] = await pool.query(`DELETE FROM ${entidad.tabla} WHERE ${entidad.llavePrimaria} = ?`, [solicitud.params.id]);
        if (!resultado.affectedRows) return respuesta.status(404).json({ error: "Registro no encontrado." });
        respuesta.json({ ok: true });
      } catch (error) { const [codigoHttp, mensaje] = mensajeError(error); respuesta.status(codigoHttp).json({ error: mensaje }); }
    });
  }
  return router;
}
