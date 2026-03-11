import { produce } from "immer";
import type { Message, ModelResponse } from "ollama/browser";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { listModels } from "../lib/ollama";
import { useConfigStore } from "./configStore";

export interface MovieAttachment {
  title: string;
  year: string;
  imdbId: string;
  poster?: string;
}

export type CustomMessage = Message & {
  id: string;
  createdAt?: number;
  movie?: MovieAttachment;
};

interface ChatState {
  models: ModelResponse[];
  error: string | null;
  sessionsById: Record<string, ChatSession>;
  sessionOrder: string[];
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
  fetchModels: () => Promise<ModelResponse[]>;
  ensureActiveSession: () => string | null;
  createSession: (model: string) => string;
  deleteSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string | null) => void;
  setActiveSessionModel: (model: string) => void;
  clearActiveSession: () => void;
  updateSessionTitle(sessionId: string, sampleText: string): void;
  setSessionTitle(sessionId: string, title: string): void;
}

type ChatStateStore = ChatState & ChatActions;

export function getSessionTitle(message: string) {
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

function sortSessionOrder(sessionsById: Record<string, ChatSession>) {
  return Object.values(sessionsById)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((session) => session.id);
}

export const useChatStore = create<ChatStateStore>()(
  persist(
    (set, get) => ({
      models: [],
      error: null,
      sessionsById: {},
      sessionOrder: [],
      activeSessionId: null,

      fetchModels: async () => {
        try {
          const models = await listModels();
          models.sort((a, b) => a.name.localeCompare(b.name));
          set({ models, error: null });
          return models;
        } catch (err) {
          set({
            error:
              err instanceof Error
                ? err.message
                : "No se pudieron obtener los modelos",
          });
          return [];
        }
      },

      ensureActiveSession: () => {
        const { activeSessionId, sessionsById, models } = get();
        const activeExists =
          activeSessionId !== null && activeSessionId in sessionsById;

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
        const nextSessions = {
          ...sessionsById,
          [newSession.id]: newSession,
        };

        set({
          sessionsById: nextSessions,
          sessionOrder: sortSessionOrder(nextSessions),
          activeSessionId: newSession.id,
        });

        return newSession.id;
      },

      createSession: (model) => {
        const newSession = generateChatSession(model);

        set((state) => {
          const nextSessions = {
            ...state.sessionsById,
            [newSession.id]: newSession,
          };

          return {
            sessionsById: nextSessions,
            sessionOrder: sortSessionOrder(nextSessions),
            activeSessionId: newSession.id,
          };
        });

        return newSession.id;
      },

      deleteSession: (sessionId) => {
        set((state) => {
          const { [sessionId]: _, ...remainingSessions } = state.sessionsById;
          const remainingIds = Object.keys(remainingSessions);

          if (remainingIds.length === 0) {
            const preferred = useConfigStore.getState().getDefaultModel();
            const fallbackModel =
              state.models.find((m) => m.name === preferred)?.name ??
              state.models[0]?.name;
            if (!fallbackModel) {
              return {
                sessionsById: {},
                sessionOrder: [],
                activeSessionId: null,
              };
            }

            const newSession = generateChatSession(fallbackModel);
            return {
              sessionsById: {
                [newSession.id]: newSession,
              },
              sessionOrder: [newSession.id],
              activeSessionId: newSession.id,
            };
          }

          if (state.activeSessionId === sessionId) {
            const nextOrder = sortSessionOrder(remainingSessions);
            return {
              sessionsById: remainingSessions,
              sessionOrder: nextOrder,
              activeSessionId: nextOrder[0] ?? null,
            };
          }

          return {
            sessionsById: remainingSessions,
            sessionOrder: sortSessionOrder(remainingSessions),
          };
        });
      },

      setActiveSession: (sessionId) => {
        set({ activeSessionId: sessionId });
      },

      setActiveSessionModel: (model) => {
        const { activeSessionId, sessionsById } = get();
        if (!activeSessionId) return;

        const session = sessionsById[activeSessionId];
        if (!session) return;

        const updatedSession = {
          ...session,
          model,
          updatedAt: Date.now(),
        };

        const nextSessions = {
          ...sessionsById,
          [activeSessionId]: updatedSession,
        };

        set({
          sessionsById: nextSessions,
          sessionOrder: sortSessionOrder(nextSessions),
        });
      },

      clearActiveSession: () => {
        const { activeSessionId, sessionsById } = get();
        if (!activeSessionId) return;

        const session = sessionsById[activeSessionId];
        if (!session) return;

        const now = Date.now();
        const updatedSession = {
          ...session,
          messages: [],
          title: "Nuevo chat",
          updatedAt: now,
        };
        const nextSessions = {
          ...sessionsById,
          [activeSessionId]: updatedSession,
        };

        set({
          sessionsById: nextSessions,
          sessionOrder: sortSessionOrder(nextSessions),
        });
      },
      updateSessionTitle(sessionId, messages): void {
        set((state) =>
          produce(state, (state) => {
            const session = state.sessionsById[sessionId];
            if (session) {
              session.title = getSessionTitle(messages);
              session.updatedAt = Date.now();
            }
            state.sessionOrder = sortSessionOrder(state.sessionsById);
          }),
        );
      },
      setSessionTitle(sessionId, title): void {
        set((state) =>
          produce(state, (state) => {
            const session = state.sessionsById[sessionId];
            if (session) {
              session.title = title.trim();
              session.updatedAt = Date.now();
            }
            state.sessionOrder = sortSessionOrder(state.sessionsById);
          }),
        );
      },
    }),
    {
      name: "chat",
      version: 2,
      partialize: (state) => ({
        sessionsById: state.sessionsById,
        sessionOrder: state.sessionOrder,
        activeSessionId: state.activeSessionId,
        error: null,
        models: [],
      }),
    },
  ),
);
