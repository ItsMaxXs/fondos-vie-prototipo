// ============================================================
// Administración · sistema
// Importar, exportar y restablecer la base de la demostración.
// ============================================================
import { useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { Bloque, Txt } from "../../componentes/formulario/campos.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { Ventana } from "../../componentes/ui/Ventanas.jsx";
import { useApp } from "../../estado/contexto.js";
import { DB_KEY, SESSION_KEY } from "../../estado/persistencia.js";
import { num } from "../../utilidades/formato.js";
import { clone } from "../../utilidades/ids.js";
import { textos as T } from "../../textos/pantallas/administracion/AdmSistema.js";

export function AdmSistema() {
  const { db, setDb, toast, act } = useApp();
  const [min, setMin] = useState(db.ajustes?.sesionMinutos || 30);
  const [conf, setConf] = useState(false);
  const guardar = () => {
    const d = clone(db);
    d.ajustes = { ...(d.ajustes || {}), sesionMinutos: Math.max(1, num(min)) };
    setDb(d);
    toast("Ajustes guardados.");
  };
  const restablecer = () => {
    try {
      localStorage.removeItem(DB_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
    window.location.href = window.location.pathname;
  };
  return (
    <div className="stack-lg" style={{ marginTop: 12 }}>
      <Bloque n="1" titulo={T.seguridadDeLaSesion}>
        <Txt
          label={T.cierreDeSesionPorInactividad}
          type="number"
          min="1"
          value={min}
          onChange={setMin}
        />
        <div className="action-row">
          <Boton icon={Save} onClick={guardar}>
            {T.guardar}
          </Boton>
        </div>
      </Bloque>
      <Bloque n="2" titulo={T.datosDeDemostracion}>
        <p style={{ margin: 0, fontSize: 14 }}>{T.losDatosSeGuardanEn}</p>
        <div className="action-row">
          <Boton variant="danger" icon={RotateCcw} onClick={() => setConf(true)}>
            {T.restablecerDatosDeEjemplo}
          </Boton>
        </div>
      </Bloque>
      <Ventana
        open={conf}
        onClose={() => setConf(false)}
        title={T.restablecerDatos}
        description={T.sePerderanLosCambiosHechos}
        footer={
          <>
            <Boton variant="secondary" onClick={() => setConf(false)}>
              {T.cancelar}
            </Boton>
            <Boton variant="danger" onClick={restablecer}>
              {T.restablecer}
            </Boton>
          </>
        }
      >
        <span />
      </Ventana>
    </div>
  );
}
