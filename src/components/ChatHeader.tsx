import { MessageCircleMoreIcon } from "lucide-react";
import { ModelSelector } from "./ModelSelector";

interface ChatHeaderProps {
  hasMessages: boolean;
  onClear: () => void;
}

export function ChatHeader({ hasMessages, onClear }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
          <MessageCircleMoreIcon className="fill-white stroke-indigo-600" />
        </div>
        <div>
          <h1 className="font-semibold text-gray-900 text-sm leading-tight">
            Chatbot Ollama
          </h1>
          <p className="text-xs text-gray-500">Impulsado por Ollama</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ModelSelector />
        {hasMessages && (
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            Limpiar
          </button>
        )}
      </div>
    </header>
  );
}
