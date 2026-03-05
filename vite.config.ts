import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig((env) => {
  const { OLLAMA_URL, GITHUB_TOKEN } = loadEnv(env.mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss()],
    define: {
      "import.meta.env.GITHUB_TOKEN": GITHUB_TOKEN
        ? JSON.stringify(GITHUB_TOKEN)
        : undefined,
    },
    server: {
      proxy: {
        "/api": OLLAMA_URL,
      },
    },
  };
});
