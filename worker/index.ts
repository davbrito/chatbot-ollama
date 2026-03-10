import { Hono } from "hono";
import { proxy } from "hono/proxy";
import { sessionJwtMiddleware, startSession } from "./auth";
import type { AppEnv } from "./config";

const app = new Hono<AppEnv>();

app.post("/api/auth/start-session", startSession);

app.use("/api/*", sessionJwtMiddleware);

app.all("/api/*", async (c) => {
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
