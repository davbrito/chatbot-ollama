import { BotMessageSquareIcon, XIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useChat } from "../lib/useChat";
import { useChatStore } from "../store/chatStore";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { ModelSelector } from "./ModelSelector";
import { Button } from "./ui/button";

export function ChatContainer({ model }: { model: string }) {
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const clearActiveSession = useChatStore((state) => state.clearActiveSession);

  const { messages, sendMessage, stop, isLoading, error, clear, clearError } =
    useChat({
      model,
      sessionId: activeSessionId,
    });
  const conainerRef = useRef<HTMLDivElement>(null);

  const renderMessages = messages.filter(
    (message) => message.role !== "tool" && message.role !== "system",
  );
  const messageCount = renderMessages;

  useEffect(() => {
    conainerRef.current?.scrollTo({
      top: conainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messageCount]);

  const lastMessage = renderMessages.at(-1);
  const lastIsAssistantLoading = isLoading && lastMessage?.role === "assistant";

  const handleClear = () => {
    clear();
    clearActiveSession();
  };

  return (
    <div className="isolate flex min-h-0 min-w-0 flex-1 flex-col">
      <ChatHeader hasMessages={messages.length > 0} onClear={handleClear} />

      <main
        className="flex min-h-0 flex-1 flex-col overflow-auto px-4 py-6"
        ref={conainerRef}
      >
        <div className="m-auto max-w-4xl">
          {error && (
            <div className="sticky top-0 mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-400/40 bg-red-950/40 p-3 text-sm text-red-100 backdrop-blur-sm">
              <div>
                <strong>Error:</strong>{" "}
                {error instanceof Error ? error.message : String(error)}
              </div>
              <Button
                type="button"
                onClick={() => clearError()}
                variant="destructive"
                size="icon"
                aria-label="Cerrar error"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          )}

          {renderMessages.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-amber-100/10 bg-black/20 p-4 text-center text-amber-100/70">
              <BotMessageSquareIcon className="mb-3 h-12 w-12 text-amber-300/80" />
              <p className="text-sm font-medium tracking-[0.18em] uppercase">
                Cartelera en espera
              </p>
              <p className="mt-1 text-xs text-amber-100/55">
                Escribe un mensaje abajo para chatear con {model}
              </p>
            </div>
          )}

          {renderMessages.map((message, idx) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLastLoading={
                lastIsAssistantLoading && idx === renderMessages.length - 1
              }
            />
          ))}
        </div>
      </main>

      <ChatInput
        model={model}
        isLoading={isLoading}
        onSend={(text, movie) => {
          sendMessage(text, movie);
        }}
        onStop={stop}
      />
      <div className="border-t border-amber-200/10 bg-black/25 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-end">
          <ModelSelector model={model} />
        </div>
      </div>
    </div>
  );
}
