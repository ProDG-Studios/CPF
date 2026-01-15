import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  preview: {
    host: "::",
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
    allowedHosts: [
      "vggcpf.onrender.com",
      ".onrender.com",
      "localhost",
      "127.0.0.1",
    ],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
