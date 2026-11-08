// Genera servidor/seed.sql con los datos de ejemplo del prototipo (src/datos). Uso: node servidor/generar_seed.mjs
import { writeFileSync } from "node:fs";
import { INSTANCIAS_BASE, CATALOGOS_BASE } from "../src/datos/catalogos.js";
import { USUARIOS_BASE } from "../src/datos/usuarios.js";
const q = (v) => (v === null || v === undefined || v === "" ? "NULL" : `'${String(v).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`);
const L = ["USE fondos_vie;", "SET NAMES utf8mb4;"];
for (const i of INSTANCIAS_BASE)
  L.push(`INSERT INTO instancias VALUES (${q(i.id)},${q(i.nombre)},${q(i.tipo || "Escuela")},${i.horasVIE || 0},${i.horasVIECentros || 0});`);
const ids = new Set(INSTANCIAS_BASE.map((i) => i.id));
for (const u of USUARIOS_BASE) {
  const inst = ids.has(u.instancia) ? q(u.instancia) : "NULL";
  const rol = typeof u.roles[0] === "string" ? u.roles[0] : u.roles[0].rol;
  L.push(`INSERT INTO usuarios VALUES (${q(u.id)},${q(u.nombre)},${q(u.email)},${q(u.cedula)},${q(u.orcid)},${q(u.plaza)},${q(rol)},${inst},${q(u.estado)});`);
}
const coms = { COMP: ["Comité Técnico de Computación", "u_ev1"] };
for (const [inst, [n, c]] of Object.entries(coms)) L.push(`INSERT INTO comites (instancia_id,nombre,coordinador_id,tamano) VALUES (${q(inst)},${q(n)},${q(c)},5);`);
for (const [cat, vals] of Object.entries(CATALOGOS_BASE))
  for (const v of vals) {
    const [valor, pts] = Array.isArray(v) ? v : [v, null];
    if (typeof valor === "string") L.push(`INSERT IGNORE INTO catalogos (catalogo,valor,puntos) VALUES (${q(cat)},${q(valor)},${pts ?? "NULL"});`);
  }
L.push(
  "INSERT INTO informes_pendientes (nombre,cedula,proyecto,detalle,estado,registrado_por,fecha) VALUES ('Mario Rojas','3-0321-0654','VIE-2024-018','Informe final del proyecto VIE-2024-018 sin entregar','Pendiente','Rodrigo Fallas','2026-06-10');",
  "INSERT INTO informes_pendientes (nombre,cedula,proyecto,detalle,estado,registrado_por,fecha) VALUES ('David Mora','5-0222-0333','VIE-2023-007','Producto académico comprometido sin evidencia de sometimiento','Pendiente','Rodrigo Fallas','2026-05-02');",
  "INSERT INTO informes_pendientes (nombre,cedula,proyecto,detalle,estado,registrado_por,fecha) VALUES ('Ana Solano','6-0444-0555','VIE-2022-011','Informe final entregado fuera de plazo','Regularizado','Rodrigo Fallas','2026-03-15');",
);
writeFileSync(new URL("./seed.sql", import.meta.url), L.join("\n") + "\n");
console.log("seed.sql generado:", L.length - 2, "sentencias");
