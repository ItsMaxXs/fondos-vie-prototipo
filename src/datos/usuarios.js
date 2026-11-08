// ============================================================
// Datos · usuarios de demostración
// mkUser arma un usuario. USUARIOS_BASE: las 20 personas de ejemplo con sus roles e instancias.
// Para entrar en la demo se elige una de estas personas en la pantalla de inicio de sesión.
// ============================================================

const mkUser = (id, nombre, email, roles, extra = {}) => ({
  id,
  nombre,
  email,
  cedula: extra.cedula || "",
  orcid: extra.orcid || "",
  plaza: extra.plaza || "Propiedad",
  instancia: extra.instancia || "COMP",
  estado: "Activo",
  roles: roles.map((r) =>
    typeof r === "string" ? { rol: r, instancia: extra.instancia || "COMP" } : r,
  ),
});

export const USUARIOS_BASE = [
  mkUser("u_admin", "Steadman Murillo", "smurillo@tec.ac.cr", ["admin"], { instancia: "" }),
  mkUser("u_vie", "Laura Solano", "lsolano@tec.ac.cr", ["vie_publicacion"], { instancia: "" }),
  mkUser("u_inv1", "María Rodríguez", "mrodriguez@tec.ac.cr", ["investigador"], {
    cedula: "1-1234-5678",
    orcid: "0000-0002-3141-7782",
  }),
  mkUser("u_inv2", "Carlos Jiménez", "cjimenez@tec.ac.cr", ["investigador"], {
    cedula: "1-0987-6543",
    orcid: "0000-0001-7788-2210",
  }),
  mkUser("u_inv3", "Laura Vega", "lvega@tec.ac.cr", ["investigador"], {
    cedula: "2-0456-0789",
    orcid: "0000-0003-5521-9087",
  }),
  mkUser("u_inv4", "Mario Rojas", "mrojas@tec.ac.cr", ["investigador"], {
    cedula: "3-0321-0654",
    orcid: "0000-0002-6643-1190",
  }),
  mkUser("u_inv5", "José Méndez", "jmendez@tec.ac.cr", ["investigador"], {
    cedula: "1-1111-2222",
    orcid: "0000-0001-1147-6209",
    instancia: "ELEC",
  }),
  mkUser("u_inv6", "Pablo Chacón", "pchacon@tec.ac.cr", ["investigador"], {
    cedula: "4-0123-0456",
    orcid: "0000-0002-9981-3345",
  }),
  mkUser("u_vin", "Sofía Vargas", "svargas@tec.ac.cr", [{ rol: "vinculacion", instancia: "" }], {
    instancia: "",
  }),
  mkUser("u_asc", "Andrés Salazar", "asalazar@tec.ac.cr", ["comite_asistente"]),
  mkUser("u_ev1", "Luis Alvarado", "lalvarado@tec.ac.cr", ["comite_evaluador", "consejo"]),
  mkUser("u_dir", "Patricia Soto", "psoto@tec.ac.cr", [
    "direccion_escuela",
    "comite_evaluador",
    { rol: "consejo", instancia: "COMP", preside: true },
  ]),
  mkUser("u_ev3", "Diego Araya", "daraya@tec.ac.cr", ["comite_evaluador", "consejo"]),
  mkUser("u_ev4", "Elena Campos", "ecampos@tec.ac.cr", ["comite_evaluador", "consejo"]),
  mkUser("u_ev5", "Jorge Brenes", "jbrenes@tec.ac.cr", ["comite_evaluador", "consejo"]),
  mkUser("u_cons6", "Marta Chaves", "mchaves@tec.ac.cr", ["consejo"]),
  mkUser("u_asco", "Paola Mora", "pmora@tec.ac.cr", ["consejo_asistente"]),
  mkUser("u_gest", "Ana Quesada", "aquesada@tec.ac.cr", [{ rol: "gestora_vie", instancia: "" }], {
    instancia: "",
  }),
  mkUser("u_cie", "Daniela Mora", "dmora@tec.ac.cr", [{ rol: "cie", instancia: "" }], {
    instancia: "",
  }),
  mkUser(
    "u_di",
    "Rodrigo Fallas",
    "rfallas@tec.ac.cr",
    [{ rol: "direccion_investigacion", instancia: "" }],
    { instancia: "" },
  ),
];
