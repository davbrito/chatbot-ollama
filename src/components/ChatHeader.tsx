import { MessageCircleMoreIcon } from "lucide-react";
import { ModelSelector } from "./ModelSelector";
import { SettingsDialog } from "./SettingsDialog";

interface ChatHeaderProps {
  hasMessages: boolean;
  onClear: () => void;
}

export function ChatHeader({ hasMessages, onClear }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
          <MessageCircleMoreIcon className="fill-white stroke-indigo-600" />
        </div>
        <div>
          <h1 className="text-sm leading-tight font-semibold text-gray-900">
            Cinéfilo Michael
          </h1>
          <p className="text-xs text-gray-500">Impulsado por Ollama</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ModelSelector />
        <SettingsDialog />
        {hasMessages && (
          <button
            onClick={onClear}
            className="rounded-lg px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-500"
          >
            Limpiar
          </button>
        )}
      </div>
    </header>
  );
}
