// ============================================================
// Utilidades · descargas y documentos
// descargar: guarda un archivo en el equipo. csv: arma un CSV. abrirDocumento: abre un documento HTML listo para imprimir o guardar como PDF.
// ============================================================

// ---------- Descargas simuladas (CSV, JSON, documento imprimible) ----------
export function descargar(nombre, contenido, tipo = "text/plain") {
  try {
    const blob = new Blob([contenido], { type: `${tipo};charset=utf-8` });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 500);
  } catch (e) {}
}

export const csv = (filas) =>
  "﻿" +
  filas.map((f) => f.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");

export function abrirDocumento(titulo, cuerpoHtml) {
  const w = window.open("", "_blank");
  const html =
    "<!doctype html><html lang='es'><head><meta charset='utf-8'><title>" +
    titulo +
    "</title><style>body{font-family:Times New Roman,serif;max-width:760px;margin:32px auto;color:#111;line-height:1.45}" +
    "h1{font-size:19px;color:#002F6C;margin:0 0 6px}h2{font-size:15px;color:#002F6C;margin:18px 0 6px}" +
    ".hdr{border-bottom:3px solid #002F6C;padding-bottom:10px;margin-bottom:16px}.rojo{color:#EF3340;font-size:12px}" +
    "table{border-collapse:collapse;width:100%;margin:10px 0}td,th{border:1px solid #bbb;padding:5px 8px;font-size:13px;vertical-align:top;text-align:left}" +
    ".firma{display:inline-block;width:46%;margin:34px 2% 0;border-top:1px solid #111;text-align:center;font-size:12px;padding-top:4px}" +
    "@media print{.noprint{display:none}}</style></head><body>" +
    "<div class='hdr'><div class='rojo'>INSTITUTO TECNOLÓGICO DE COSTA RICA · VICERRECTORÍA DE INVESTIGACIÓN Y EXTENSIÓN</div><h1>" +
    titulo +
    "</h1></div>" +
    cuerpoHtml +
    "<p class='noprint' style='margin-top:26px'><button onclick='window.print()'>Imprimir / Guardar como PDF</button></p></body></html>";
  if (w) {
    w.document.open();
    w.document.write(html);
    w.document.close();
  } else {
    descargar(titulo.replace(/\W+/g, "_") + ".html", html, "text/html");
  }
}
