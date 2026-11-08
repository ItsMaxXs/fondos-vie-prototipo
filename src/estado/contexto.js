// ============================================================
// Estado · contexto de la aplicación
// useApp() entrega a cualquier pantalla: db (la base), act (ejecutar acción), toast, usuario, rol, ahora (reloj simulado), nav.
// Lo provee AppERS en App.jsx.
// ============================================================
import { createContext, useContext } from "react";

export const AppCtx = createContext(null);

export const useApp = () => useContext(AppCtx);
