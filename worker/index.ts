import { Hono } from "hono";
import { proxy } from "hono/proxy";

const app = new Hono<{
  Bindings: {
    OLLAMA_URL?: string;
    OLLAMA_API_KEY: string;
  };
}>();

// 1. Proxy nativo hacia la API de Ollama
app.all("/api/*", async (c) => {
  // Extraemos la ruta solicitada (ej: /api/chat)
  const url = new URL(c.req.url);

  const OLLAMA_API_URL = c.env.OLLAMA_URL || "https://ollama.com";
  const OLLAMA_API_KEY = c.env.OLLAMA_API_KEY;

  const targetUrl = `${OLLAMA_API_URL}${url.pathname}${url.search}${url.hash}`;

  const request = new Request(c.req.raw);

  if (OLLAMA_API_KEY) {
    request.headers.set("Authorization", `Bearer ${OLLAMA_API_KEY}`);
  }

  return proxy(targetUrl, request);
});

export default app;
