import { SendHorizontalIcon, SquareIcon } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import type { MovieAttachment } from "../store/chatStore";
import { MovieTag } from "./MovieTag";
import { MoviePickerDialog } from "./MoviePickerDialog";
import { Textarea } from "./ui/textarea";

interface ChatInputProps {
  model: string;
  isLoading: boolean;
  onSend: (content: string, movie?: MovieAttachment) => void;
  onStop: () => void;
}

export function ChatInput({
  model,
  isLoading,
  onSend,
  onStop,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<MovieAttachment>();

  const handleSend = () => {
    if (!input.trim() || !model) return;
    onSend(input, selectedMovie);
    setInput("");
    setSelectedMovie(undefined);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-amber-200/10 bg-linear-to-t from-black/45 to-black/10 px-4 py-3">
      <div className="mx-auto max-w-4xl">
        {selectedMovie && (
          <MovieTag
            movie={selectedMovie}
            variant="input"
            className="mb-2"
            onRemove={() => setSelectedMovie(undefined)}
          />
        )}

        <div className="flex items-center gap-2">
          <MoviePickerDialog
            disabled={!model}
            onPickMovie={(movie) => {
              setSelectedMovie(movie);
            }}
          />

          <Textarea
            className="field-sizing-content max-h-40 min-h-11 flex-1 resize-none rounded-xl px-4 py-2.5 leading-relaxed"
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
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-300/20 bg-red-900/80 text-red-100 transition-colors hover:bg-red-800"
              aria-label="Detener"
            >
              <SquareIcon className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim() || !model}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-100/30 bg-linear-to-br from-amber-300 to-orange-600 text-zinc-950 transition-colors enabled:hover:from-amber-200 enabled:hover:to-orange-500 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-700 disabled:opacity-50"
              aria-label="Enviar"
            >
              <SendHorizontalIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
