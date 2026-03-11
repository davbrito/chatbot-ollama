import { produce, type WritableDraft } from "immer";
import throttle from "lodash-es/throttle";
import type { Message, ToolCall } from "ollama/browser";
import { useRef, useState } from "react";
import {
  getSessionTitle,
  useChatStore,
  type CustomMessage,
  type MovieAttachment,
} from "../store/chatStore";
import { useConfigStore } from "../store/configStore";
import { buildSystemPrompts, sendChat } from "./ollama";
import { callTool } from "./tools";

export function useChat({
  model,
  sessionId,
}: {
  model: string;
  sessionId?: string | null;
}) {
  const storeMessages =
    useChatStore((state) =>
      sessionId ? state.sessionsById[sessionId]?.messages : undefined,
    ) ?? [];

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getResolvedSessionId = (candidate?: string | null) => {
    if (candidate) return candidate;
    return useChatStore.getState().activeSessionId;
  };

  const updateMessage = (
    targetSessionId: string | null | undefined,
    messageId: string,
    updater: (prev: WritableDraft<CustomMessage>) => void,
  ) => {
    const resolvedSessionId = getResolvedSessionId(targetSessionId);
    if (!resolvedSessionId) return;

    useChatStore.setState((state) =>
      produce(state, (state) => {
        const session = state.sessionsById[resolvedSessionId];
        if (!session) return;
        const message = session.messages.find((msg) => msg.id === messageId);
        if (!message) return;
        updater(message);
      }),
    );
  };

  const setMessages = (
    targetSessionId: string | null | undefined,
    updater: (prev: WritableDraft<CustomMessage>[]) => void,
  ) => {
    const resolvedSessionId = getResolvedSessionId(targetSessionId);
    if (!resolvedSessionId) return;

    useChatStore.setState((state) =>
      produce(state, (state) => {
        const session = state.sessionsById[resolvedSessionId];
        if (!session) return;
        updater(session.messages);
        session.updatedAt = Date.now();
        state.sessionOrder = Object.values(state.sessionsById)
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((session) => session.id);
        if (!session.title && session.messages.length > 0) {
          const firstUserMessage = session.messages.find(
            (msg) => msg.role === "user" && msg.content.trim() !== "",
          );
          if (firstUserMessage) {
            session.title = getSessionTitle(firstUserMessage.content);
          }
        }
      }),
    );
  };

  const getMessages = (targetSessionId?: string | null) => {
    const resolvedSessionId = getResolvedSessionId(
      targetSessionId ?? sessionId,
    );
    if (!resolvedSessionId) return [];
    const session = useChatStore.getState().sessionsById[resolvedSessionId];
    return session?.messages ?? [];
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const clear = () => {
    setMessages(sessionId, (m) => {
      m.length = 0;
    });
    stop();
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const toModelMessages = (messages: CustomMessage[]): Message[] => {
    const result: Message[] = [];

    for (const message of messages) {
      if (message.role === "user" && message.movie) {
        result.push({
          role: "system",
          content: `El usuario adjuntó la siguiente película a su mensaje: ${JSON.stringify(message.movie)}. Úsala para entender mejor el contexto de lo que dice el usuario a continuación.`,
        });
      }

      if (message.role === "tool") {
        result.push({
          role: "tool",
          tool_name: message.tool_name,
          content: message.content,
        });
        continue;
      }

      if (message.role === "assistant") {
        result.push({
          role: "assistant",
          content: message.content,
          thinking: message.thinking,
          tool_calls: message.tool_calls,
        });
        continue;
      }

      result.push({ role: message.role, content: message.content });
    }

    return result;
  };

  const sendMessage = async (text: string, movie?: MovieAttachment) => {
    if (!text.trim() || isLoading) return;

    let targetSessionId = sessionId;
    if (!targetSessionId) {
      targetSessionId = useChatStore.getState().createSession(model);
    }

    if (!targetSessionId) return;

    setIsLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    const userMessage: CustomMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      movie,
    };

    const assistantMessageInit: CustomMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };
    const now = Date.now();
    userMessage.createdAt = now;
    assistantMessageInit.createdAt = now;

    setMessages(targetSessionId, (mssgs) => {
      mssgs.push(userMessage, assistantMessageInit);
    });

    try {
      // System prompt from lib/ollama.ts
      const favoriteGenres = useConfigStore.getState().getFavoriteGenres();
      const currentMessages = [
        ...buildSystemPrompts(favoriteGenres),
        ...toModelMessages(getMessages(targetSessionId).slice(0, -1)),
      ];

      const handleToolCalls = async (calls: ToolCall[]) => {
        let handledAny = false;

        for (const tool of calls) {
          handledAny = true;

          const result = await callTool(tool);

          currentMessages.push({
            role: "tool",
            tool_name: tool.function.name,
            content: result,
          });

          const toolMessageInit: CustomMessage = {
            id: crypto.randomUUID(),
            role: "tool",
            tool_name: tool.function.name,
            content: result,
          };

          toolMessageInit.createdAt = Date.now();

          setMessages(targetSessionId, (mssgs) => {
            mssgs.push(toolMessageInit);
          });
        }

        return handledAny;
      };

      let isToolCall = true;

      while (isToolCall) {
        isToolCall = false;

        const stream = await sendChat(model, currentMessages);

        const toolCalls: ToolCall[] = [];
        let assistantContent = "";
        let assistantThinking = "";

        const update = throttle(() => {
          updateMessage(
            targetSessionId,
            assistantMessageInit.id,
            (assistantMessage) => {
              if (assistantContent) assistantMessage.content = assistantContent;
              if (assistantThinking)
                assistantMessage.thinking = assistantThinking;
              if (toolCalls.length > 0) assistantMessage.tool_calls = toolCalls;
            },
          );
        }, 100);

        for await (const part of stream) {
          if (abortControllerRef.current?.signal.aborted) {
            break;
          }

          assistantContent += part.message.content ?? "";
          assistantThinking += part.message.thinking ?? "";

          if (part.message.tool_calls) {
            toolCalls.push(...part.message.tool_calls);
          }

          update();
        }

        update.flush();

        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        if (toolCalls.length > 0) {
          currentMessages.push({
            role: "assistant",
            content: assistantContent,
            thinking: assistantThinking || undefined,
            tool_calls: toolCalls,
          });

          isToolCall = await handleToolCalls(toolCalls);
        }
      }

      // Save updated messages back to store when done
      // handled in finally block
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return {
    messages: storeMessages,
    sendMessage,
    stop,
    isLoading,
    error,
    clear,
    clearError,
  };
}
