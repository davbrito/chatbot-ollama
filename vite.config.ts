import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig((env) => {
  const { OLLAMA_URL } = loadEnv(env.mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss()],
    define: {
      "import.meta.env.GITHUB_TOKEN": JSON.stringify(process.env.GITHUB_TOKEN),
    },
    resolve: {
      alias: {
        // Force the browser-compatible build of the ollama package so that
        // Node.js built-ins (node:fs, node:path) are not bundled.
        ollama: "ollama/browser",
      },
    },
    server: {
      proxy: {
        "/api": OLLAMA_URL,
      },
    },
  };
});
