// ============================================================
// Bandejas · registro de paneles por rol
// BANDEJAS asocia cada rol con el panel que se muestra al abrir un expediente. Para agregar un rol nuevo: crear su panel y registrarlo aquí.
// ============================================================
import { PanelAdmin } from "./paneles/PanelAdmin.jsx";
import { PanelAsistenteComite } from "./paneles/PanelAsistenteComite.jsx";
import { PanelAsistenteConsejo } from "./paneles/PanelAsistenteConsejo.jsx";
import { PanelCIE } from "./paneles/PanelCIE.jsx";
import { PanelConsejo } from "./paneles/PanelConsejo.jsx";
import { PanelDI } from "./paneles/PanelDI.jsx";
import { PanelEscuela } from "./paneles/PanelEscuela.jsx";
import { PanelEvaluador } from "./paneles/PanelEvaluador.jsx";
import { PanelGestora } from "./paneles/PanelGestora.jsx";
import { PanelVinculacion } from "./paneles/PanelVinculacion.jsx";

// ---------- Registro de bandejas por rol ----------
export const BANDEJAS = {
  vinculacion: { panel: PanelVinculacion },
  comite_asistente: { panel: PanelAsistenteComite },
  comite_evaluador: { panel: PanelEvaluador },
  consejo_asistente: { panel: PanelAsistenteConsejo },
  consejo: { panel: PanelConsejo },
  direccion_escuela: { panel: PanelEscuela },
  gestora_vie: { panel: PanelGestora },
  cie: { panel: PanelCIE },
  direccion_investigacion: { panel: PanelDI },
  admin: { panel: PanelAdmin },
};
