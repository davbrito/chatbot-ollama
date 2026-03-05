import type { Message, ModelResponse } from "ollama/browser";
import { Ollama as OllamaClient } from "ollama/browser";

export const SYSTEM_PROMPTS: Message[] = [
  { role: "system", content: "Eres un asistente experto en películas." },
];

export const ollama = new OllamaClient({
  host: window.location.origin,
  headers: { "X-Github-Token": import.meta.env.GITHUB_TOKEN },
});

export async function listModels(): Promise<ModelResponse[]> {
  const { models } = await ollama.list();
  return models;
}
