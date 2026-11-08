// ============================================================
// Administración · comités
// Integrantes del Comité Técnico por instancia. ERS: RF-USR-09, RF-EVA-01.
// ============================================================
import { useEffect, useState } from "react";
import { Plus, Save } from "lucide-react";
import { Nota } from "../../componentes/comunes/Mensajes.jsx";
import { Chk, Sel, Tarjeta, Txt } from "../../componentes/formulario/campos.jsx";
import { Boton } from "../../componentes/ui/Boton.jsx";
import { Ventana } from "../../componentes/ui/Ventanas.jsx";
import { useApp } from "../../estado/contexto.js";
import { clone } from "../../utilidades/ids.js";
import { textos as T } from "../../textos/pantallas/administracion/AdmComites.js";

export function AdmComites() {
  const { db, act } = useApp();
  const [ins, setIns] = useState("COMP");
  const base = db.comites[ins] || { tamano: 5, asistenteId: "", integrantes: [] };
  const [c_, setC] = useState(clone(base));
  const [conf, setConf] = useState(false);
  useEffect(
    () => setC(clone(db.comites[ins] || { tamano: 5, asistenteId: "", integrantes: [] })),
    [ins],
  );
  const activos = db.users.filter((u) => u.estado === "Activo");
  const guardar = (confirmado) => {
    const n = c_.integrantes.filter((i) => i.activo !== false).length;
    if (n !== Number(c_.tamano) && !confirmado) return setConf(true);
    setConf(false);
    act("guardarComite", { instancia: ins, comite: { ...c_, tamano: Number(c_.tamano) } });
  };
  const upd = (i, k, v) =>
    setC({ ...c_, integrantes: c_.integrantes.map((x, j) => (j === i ? { ...x, [k]: v } : x)) });
  return (
    <div className="stack-lg" style={{ marginTop: 12 }}>
      <div className="form-grid two-col">
        <Sel
          label={T.instancia}
          value={ins}
          onChange={setIns}
          opciones={db.instancias.map((i) => [i.id, i.nombre])}
        />
        <Txt
          label={T.numeroDeIntegrantesConfigurado}
          type="number"
          min="1"
          value={c_.tamano}
          onChange={(v) => setC({ ...c_, tamano: v })}
        />
        <Sel
          label={T.asistenteDelComite}
          value={c_.asistenteId}
          onChange={(v) => setC({ ...c_, asistenteId: v })}
          vacio="Sin asignar"
          opciones={activos
            .filter((u) => u.roles.some((r) => r.rol === "comite_asistente"))
            .map((u) => [u.id, u.nombre])}
        />
      </div>
      <div className="stack-md">
        {c_.integrantes.map((i, k) => (
          <Tarjeta
            key={k}
            titulo={`Integrante ${k + 1}`}
            onQuitar={() => setC({ ...c_, integrantes: c_.integrantes.filter((_, j) => j !== k) })}
          >
            <div className="form-grid three-col">
              <Sel
                label={T.persona}
                value={i.userId}
                onChange={(v) => upd(k, "userId", v)}
                vacio="Seleccione"
                opciones={activos.map((u) => [u.id, u.nombre])}
              />
              <Txt
                label={T.vigenteDesde}
                type="date"
                value={i.desde}
                onChange={(v) => upd(k, "desde", v)}
              />
              <Txt
                label={T.vigenteHasta}
                type="date"
                value={i.hasta}
                onChange={(v) => upd(k, "hasta", v)}
              />
            </div>
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
              <Chk
                checked={i.coordina}
                onChange={(v) =>
                  setC({
                    ...c_,
                    integrantes: c_.integrantes.map((x, j) => ({
                      ...x,
                      coordina: j === k ? v : false,
                    })),
                  })
                }
              >
                {T.coordinaElComite}
              </Chk>
              <Chk checked={i.electo} onChange={(v) => upd(k, "electo", v)}>
                {T.personaElecta}
              </Chk>
              <Chk checked={i.activo !== false} onChange={(v) => upd(k, "activo", v)}>
                {T.activa}
              </Chk>
            </div>
          </Tarjeta>
        ))}
      </div>
      <div className="action-row">
        <Boton
          variant="secondary"
          icon={Plus}
          onClick={() =>
            setC({
              ...c_,
              integrantes: [
                ...c_.integrantes,
                {
                  userId: "",
                  coordina: false,
                  electo: true,
                  desde: "2026-01-01",
                  hasta: "2027-12-31",
                  activo: true,
                },
              ],
            })
          }
        >
          {T.agregarIntegrante}
        </Boton>
        <Boton icon={Save} onClick={() => guardar(false)}>
          {T.guardarComite}
        </Boton>
      </div>
      <Ventana
        open={conf}
        onClose={() => setConf(false)}
        title={T.elNumeroDeIntegrantesNo}
        description={`El comité tiene ${c_.integrantes.filter((i) => i.activo !== false).length} integrantes activos y el parámetro configurado es ${c_.tamano}.`}
        footer={
          <>
            <Boton variant="secondary" onClick={() => setConf(false)}>
              {T.volver}
            </Boton>
            <Boton onClick={() => guardar(true)}>{T.guardarDeTodosModos}</Boton>
          </>
        }
      >
        <Nota tipo="aviso">{T.puedeContinuarPeroConfirmeQue}</Nota>
      </Ventana>
    </div>
  );
}
