// Configuración de Vite.
// npm run build  → genera dist/index.html: UN SOLO archivo con todo (código, estilos y librerías)
// que se puede abrir con doble clic, enviar por correo o publicar tal cual.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: { target: "es2020" },
});
