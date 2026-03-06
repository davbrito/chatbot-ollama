import { useEffect } from "react";
import { useChatStore } from "./store/chatStore";
import { ChatContainer } from "./components/ChatContainer";
import { ChatSidebar } from "./components/ChatSidebar";

export default function App() {
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const modelsError = useChatStore((state) => state.error);
  const fetchModels = useChatStore((state) => state.fetchModels);
  const ensureActiveSession = useChatStore(
    (state) => state.ensureActiveSession,
  );
  const models = useChatStore((state) => state.models);

  const activeModel = useChatStore(
    (state) =>
      state.sessions.find((s) => s.id === state.activeSessionId)?.model,
  );

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  useEffect(() => {
    ensureActiveSession();
  }, [models, ensureActiveSession]);

  return (
    <div className="isolate flex h-full flex-col bg-gray-50">
      {modelsError && (
        <div className="border-b border-red-200 bg-red-50 p-3 text-center text-sm text-red-700">
          <strong>Error:</strong> {modelsError}
        </div>
      )}

      {models.length === 0 && !modelsError ? (
        <div className="flex flex-1 flex-col items-center justify-center text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mb-3 h-12 w-12 animate-spin"
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
        <div className="flex min-h-0 flex-1">
          <ChatSidebar />
          <ChatContainer
            key={`${activeModel}-${activeSessionId ?? "default"}`}
            model={activeModel}
          />
        </div>
      ) : null}
    </div>
  );
}
