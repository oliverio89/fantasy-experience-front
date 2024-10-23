import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/", // Ajusta si necesitas servir desde un subdirectorio
  build: {
    outDir: "dist",
  },
  server: {
    watch: {
      usePolling: true, // Esto puede ayudar si hay problemas con hot-reload en ciertos sistemas de archivos
    },
  },
  plugins: [react()],
});
