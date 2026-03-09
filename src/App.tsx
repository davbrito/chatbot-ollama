import { ClapperboardIcon } from "lucide-react";
import { useEffect } from "react";
import { ChatContainer } from "./components/ChatContainer";
import { ChatSidebar } from "./components/ChatSidebar";
import { useChatStore } from "./store/chatStore";

export default function App() {
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const modelsError = useChatStore((state) => state.error);
  const fetchModels = useChatStore((state) => state.fetchModels);
  const ensureActiveSession = useChatStore(
    (state) => state.ensureActiveSession,
  );
  const models = useChatStore((state) => state.models);

  const activeModel = useChatStore((state) =>
    state.activeSessionId
      ? state.sessionsById[state.activeSessionId]?.model
      : undefined,
  );

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  useEffect(() => {
    ensureActiveSession();
  }, [models, ensureActiveSession]);

  return (
    <div className="cinema-surface isolate flex h-full flex-col overflow-hidden">
      {modelsError && (
        <div className="border-b border-red-400/40 bg-red-950/40 p-3 text-center text-sm text-red-100 backdrop-blur-md">
          <strong>Error:</strong> {modelsError}
        </div>
      )}

      {models.length === 0 && !modelsError ? (
        <div className="relative flex flex-1 flex-col items-center justify-center text-amber-100/80">
          <div className="marquee-pulse pointer-events-none absolute inset-x-12 top-24 h-px bg-linear-to-r from-transparent via-amber-300/70 to-transparent" />
          <ClapperboardIcon className="mb-3 h-12 w-12 animate-bounce text-amber-300" />
          <p className="text-sm uppercase">Proyeccion iniciando...</p>
          <p className="mt-2 text-xs text-amber-100/60">
            Conectando con Ollama
          </p>
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
