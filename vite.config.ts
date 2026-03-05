import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig((env) => {
  const { OLLAMA_URL, OLLAMA_API_KEY } = loadEnv(env.mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: OLLAMA_URL,
          changeOrigin: true,
          headers: {
            Authorization: `Bearer ${OLLAMA_API_KEY}`,
          },
        },
      },
    },
  };
});
