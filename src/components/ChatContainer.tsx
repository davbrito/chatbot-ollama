import { useRef, useEffect } from "react";
import { useChatStore } from "../store/chatStore";
import { useChat } from "../lib/useChat";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { ModelSelector } from "./ModelSelector";
import { BotMessageSquareIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";

export function ChatContainer({ model }: { model: string }) {
  const { sessions, activeSessionId, clearActiveSession, updateSessionTitle } =
    useChatStore();
  const activeSession = sessions.find(
    (session) => session.id === activeSessionId,
  );

  const { messages, sendMessage, stop, isLoading, error, clear, clearError } =
    useChat({
      model,
      sessionId: activeSessionId,
    });
  const conainerRef = useRef<HTMLDivElement>(null);

  const messageCount = messages.length;

  useEffect(() => {
    conainerRef.current?.scrollTo({
      top: conainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messageCount]);
  const renderMessages = messages.filter((message) => message.role !== "tool");
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
        className="min-h-0 flex-1 overflow-auto px-4 py-6"
        ref={conainerRef}
      >
        <div className="mx-auto max-w-4xl">
          {error && (
            <div className="sticky top-0 mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <div>
                <strong>Error:</strong>{" "}
                {error instanceof Error ? error.message : String(error)}
              </div>
              <Button
                type="button"
                onClick={() => clearError()}
                variant="ghost"
                size="icon"
                className="shrink-0 text-red-600 hover:bg-red-100 hover:text-red-700"
                aria-label="Cerrar error"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          )}

          {renderMessages.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center text-gray-400">
              <BotMessageSquareIcon className="mb-3 h-12 w-12" />
              <p className="text-sm font-medium">Inicia una conversación</p>
              <p className="mt-1 text-xs">
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
        onSend={(text) => {
          sendMessage(text);
          if (!activeSession?.title && activeSession?.id) {
            updateSessionTitle(activeSession.id, text);
          }
        }}
        onStop={stop}
      />
      <div className="bg-white px-4 pb-3">
        <div className="mx-auto flex max-w-4xl items-center justify-end">
          <ModelSelector />
        </div>
      </div>
    </div>
  );
}
