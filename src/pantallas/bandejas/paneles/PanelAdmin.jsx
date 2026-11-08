// ============================================================
// Panel · Super Administrador
// Vista transversal: reutiliza los paneles de los demás roles.
// ============================================================
import { Nota } from "../../../componentes/comunes/Mensajes.jsx";
import { textos as T } from "../../../textos/pantallas/bandejas/paneles/PanelAdmin.js";

export function PanelAdmin({ p }) {
  return <Nota>{T.estaEnLaVistaDe}</Nota>;
}
