import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "build",
  },
  server: {
    watch: {
      usePolling: true, // Esto puede ayudar si hay problemas con hot-reload en ciertos sistemas de archivos
    }
  },
  plugins: [react()],
});
