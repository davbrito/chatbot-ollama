import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig((env) => {
  const { OLLAMA_API_KEY } = loadEnv(env.mode, process.cwd(), "");
  return {
    plugins: [
      react({}),
      babel({ presets: [reactCompilerPreset()] } as any),
      tailwindcss(),
      cloudflare({}),
    ],
    define: {
      HAS_OLLAMA_API_KEY: JSON.stringify(!!OLLAMA_API_KEY),
    },
    build: {
      minify: false,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
