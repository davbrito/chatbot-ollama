import { ClapperboardIcon } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";

interface ChatHeaderProps {
  hasMessages: boolean;
  onClear: () => void;
}

export function ChatHeader({ hasMessages, onClear }: ChatHeaderProps) {
  return (
    <header className="z-10 flex items-center gap-2 border-b border-amber-200/20 bg-linear-to-r from-black/45 via-zinc-900/55 to-black/45 px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <SidebarTrigger />
      <div className="flex items-center gap-3">
        <div className="marquee-pulse flex size-7 items-center justify-center rounded-full border border-amber-300/70 bg-linear-to-br from-amber-200 to-orange-500 text-zinc-900 shadow-[0_0_18px_rgba(251,191,36,0.45)] md:size-9">
          <ClapperboardIcon className="size-4 md:size-4" />
        </div>
        <div>
          <h1 className="cinema-title text-[10px] leading-tight font-semibold tracking-[0.12em] text-amber-100 uppercase md:text-sm">
            Asistente de Cine
          </h1>
          <p className="text-[8px] tracking-[0.2em] text-amber-200/70 uppercase md:text-[11px]">
            Sala privada · Ollama
          </p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        {hasMessages && (
          <button
            onClick={onClear}
            className="rounded-lg border border-amber-300/25 px-2 py-1 text-xs text-amber-100/75 transition-colors hover:bg-amber-200/10 hover:text-amber-50"
          >
            Limpiar
          </button>
        )}
      </div>
    </header>
  );
}
