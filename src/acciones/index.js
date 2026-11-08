// ============================================================
// Acciones · registro de todas las acciones
// ACCIONES reúne las acciones de todos los archivos de esta carpeta en un único objeto. Para agregar una acción nueva: escribirla en el archivo de su caso de uso (o crear uno) y registrarlo aquí.
// ============================================================
import { accionesAdministracion } from "./administracion.js";
import { accionesCompletitud } from "./completitud.js";
import { accionesComunicacionVIE } from "./comunicacionVIE.js";
import { accionesConsejo } from "./consejo.js";
import { accionesConsolidacion } from "./consolidacion.js";
import { accionesConvocatoria } from "./convocatoria.js";
import { accionesEvaluacion } from "./evaluacion.js";
import { accionesFormulacion } from "./formulacion.js";
import { accionesMorosidad } from "./morosidad.js";
import { accionesNotificacion } from "./notificacion.js";
import { accionesResolucionCIE } from "./resolucionCIE.js";
import { accionesSistema } from "./sistema.js";
import { accionesVerificacionVIE } from "./verificacionVIE.js";
import { accionesVinculacion } from "./vinculacion.js";

export const ACCIONES = {
  ...accionesFormulacion,
  ...accionesVinculacion,
  ...accionesCompletitud,
  ...accionesEvaluacion,
  ...accionesConsolidacion,
  ...accionesConsejo,
  ...accionesComunicacionVIE,
  ...accionesVerificacionVIE,
  ...accionesResolucionCIE,
  ...accionesNotificacion,
  ...accionesMorosidad,
  ...accionesConvocatoria,
  ...accionesAdministracion,
  ...accionesSistema,
};
