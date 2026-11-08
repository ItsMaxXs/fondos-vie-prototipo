// ============================================================
// Campos · controles básicos de formulario
// CampoBusqueda: caja de búsqueda con lupa.
// GrupoCampo: etiqueta + control + ayuda/error.
// Entrada, Selector, AreaTexto: input, select y textarea con el estilo de la aplicación.
// PreguntaSiNo: pregunta con respuesta Sí/No que puede mostrar campos adicionales si es "Sí".
// CajaInstrucciones: recuadro de instrucciones con ícono de información.
// ============================================================
import { Info, Search } from "lucide-react";

export function CampoBusqueda({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <label className="search-field">
      <Search size={17} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

export function GrupoCampo({ label, hint, error, children }) {
  return (
    <label className={`field ${error ? "field-error" : ""}`}>
      <span className="field-label">{label}</span>
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error-text">{error}</span>}
    </label>
  );
}

export function Entrada(props) {
  return <input className="input" {...props} />;
}

export function Selector(props) {
  return <select className="input" {...props} />;
}

export function AreaTexto(props) {
  return <textarea className="input textarea" {...props} />;
}

export function PreguntaSiNo({ number, question, value, onChange, children }) {
  return (
    <div className="question-block">
      <div className="question-title">
        <span>{number}</span>
        <strong>{question}</strong>
      </div>
      <div className="choice-row">
        {["No", "Sí"].map((opcion) => (
          <label key={opcion} className={`radio-choice ${value === opcion ? "selected" : ""}`}>
            <input type="radio" checked={value === opcion} onChange={() => onChange(opcion)} />
            <span className="radio-dot" />
            <span>{opcion}</span>
          </label>
        ))}
      </div>
      {value === "Sí" && children && <div className="conditional-fields">{children}</div>}
    </div>
  );
}

export function CajaInstrucciones({ title, children }) {
  return (
    <div className="instruction-box">
      <Info size={18} />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}
