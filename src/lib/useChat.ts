import { produce, type WritableDraft } from "immer";
import type { ToolCall } from "ollama/browser";
import { useRef, useState } from "react";
import { useChatStore, type CustomMessage } from "../store/chatStore";
import { ollama, SYSTEM_PROMPTS } from "./ollama";
import { executeGetMovie, executeSearchMovies, tools } from "./tools";

const toolExecutors: Record<string, (args: unknown) => Promise<string>> = {
  omdb_search: executeSearchMovies,
  omdb_get: executeGetMovie,
};

export function useChat({
  model,
  sessionId,
}: {
  model: string;
  sessionId?: string | null;
}) {
  const storeMessages =
    useChatStore((state) =>
      sessionId
        ? state.sessions.find((s) => s.id === sessionId)?.messages
        : undefined,
    ) ?? [];

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const setMessages = (
    updater: (prev: WritableDraft<CustomMessage>[]) => void,
  ) => {
    if (!sessionId) return;
    useChatStore.setState((state) =>
      produce(state, (state) => {
        const session = state.sessions.find((s) => s.id === sessionId);
        if (!session) return;
        updater(session.messages);
        session.updatedAt = Date.now();
      }),
    );
  };

  const getMessages = () => {
    if (!sessionId) return [];
    const session = useChatStore
      .getState()
      .sessions.find((s) => s.id === sessionId);
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
    setMessages(() => []);
    stop();
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
          const executeTool = toolExecutors[tool.function.name];
          if (!executeTool) continue;

          handledAny = true;

          const result = await executeTool(tool.function.arguments);

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

          setMessages((mssgs) => {
            mssgs.push(toolMessageInit);
          });
        }

        return handledAny;
      };

      let isToolCall = true;

      while (isToolCall) {
        isToolCall = false;

        const stream = await ollama.chat({
          model,
          messages: currentMessages,
          stream: true,
          tools,
        });

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

          setMessages((draft) => {
            const assistantMessage = draft.find(
              (msg) => msg.id === assistantMessageInit.id,
            );
            if (assistantMessage) {
              assistantMessage.content += part.message.content;
              assistantMessage.thinking ??= "";
              assistantMessage.thinking += part.message.thinking ?? "";
              if (toolCalls.length > 0) {
                assistantMessage.tool_calls = toolCalls;
              }
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
  };
}
