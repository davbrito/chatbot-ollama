import { produce } from "immer";
import type { Message, ModelResponse } from "ollama/browser";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { listModels } from "../lib/ollama";
import { useConfigStore } from "./configStore";

export type CustomMessage = Message & { id: string; createdAt?: number };

interface ChatState {
  models: ModelResponse[];
  error: string | null;
  sessions: ChatSession[];
  activeSessionId: string | null;
}

export interface ChatSession {
  id: string;
  title: string;
  model: string;
  createdAt: number;
  updatedAt: number;
  messages: CustomMessage[];
}

interface ChatActions {
  fetchModels: () => Promise<void>;
  ensureActiveSession: () => string | null;
  createSession: (model: string) => string;
  deleteSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string) => void;
  setActiveSessionModel: (model: string) => void;
  clearActiveSession: () => void;
  updateSessionTitle(sessionId: string, sampleText: string): void;
  setSessionTitle(sessionId: string, title: string): void;
}

type ChatStateStore = ChatState & ChatActions;

function getSessionTitle(message: string) {
  if (!message) return "Nuevo chat";
  if (message.length <= 40) return message;
  return `${message.slice(0, 40)}…`;
}

function generateChatSession(model: string): ChatSession {
  const now = Date.now();

  return {
    id: crypto.randomUUID(),
    title: "",
    model,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export const useChatStore = create<ChatStateStore>()(
  persist(
    (set, get) => ({
      models: [],
      error: null,
      sessions: [],
      activeSessionId: null,

      fetchModels: async () => {
        try {
          const models = await listModels();
          set({ models, error: null });
        } catch (err) {
          set({
            error:
              err instanceof Error
                ? err.message
                : "No se pudieron obtener los modelos",
          });
        }
      },

      ensureActiveSession: () => {
        const { activeSessionId, sessions, models } = get();
        const activeExists =
          activeSessionId !== null &&
          sessions.some((session) => session.id === activeSessionId);

        if (activeExists && activeSessionId) {
          return activeSessionId;
        }

        const preferred = useConfigStore.getState().getDefaultModel();
        const defaultModel =
          models.find((m) => m.name === preferred)?.name ?? models[0]?.name;
        if (!defaultModel) {
          return null;
        }

        const newSession = generateChatSession(defaultModel);
        set({
          sessions: [newSession, ...sessions],
          activeSessionId: newSession.id,
        });

        return newSession.id;
      },

      createSession: (model) => {
        const newSession = generateChatSession(model);

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: newSession.id,
        }));

        return newSession.id;
      },

      deleteSession: (sessionId) => {
        set((state) => {
          const sessions = state.sessions.filter(
            (session) => session.id !== sessionId,
          );

          if (sessions.length === 0) {
            const preferred = useConfigStore.getState().getDefaultModel();
            const fallbackModel =
              state.models.find((m) => m.name === preferred)?.name ??
              state.models[0]?.name;
            if (!fallbackModel) {
              return {
                sessions: [],
                activeSessionId: null,
              };
            }

            const newSession = generateChatSession(fallbackModel);
            return {
              sessions: [newSession],
              activeSessionId: newSession.id,
            };
          }

          if (state.activeSessionId === sessionId) {
            return {
              sessions,
              activeSessionId: sessions[0].id,
            };
          }

          return { sessions };
        });
      },

      setActiveSession: (sessionId) => {
        set({ activeSessionId: sessionId });
      },

      setActiveSessionModel: (model) => {
        const { activeSessionId, sessions } = get();
        if (!activeSessionId) return;

        set({
          sessions: sessions.map((session) =>
            session.id === activeSessionId
              ? {
                  ...session,
                  model,
                  updatedAt: Date.now(),
                }
              : session,
          ),
        });
      },

      clearActiveSession: () => {
        const { activeSessionId, sessions } = get();
        if (!activeSessionId) return;

        const now = Date.now();
        set({
          sessions: sessions.map((session) =>
            session.id === activeSessionId
              ? {
                  ...session,
                  messages: [],
                  title: "Nuevo chat",
                  updatedAt: now,
                }
              : session,
          ),
        });
      },
      updateSessionTitle(sessionId, messages): void {
        set((state) =>
          produce(state, (state) => {
            const session = state.sessions.find((s) => s.id === sessionId);
            if (session) {
              session.title = getSessionTitle(messages);
              session.updatedAt = Date.now();
            }
          }),
        );
      },
      setSessionTitle(sessionId, title): void {
        set((state) =>
          produce(state, (state) => {
            const session = state.sessions.find((s) => s.id === sessionId);
            if (session) {
              session.title = title.trim();
              session.updatedAt = Date.now();
            }
          }),
        );
      },
    }),
    {
      name: "chat",
      version: 1,
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
        error: null,
        models: [],
      }),
    },
  ),
);
