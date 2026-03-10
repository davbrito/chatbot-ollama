import { ClapperboardIcon } from "lucide-react";
import useSWR from "swr";
import { ChatContainer } from "./components/ChatContainer";
import { ChatSidebar } from "./components/ChatSidebar";
import { GenreOnboarding } from "./components/GenreOnboarding";
import { TurnstileInvisible } from "./components/TurnstileInvisible";
import { SidebarProvider } from "./components/ui/sidebar";
import { useChatStore } from "./store/chatStore";
import { useConfigStore } from "./store/configStore";

export default function App() {
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const modelsError = useChatStore((state) => state.error);
  const fetchModels = useChatStore((state) => state.fetchModels);
  const preferredModel = useConfigStore((state) => state.getDefaultModel());
  const favoriteGenres = useConfigStore((state) => state.favoriteGenres);
  const setFavoriteGenres = useConfigStore((state) => state.setFavoriteGenres);

  const activeModel = useChatStore((state) =>
    state.activeSessionId
      ? state.sessionsById[state.activeSessionId]?.model
      : undefined,
  );

  const query = useSWR("ollama:models", async () => fetchModels(), {
    suspense: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const models = query.data;

  const fallbackModel =
    models?.find((model) => model.name === preferredModel)?.name ??
    models?.[0]?.name;
  const selectedModel = activeModel ?? fallbackModel;

  const shouldAskGenres = favoriteGenres.length === 0;

  return (
    <div className="cinema-surface isolate flex h-full flex-col overflow-hidden">
      <TurnstileInvisible />

      {modelsError && (
        <div className="border-b border-red-400/40 bg-red-950/40 p-3 text-center text-sm text-red-100 backdrop-blur-md">
          <strong>Error:</strong> {modelsError}
        </div>
      )}

      {shouldAskGenres ? (
        <GenreOnboarding
          onSubmit={(genres) => {
            setFavoriteGenres(genres);
          }}
        />
      ) : !models?.length && !modelsError ? (
        <div className="relative flex flex-1 flex-col items-center justify-center text-amber-100/80">
          <div className="marquee-pulse pointer-events-none absolute inset-x-12 top-24 h-px bg-linear-to-r from-transparent via-amber-300/70 to-transparent" />
          <ClapperboardIcon className="mb-3 h-12 w-12 animate-bounce text-amber-300" />
          <p className="text-sm uppercase">Proyeccion iniciando...</p>
          <p className="mt-2 text-xs text-amber-100/60">
            Conectando con Ollama
          </p>
        </div>
      ) : selectedModel ? (
        <SidebarProvider>
          <ChatSidebar />
          <ChatContainer
            key={`${selectedModel}-${activeSessionId ?? "new"}`}
            model={selectedModel}
          />
        </SidebarProvider>
      ) : null}
    </div>
  );
}
