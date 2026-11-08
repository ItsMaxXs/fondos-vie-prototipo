// ============================================================
// Servidor · API REST del prototipo (Node + Express + MySQL)
// Arranque:  npm run servidor   (usa servidor/.env o variables de entorno: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, PORT)
// ============================================================
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import { crearRouter } from "./crud.js";
import { ENTIDADES } from "./entidades.js";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fondos_vie",
  waitForConnections: true,
  connectionLimit: 5,
  charset: "utf8mb4",
  dateStrings: true,
});

const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/salud", async (_req, res) => {
  try { await pool.query("SELECT 1"); res.json({ ok: true }); }
  catch { res.status(503).json({ ok: false, error: "No hay conexión con MySQL." }); }
});
app.use("/api", crearRouter(pool, ENTIDADES));

const puerto = process.env.PORT || 3001;
app.listen(puerto, () => console.log(`API de Fondos VIE en http://localhost:${puerto}/api`));
