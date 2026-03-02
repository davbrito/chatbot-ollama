import { Ollama as OllamaClient } from 'ollama';
import type { ModelResponse } from 'ollama';
import { createOllamaChat } from '@tanstack/ai-ollama';
import { stream } from '@tanstack/ai-react';
import { convertMessagesToModelMessages } from '@tanstack/ai';

export type { ModelResponse };

const OLLAMA_HOST = import.meta.env.VITE_OLLAMA_URL ?? 'http://localhost:11434';

export async function listModels(): Promise<ModelResponse[]> {
  const client = new OllamaClient({ host: OLLAMA_HOST });
  const { models } = await client.list();
  return models;
}

export function createOllamaConnection(model: string) {
  const adapter = createOllamaChat(model, OLLAMA_HOST);
  return stream((messages) => {
    const modelMessages = convertMessagesToModelMessages(messages);
    return adapter.chatStream({ model, messages: modelMessages });
  });
}
