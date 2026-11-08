# Fondos VIE 2027 · Prototipo funcional (SIGECI-VIE)

Prototipo del sistema de gestión de la convocatoria de proyectos de investigación (ERS v1.3).
No usa servidor ni base de datos: guarda todo en el navegador (localStorage).

## Comandos

```
npm install        # una sola vez: descarga las librerías
npm run dev        # abre el prototipo para desarrollar (se actualiza al guardar)
npm run build      # genera dist/index.html: UN solo archivo que se abre con doble clic
npm run format     # ordena el formato del código
```

## Dónde está cada cosa

La explicación carpeta por carpeta y archivo por archivo está en el documento de Word
**Guia_del_codigo_Fondos-VIE.docx**, que se entrega aparte (fuera de esta carpeta).

Resumen: `src/datos` (información fija), `src/reglas` (reglas del ERS), `src/acciones` (pasos del proceso),
`src/pantallas` y `src/componentes` (lo que se ve), `src/textos` (textos visibles) y `src/estilos` (diseño).

## Base de datos MySQL y CRUD (servidor/)

El prototipo incluye un servidor (Node + Express) con cinco mantenimientos CRUD completos
(crear, leer, actualizar y eliminar) sobre MySQL: **instancias, usuarios, comités técnicos, catálogos e informes pendientes**.
Se usan desde Administración → «Base de datos (MySQL)». El resto del prototipo sigue funcionando sin servidor.

1. Instale MySQL 8 y cree las tablas y los datos de ejemplo (desde la carpeta del proyecto):
   ```
   mysql -u root -p < servidor/schema.sql
   mysql -u root -p fondos_vie < servidor/seed.sql
   ```
2. Instale dependencias y arranque el servidor (puerto 3001). Si su MySQL tiene contraseña:
   - PowerShell: `$env:DB_PASSWORD="su_clave"; npm run servidor`
   - Otros: `DB_PASSWORD=su_clave npm run servidor`
   Variables opcionales: `DB_HOST`, `DB_USER`, `DB_NAME`, `PORT`.
3. En otra terminal: `npm run dev` y entre como Super Administrador → Administración → «Base de datos (MySQL)».

Archivos: `servidor/schema.sql` (tablas y llaves foráneas), `servidor/seed.sql` (datos; se regenera con `npm run seed`),
`servidor/entidades.js` (definición y validaciones de cada entidad), `servidor/crud.js` (rutas GET/POST/PUT/DELETE) y `servidor/server.js`.
Eliminar un registro con dependencias (por ejemplo una instancia con usuarios) es rechazado por MySQL y el sistema muestra un mensaje claro.
