// ============================================================
// Pantalla · administración (contenedor)
// Pestañas de administración. Cada pestaña es un archivo de esta carpeta.
// ERS: CU-03, CU-17, CU-18.
// ============================================================
import { useState } from "react";
import { Pestanas } from "../../componentes/comunes/Pestanas.jsx";
import { Caja } from "../../componentes/ui/Caja.jsx";
import { EncabezadoPagina } from "../../componentes/ui/Encabezados.jsx";
import { AdmBaseDatos } from "./AdmBaseDatos.jsx";
import { AdmBitacora } from "./AdmBitacora.jsx";
import { AdmCatalogos } from "./AdmCatalogos.jsx";
import { AdmComites } from "./AdmComites.jsx";
import { AdmCorreos } from "./AdmCorreos.jsx";
import { AdmInstancias } from "./AdmInstancias.jsx";
import { AdmParametros } from "./AdmParametros.jsx";
import { AdmRoles } from "./AdmRoles.jsx";
import { AdmRubricas } from "./AdmRubricas.jsx";
import { AdmSistema } from "./AdmSistema.jsx";
import { AdmUsuarios } from "./AdmUsuarios.jsx";
import { textos as T } from "../../textos/pantallas/administracion/Administracion.js";

export function Administracion() {
  const [tab, setTab] = useState("usuarios");
  const tabs = [
    ["usuarios", "Usuarios"],
    ["roles", "Roles"],
    ["comites", "Comités"],
    ["instancias", "Instancias"],
    ["params", "Parámetros"],
    ["rubricas", "Rúbricas"],
    ["catalogos", "Catálogos"],
    ["bitacora", "Bitácora"],
    ["correos", "Correos"],
    ["bd", "Base de datos (MySQL)"],
    ["sistema", "Sistema"],
  ];
  return (
    <div>
      <EncabezadoPagina
        eyebrow={T.administracion}
        title={T.configuracionDelSistema}
        description={T.todoLoQueCambiaEn}
      />
      <Caja>
        <Pestanas valor={tab} onChange={setTab} items={tabs} />
        {tab === "usuarios" && <AdmUsuarios />}
        {tab === "roles" && <AdmRoles />}
        {tab === "comites" && <AdmComites />}
        {tab === "instancias" && <AdmInstancias />}
        {tab === "params" && <AdmParametros />}
        {tab === "rubricas" && <AdmRubricas />}
        {tab === "catalogos" && <AdmCatalogos />}
        {tab === "bitacora" && <AdmBitacora />}
        {tab === "correos" && <AdmCorreos />}
        {tab === "bd" && <AdmBaseDatos />}
        {tab === "sistema" && <AdmSistema />}
      </Caja>
    </div>
  );
}
