import { useState, type KeyboardEvent } from "react";

interface ChatInputProps {
  model: string;
  isLoading: boolean;
  onSend: (content: string) => void;
  onStop: () => void;
}

export function ChatInput({
  model,
  isLoading,
  onSend,
  onStop,
}: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || !model) return;
    onSend(input);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-4xl items-end gap-2">
        <textarea
          className="field-sizing-content max-h-40 min-h-11 flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm leading-relaxed text-gray-800 placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          placeholder={
            model
              ? "Escribe un mensaje… (Enter para enviar, Shift+Enter para salto de línea)"
              : "Primero selecciona un modelo"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={!model}
        />
        {isLoading ? (
          <button
            onClick={onStop}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-500 text-white transition-colors hover:bg-red-600"
            aria-label="Detener"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim() || !model}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-200"
            aria-label="Enviar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
