// ============================================================
// Punto de entrada: monta la aplicación en la página.
// HashRouter (rutas con #) permite abrir el HTML final con doble clic, sin servidor.
// Los estilos se cargan en este orden; el orden importa porque las últimas reglas ganan.
// ============================================================
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { AppERS } from "./App.jsx";

import "./estilos/base.css";
import "./estilos/estructura.css";
import "./estilos/componentes.css";
import "./estilos/pantallas.css";
import "./estilos/identidad-tec.css";
import "./estilos/ajustes-finales.css";
import "./estilos/prototipo-ers.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <AppERS />
    </HashRouter>
  </StrictMode>,
);
