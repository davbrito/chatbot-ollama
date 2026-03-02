import { create } from 'zustand';
import { streamChat, listModels } from '../lib/ollama';
import type { ChatMessage, OllamaModel } from '../lib/ollama';

export type Message = ChatMessage & {
  id: string;
  loading?: boolean;
};

interface ChatState {
  messages: Message[];
  model: string;
  models: OllamaModel[];
  isStreaming: boolean;
  error: string | null;

  setModel: (model: string) => void;
  fetchModels: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  abortController: AbortController | null;
  stopStreaming: () => void;
}

function generateId(): string {
  return crypto.randomUUID();
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  model: '',
  models: [],
  isStreaming: false,
  error: null,
  abortController: null,

  setModel: (model) => set({ model }),

  fetchModels: async () => {
    try {
      const models = await listModels();
      set({ models, model: models[0]?.name ?? '', error: null });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch models' });
    }
  },

  sendMessage: async (content: string) => {
    const { model, messages, isStreaming } = get();
    if (isStreaming || !content.trim() || !model) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
    };

    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      loading: true,
    };

    set({
      messages: [...messages, userMessage, assistantMessage],
      isStreaming: true,
      error: null,
    });

    const controller = new AbortController();
    set({ abortController: controller });

    const history: ChatMessage[] = [...messages, userMessage].map(({ role, content }) => ({
      role,
      content,
    }));

    try {
      for await (const chunk of streamChat(model, history, controller.signal)) {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: m.content + chunk, loading: false }
              : m,
          ),
        }));
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantMessage.id ? { ...m, loading: false } : m,
          ),
          error: err instanceof Error ? err.message : 'An error occurred',
        }));
      }
    } finally {
      set({ isStreaming: false, abortController: null });
    }
  },

  clearMessages: () => set({ messages: [], error: null }),

  stopStreaming: () => {
    const { abortController } = get();
    abortController?.abort();
    set({ isStreaming: false, abortController: null });
  },
}));
