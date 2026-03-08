import type { Message, ModelResponse } from "ollama/browser";
import { Ollama as OllamaClient } from "ollama/browser";
import systemPromptText from "../assets/SYSTEM_PROMPT.md?raw";
import { getTools } from "./tools";

export const SYSTEM_PROMPTS: Message[] = [
  { role: "system", content: systemPromptText },
];

export const ollama = new OllamaClient({
  host: window.location.origin,
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
