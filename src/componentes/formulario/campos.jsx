// ============================================================
// Componentes del formulario · campos y bloques
// getP/setP: leer y escribir un valor anidado ("a.b.c"). Txt, Area, Sel, Chk: campos ya conectados al formulario. Bloque, Tarjeta: agrupaciones. Incidencias: muestra errores/avisos del paso.
// ERS: CU-04.
// ============================================================
import { Trash2 } from "lucide-react";
import { Campo } from "../comunes/Campo.jsx";
import { Nota } from "../comunes/Mensajes.jsx";
import { Boton } from "../ui/Boton.jsx";
import { AreaTexto, Entrada, Selector } from "../ui/Campos.jsx";
import { palabras } from "../../utilidades/formato.js";
import { textos as T } from "../../textos/componentes/formulario/campos.js";

export const getP = (o, path) => path.split(".").reduce((x, k) => (x == null ? x : x[k]), o);

export const setP = (o, path, v) => {
  const ks = path.split(".");
  let x = o;
  ks.slice(0, -1).forEach((k) => (x = x[k]));
  x[ks[ks.length - 1]] = v;
};

// ---------- Campos reutilizables ----------
export function Txt({ label, hint, value, onChange, type = "text", error, ...r }) {
  return (
    <Campo label={label} hint={hint} error={error}>
      <Entrada type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...r} />
    </Campo>
  );
}

export function Area({ label, hint, value, onChange, rows = 5, max, error }) {
  const n = palabras(value);
  return (
    <Campo label={label} hint={hint} error={error}>
      <AreaTexto rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      <span className="field-hint" style={max && n > max ? { color: "#9b1c1c" } : undefined}>
        {n} {n === 1 ? T.palabra : T.palabras}
        {max ? ` de ${max} permitidas` : ""}
      </span>
    </Campo>
  );
}

export function Sel({ label, hint, value, onChange, opciones, vacio, error }) {
  return (
    <Campo label={label} hint={hint} error={error}>
      <Selector value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
        {vacio !== undefined && <option value="">{vacio}</option>}
        {opciones.map((o) =>
          Array.isArray(o) ? (
            <option key={o[0]} value={o[0]}>
              {o[1]}
            </option>
          ) : (
            <option key={o} value={o}>
              {o}
            </option>
          ),
        )}
      </Selector>
    </Campo>
  );
}

export function Chk({ children, checked, onChange }) {
  return (
    <label
      style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 14, cursor: "pointer" }}
    >
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 3 }}
      />
      <span>{children}</span>
    </label>
  );
}

export function Bloque({ n, titulo, children }) {
  return (
    <section className="form-section-block">
      <div className="numbered-title">
        <span>{n}</span>
        <h3>{titulo}</h3>
      </div>
      {children}
    </section>
  );
}

export function Tarjeta({ titulo, onQuitar, children, bloqueado }) {
  return (
    <div
      style={{
        border: "1px solid var(--ink-15, #d9dee5)",
        borderRadius: 12,
        padding: 14,
        display: "grid",
        gap: 12,
        background: "#fff",
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}
      >
        <strong style={{ fontSize: 14 }}>{titulo}</strong>
        {onQuitar && !bloqueado && (
          <Boton variant="ghost" icon={Trash2} onClick={onQuitar}>
            {T.quitar}
          </Boton>
        )}
      </div>
      {children}
    </div>
  );
}

export function Incidencias({ items }) {
  if (!items.length) return null;
  return (
    <div style={{ marginTop: 6 }}>
      {items.map((x, i) => (
        <Nota key={i} tipo={x.nivel === "error" ? "error" : "aviso"}>
          {x.msg}
          {x.regla ? <span style={{ opacity: 0.7 }}> · {x.regla}</span> : null}
        </Nota>
      ))}
    </div>
  );
}
