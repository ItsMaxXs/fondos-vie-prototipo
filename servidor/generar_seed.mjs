// Genera servidor/seed.sql con los datos de ejemplo del prototipo (src/datos). Uso: node servidor/generar_seed.mjs
import { writeFileSync } from "node:fs";
import { INSTANCIAS_BASE, CATALOGOS_BASE } from "../src/datos/catalogos.js";
import { USUARIOS_BASE } from "../src/datos/usuarios.js";
const comillasSql = (valor) => (valor === null || valor === undefined || valor === "" ? "NULL" : `'${String(valor).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`);
const sentencias = ["USE fondos_vie;", "SET NAMES utf8mb4;"];
for (const instancia of INSTANCIAS_BASE)
  sentencias.push(`INSERT INTO instancias VALUES (${comillasSql(instancia.id)},${comillasSql(instancia.nombre)},${comillasSql(instancia.tipo || "Escuela")},${instancia.horasVIE || 0},${instancia.horasVIECentros || 0});`);
const idsInstancias = new Set(INSTANCIAS_BASE.map((instancia) => instancia.id));
for (const usuario of USUARIOS_BASE) {
  const instanciaSql = idsInstancias.has(usuario.instancia) ? comillasSql(usuario.instancia) : "NULL";
  const rol = typeof usuario.roles[0] === "string" ? usuario.roles[0] : usuario.roles[0].rol;
  sentencias.push(`INSERT INTO usuarios VALUES (${comillasSql(usuario.id)},${comillasSql(usuario.nombre)},${comillasSql(usuario.email)},${comillasSql(usuario.cedula)},${comillasSql(usuario.orcid)},${comillasSql(usuario.plaza)},${comillasSql(rol)},${instanciaSql},${comillasSql(usuario.estado)});`);
}
const comitesSeed = { COMP: ["Comité Técnico de Computación", "u_ev1"] };
for (const [instanciaId, [nombre, coordinadorId]] of Object.entries(comitesSeed)) sentencias.push(`INSERT INTO comites (instancia_id,nombre,coordinador_id,tamano) VALUES (${comillasSql(instanciaId)},${comillasSql(nombre)},${comillasSql(coordinadorId)},5);`);
for (const [catalogo, valoresCatalogo] of Object.entries(CATALOGOS_BASE))
  for (const valorCatalogo of valoresCatalogo) {
    const [valor, puntos] = Array.isArray(valorCatalogo) ? valorCatalogo : [valorCatalogo, null];
    if (typeof valor === "string") sentencias.push(`INSERT IGNORE INTO catalogos (catalogo,valor,puntos) VALUES (${comillasSql(catalogo)},${comillasSql(valor)},${puntos ?? "NULL"});`);
  }
sentencias.push(
  "INSERT INTO informes_pendientes (nombre,cedula,proyecto,detalle,estado,registrado_por,fecha) VALUES ('Mario Rojas','3-0321-0654','VIE-2024-018','Informe final del proyecto VIE-2024-018 sin entregar','Pendiente','Claudia Castro Gomez','2026-06-10');",
  "INSERT INTO informes_pendientes (nombre,cedula,proyecto,detalle,estado,registrado_por,fecha) VALUES ('David Mora','5-0222-0333','VIE-2023-007','Producto académico comprometido sin evidencia de sometimiento','Pendiente','Claudia Castro Gomez','2026-05-02');",
  "INSERT INTO informes_pendientes (nombre,cedula,proyecto,detalle,estado,registrado_por,fecha) VALUES ('Ana Solano','6-0444-0555','VIE-2022-011','Informe final entregado fuera de plazo','Regularizado','Claudia Castro Gomez','2026-03-15');",
);
writeFileSync(new URL("./seed.sql", import.meta.url), sentencias.join("\n") + "\n");
console.log("seed.sql generado:", sentencias.length - 2, "sentencias");
