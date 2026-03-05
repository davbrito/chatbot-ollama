import { useEffect } from "react";
import { useChatStore } from "./store/chatStore";
import { ChatContainer } from "./components/ChatContainer";
import { ChatSidebar } from "./components/ChatSidebar";

export default function App() {
  const {
    models,
    sessions,
    fetchModels,
    error: modelsError,
    activeSessionId,
    ensureActiveSession,
  } = useChatStore();

  const activeSession = sessions.find(
    (session) => session.id === activeSessionId,
  );
  const activeModel = activeSession?.model ?? "";

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  useEffect(() => {
    ensureActiveSession();
  }, [models, ensureActiveSession]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {modelsError && (
        <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-sm text-center">
          <strong>Error:</strong> {modelsError}
        </div>
      )}

      {models.length === 0 && !modelsError ? (
        <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 mb-3 animate-spin"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          <p className="text-sm">Conectando con Ollama...</p>
        </div>
      ) : activeModel ? (
        <div className="flex flex-1 min-h-0">
          <ChatSidebar />
          <div className="flex-1 min-w-0 flex flex-col">
            <ChatContainer
              key={`${activeModel}-${activeSessionId ?? "default"}`}
              model={activeModel}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
