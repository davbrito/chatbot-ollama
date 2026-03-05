import { produce, type WritableDraft } from "immer";
import { useRef, useState } from "react";
import { useChatStore, type CustomMessage } from "../store/chatStore";
import { ollama, SYSTEM_PROMPTS } from "./ollama";

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
      const finalMessages = [...SYSTEM_PROMPTS, ...getMessages().slice(0, -1)];

      const stream = await ollama.chat({
        model,
        messages: finalMessages,
        stream: true,
      });

      for await (const part of stream) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        setMessages((draft) => {
          const last = draft[draft.length - 1];
          if (last.id === assistantMessageInit.id) {
            last.content += part.message.content;
            last.thinking ??= "";
            last.thinking += part.message.thinking ?? "";
          }
        });
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
