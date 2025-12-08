import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
  },
  server: {
    port: 3000,
    watch: {
      usePolling: true, // Esto puede ayudar si hay problemas con hot-reload en ciertos sistemas de archivos
    },
  },
  plugins: [react()],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  // Configurar variables de entorno para Vite
  envPrefix: "VITE_",
});
