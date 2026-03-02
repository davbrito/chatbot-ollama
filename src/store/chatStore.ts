import { create } from 'zustand';
import { listModels } from '../lib/ollama';
import type { ModelResponse } from '../lib/ollama';

interface ModelState {
  model: string;
  models: ModelResponse[];
  error: string | null;
  setModel: (model: string) => void;
  fetchModels: () => Promise<void>;
}

export const useModelStore = create<ModelState>((set) => ({
  model: '',
  models: [],
  error: null,

  setModel: (model) => set({ model }),

  fetchModels: async () => {
    try {
      const models = await listModels();
      set({ models, model: models[0]?.name ?? '', error: null });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch models' });
    }
  },
}));
