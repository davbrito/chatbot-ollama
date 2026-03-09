import "dotenv/config";

import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { proxy } from "hono/proxy";

const app = new Hono();
const PORT = Number(process.env.PORT) || 3000;

// 1. Proxy nativo hacia la API de Ollama
app.all("/api/*", async (c) => {
  // Extraemos la ruta solicitada (ej: /api/chat)
  const url = new URL(c.req.url);

  const OLLAMA_API_URL = process.env.OLLAMA_URL || "http://localhost:11434";
  const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;

  const targetUrl = `${OLLAMA_API_URL}${url.pathname}${url.search}${url.hash}`;

  const request = new Request(c.req.raw, {
    duplex: "half",
    headers: {
      ...(OLLAMA_API_KEY ? { Authorization: `Bearer ${OLLAMA_API_KEY}` } : {}),
    },
  });
  return proxy(targetUrl, request);
});

// 2. Servir la SPA generada por Vite (carpeta 'dist')
app.use("/*", serveStatic({ root: "./dist" }));

// 3. Fallback de la SPA (Vital para React/Vue Router)
app.get("*", serveStatic({ path: "./dist/index.html" }));

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`App iniciada en http://localhost:${info.port}`);
  },
);
