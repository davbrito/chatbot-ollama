import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { proxy } from "hono/proxy";
import * as z from "zod";
import { sessionJwtMiddleware, startSession } from "./auth";
import type { AppEnv } from "./config";

const app = new Hono<AppEnv>();

app.post("/api/auth/start-session", startSession);

app.use("/api/*", sessionJwtMiddleware);

const ttsSchema = z.object({
  text: z.string(),
});

app.post("/api/tts", sValidator("json", ttsSchema), async (c) => {
  const { text } = c.req.valid("json");
  const ELEVEN_LABS_API_KEY = c.env.ELEVEN_LABS_API_KEY;
  const voice = c.env.ELEVEN_LABS_VOICE_ID || "alloy";

  if (!ELEVEN_LABS_API_KEY) {
    return c.json({ error: "ElevenLabs API key not configured" }, 500);
  }

  const client = new ElevenLabsClient({ apiKey: ELEVEN_LABS_API_KEY });

  try {
    const speechStream = await client.textToSpeech.convert(voice, {
      text,
      modelId: "eleven_flash_v2_5",
      outputFormat: "mp3_44100_128",
    });

    return new Response(speechStream, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("ElevenLabs TTS error:", error);
    return c.json({ error: "Failed to generate speech" }, 500);
  }
});

app.use(
  "/api/tags",
  cache({
    cacheName: "ollama:tags",
    cacheControl: "public, max-age=3600",
  }),
);

app.get("/api/omdb/*", async (c) => {
  const url = new URL(c.req.url);

  const OMDB_API_KEY = c.env.OMDB_API_KEY;
  if (!OMDB_API_KEY) {
    return c.json(
      { Response: "False", Error: "OMDb API key not configured" },
      500,
    );
  }

  const targetUrl = new URL("https://www.omdbapi.com/");
  const searchParams = url.searchParams;
  targetUrl.search = searchParams.toString();
  targetUrl.searchParams.set("apikey", OMDB_API_KEY);

  return proxy(targetUrl, {
    method: c.req.method,
    signal: c.req.raw.signal,
  });
});

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
