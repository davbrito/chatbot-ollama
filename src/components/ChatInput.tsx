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
      <div className="mx-auto flex max-w-4xl flex-col gap-3">
        {selectedMovie && (
          <MovieTag
            movie={selectedMovie}
            variant="input"
            onRemove={() => setSelectedMovie(undefined)}
          />
        )}

        <div className="flex flex-wrap items-center gap-2">
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
        </div>

        <div className="flex justify-between">
          <MoviePickerDialog
            disabled={!model}
            onPickMovie={(movie) => {
              setSelectedMovie(movie);
            }}
          />

          {isLoading ? (
            <button
              onClick={onStop}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-red-300/20 bg-red-900/80 text-red-100 transition-colors hover:bg-red-800 md:size-10 md:rounded-xl"
              aria-label="Detener"
            >
              <SquareIcon className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim() || !model}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-amber-100/30 bg-linear-to-br from-amber-300 to-orange-600 text-zinc-950 transition-colors enabled:hover:from-amber-200 enabled:hover:to-orange-500 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-700 disabled:opacity-50 md:size-10 md:rounded-xl"
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
