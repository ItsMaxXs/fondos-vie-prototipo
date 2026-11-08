// ============================================================
// Servidor · CRUD genérico sobre MySQL
// crearRouter(pool, entidades): por cada entidad publica
//   GET /api/<ruta> (leer todos)   GET /api/<ruta>/:id (leer uno)
//   POST /api/<ruta> (crear)       PUT /api/<ruta>/:id (actualizar)   DELETE /api/<ruta>/:id (eliminar)
// Las consultas usan parámetros (?) para evitar inyección SQL.
// ============================================================
import { Router } from "express";

// Traduce errores de MySQL a mensajes claros para la persona usuaria
export function mensajeError(e) {
  if (e.code === "ER_DUP_ENTRY") return [409, "Ya existe un registro con ese valor."];
  if (e.code === "ER_ROW_IS_REFERENCED_2")
    return [409, "No se puede eliminar: hay otros registros que dependen de este. Elimine o cambie primero esos registros."];
  if (e.code === "ER_NO_REFERENCED_ROW_2") return [400, "El valor elegido en una lista no existe."];
  if (e.code === "ER_CHECK_CONSTRAINT_VIOLATED") return [400, "Hay un valor fuera del rango permitido."];
  return [500, "Error del servidor de base de datos."];
}

export function crearRouter(pool, entidades) {
  const router = Router();
  for (const [ruta, e] of Object.entries(entidades)) {
    const cols = e.columnas;
    const sel = `SELECT * FROM ${e.tabla}`;

    // Valida los datos recibidos y devuelve un texto de error o null
    const validar = (b, nuevo) => {
      for (const c of e.obligatorias) if (b[c] === undefined || b[c] === null || String(b[c]).trim() === "") return `Falta el campo «${e.etiquetas?.[c] || c}».`;
      return e.validar ? e.validar(b, nuevo) : null;
    };
    const valores = (b) => cols.map((c) => (b[c] === "" || b[c] === undefined ? null : b[c]));

    router.get(`/${ruta}`, async (_req, res) => {
      try {
        const [rows] = await pool.query(`${sel} ORDER BY ${e.orden}`);
        res.json(rows);
      } catch (err) { const [s, m] = mensajeError(err); res.status(s).json({ error: m }); }
    });

    router.get(`/${ruta}/:id`, async (req, res) => {
      try {
        const [rows] = await pool.query(`${sel} WHERE ${e.pk} = ?`, [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: "Registro no encontrado." });
        res.json(rows[0]);
      } catch (err) { const [s, m] = mensajeError(err); res.status(s).json({ error: m }); }
    });

    router.post(`/${ruta}`, async (req, res) => {
      const b = req.body || {};
      const err0 = validar(b, true);
      if (err0) return res.status(400).json({ error: err0 });
      try {
        const lista = e.pkManual ? [e.pk, ...cols] : cols;
        const vals = e.pkManual ? [b[e.pk], ...valores(b)] : valores(b);
        const [r] = await pool.query(
          `INSERT INTO ${e.tabla} (${lista.join(",")}) VALUES (${lista.map(() => "?").join(",")})`, vals);
        const id = e.pkManual ? b[e.pk] : r.insertId;
        const [rows] = await pool.query(`${sel} WHERE ${e.pk} = ?`, [id]);
        res.status(201).json(rows[0]);
      } catch (err) { const [s, m] = mensajeError(err); res.status(s).json({ error: m }); }
    });

    router.put(`/${ruta}/:id`, async (req, res) => {
      const b = req.body || {};
      const err0 = validar(b, false);
      if (err0) return res.status(400).json({ error: err0 });
      try {
        const [r] = await pool.query(
          `UPDATE ${e.tabla} SET ${cols.map((c) => `${c} = ?`).join(", ")} WHERE ${e.pk} = ?`,
          [...valores(b), req.params.id]);
        if (!r.affectedRows) return res.status(404).json({ error: "Registro no encontrado." });
        const [rows] = await pool.query(`${sel} WHERE ${e.pk} = ?`, [req.params.id]);
        res.json(rows[0]);
      } catch (err) { const [s, m] = mensajeError(err); res.status(s).json({ error: m }); }
    });

    router.delete(`/${ruta}/:id`, async (req, res) => {
      try {
        const [r] = await pool.query(`DELETE FROM ${e.tabla} WHERE ${e.pk} = ?`, [req.params.id]);
        if (!r.affectedRows) return res.status(404).json({ error: "Registro no encontrado." });
        res.json({ ok: true });
      } catch (err) { const [s, m] = mensajeError(err); res.status(s).json({ error: m }); }
    });
  }
  return router;
}
