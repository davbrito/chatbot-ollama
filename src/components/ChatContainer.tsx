import { useRef, useEffect } from "react";
import { useChatStore } from "../store/chatStore";
import { useChat } from "../lib/useChat";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { BotMessageSquareIcon } from "lucide-react";

export function ChatContainer({ model }: { model: string }) {
  const { sessions, activeSessionId, clearActiveSession, updateSessionTitle } =
    useChatStore();
  const activeSession = sessions.find(
    (session) => session.id === activeSessionId,
  );

  const { messages, sendMessage, stop, isLoading, error, clear } = useChat({
    model,
    sessionId: activeSessionId,
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  const messageCount = messages.length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageCount]);

  const renderMessages = messages.filter((message) => message.role !== "tool");
  const lastMessage = renderMessages.at(-1);
  const lastIsAssistantLoading = isLoading && lastMessage?.role === "assistant";

  const handleClear = () => {
    clear();
    clearActiveSession();
  };

  return (
    <>
      <ChatHeader hasMessages={messages.length > 0} onClear={handleClear} />

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <strong>Error:</strong>{" "}
              {error instanceof Error ? error.message : String(error)}
            </div>
          )}

          {renderMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <BotMessageSquareIcon className="w-12 h-12 mb-3" />
              <p className="text-sm font-medium">Inicia una conversación</p>
              <p className="text-xs mt-1">
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

          <div ref={bottomRef} />
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
    </>
  );
}
