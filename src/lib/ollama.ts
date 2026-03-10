import type { Message, ModelResponse } from "ollama/browser";
import { Ollama as OllamaClient } from "ollama/browser";
import systemPromptText from "../assets/SYSTEM_PROMPT.md?raw";
import { getTools } from "./tools";
import { getTurnstileToken } from "./turnstile";

const BASE_SYSTEM_PROMPTS: Message[] = [
  { role: "system", content: systemPromptText },
];

export function buildSystemPrompts(favoriteGenres: string[]): Message[] {
  if (!favoriteGenres.length) {
    return BASE_SYSTEM_PROMPTS;
  }

  const genresPrompt = `Generos favoritos del usuario (priorizalos al recomendar y al perfilar gustos): ${favoriteGenres.join(", ")}.`;

  return [
    ...BASE_SYSTEM_PROMPTS,
    {
      role: "system",
      content: genresPrompt,
    },
  ];
}

export const ollama = new OllamaClient({
  host: window.location.origin,
  fetch: async (input, init) => {
    const token = await getTurnstileToken();
    const headers = new Headers(init?.headers);

    if (token) {
      headers.set("CF-Turnstile-Token", token);
    }

    return fetch(input, {
      ...init,
      headers,
    });
  },
  headers: {
    "X-Github-Token": import.meta.env.GITHUB_TOKEN,
  },
});

export async function listModels(): Promise<ModelResponse[]> {
  const { models } = await ollama.list();
  return models;
}

export function sendChat(model: string, messages: Message[]) {
  return ollama.chat({ model, messages, stream: true, tools: getTools() });
}
