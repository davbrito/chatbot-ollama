import { produce, type WritableDraft } from "immer";
import type { ToolCall } from "ollama/browser";
import { useRef, useState } from "react";
import { useChatStore, type CustomMessage } from "../store/chatStore";
import { sendChat, SYSTEM_PROMPTS } from "./ollama";
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

  const updateMessage = (
    messageId: string,
    updater: (prev: WritableDraft<CustomMessage>) => void,
  ) => {
    if (!sessionId) return;
    useChatStore.setState((state) =>
      produce(state, (state) => {
        const session = state.sessionsById[sessionId];
        if (!session) return;
        const message = session.messages.find((msg) => msg.id === messageId);
        if (!message) return;
        updater(message);
      }),
    );
  };

  const setMessages = (
    updater: (prev: WritableDraft<CustomMessage>[]) => void,
  ) => {
    if (!sessionId) return;
    useChatStore.setState((state) =>
      produce(state, (state) => {
        const session = state.sessionsById[sessionId];
        if (!session) return;
        updater(session.messages);
        session.updatedAt = Date.now();
        state.sessionOrder = Object.values(state.sessionsById)
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .map((session) => session.id);
      }),
    );
  };

  const getMessages = () => {
    if (!sessionId) return [];
    const session = useChatStore.getState().sessionsById[sessionId];
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
    setMessages((m) => {
      m.length = 0;
    });
    stop();
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    const userMessage: CustomMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    const assistantMessageInit: CustomMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };
    const now = Date.now();
    userMessage.createdAt = now;
    assistantMessageInit.createdAt = now;

    setMessages((mssgs) => {
      mssgs.push(userMessage, assistantMessageInit);
    });

    try {
      // System prompt from lib/ollama.ts
      const currentMessages = [
        ...SYSTEM_PROMPTS,
        ...getMessages().slice(0, -1),
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

          setMessages((mssgs) => {
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

        for await (const part of stream) {
          if (abortControllerRef.current?.signal.aborted) {
            break;
          }

          assistantContent += part.message.content ?? "";
          assistantThinking += part.message.thinking ?? "";

          if (part.message.tool_calls) {
            toolCalls.push(...part.message.tool_calls);
          }

          updateMessage(assistantMessageInit.id, (assistantMessage) => {
            assistantMessage.content += part.message.content;
            assistantMessage.thinking ??= "";
            assistantMessage.thinking += part.message.thinking ?? "";
            if (toolCalls.length > 0) {
              assistantMessage.tool_calls = toolCalls;
            }
          });
        }

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
