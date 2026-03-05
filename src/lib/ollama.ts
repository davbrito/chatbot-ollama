import { Ollama as OllamaClient } from "ollama";
import type { ModelResponse } from "ollama";
import { createOllamaChat } from "@tanstack/ai-ollama";
import { stream } from "@tanstack/ai-react";
import { convertMessagesToModelMessages } from "@tanstack/ai";

export type { ModelResponse };

const SYSTEM_PROMPT = `Preferir idioma español, pero responde en el idioma del mensaje del usuario.`;

export const ollama = new OllamaClient({
  host: window.location.origin,
  headers: { "X-Github-Token": import.meta.env.GITHUB_TOKEN },
});

export async function listModels(): Promise<ModelResponse[]> {
  const { models } = await ollama.list();
  return models;
}

export function createOllamaConnection(model: string) {
  const adapter = createOllamaChat(model, ollama as any);

  return stream((messages) => {
    const modelMessages = convertMessagesToModelMessages(messages);
    return adapter.chatStream({
      model,
      messages: modelMessages,
      systemPrompts: [SYSTEM_PROMPT],
    });
  });
}
