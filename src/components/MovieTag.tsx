import { ClapperboardIcon, XIcon } from "lucide-react";
import type { MovieAttachment } from "../store/chatStore";
import { cn } from "../lib/utils";

interface MovieTagProps {
  movie: MovieAttachment;
  variant?: "input" | "message";
  className?: string;
  onRemove?: () => void;
}

export function MovieTag({
  movie,
  variant = "message",
  className,
  onRemove,
}: MovieTagProps) {
  const isInput = variant === "input";

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        isInput
          ? "justify-between rounded-xl border border-amber-200/25 bg-black/35 p-2"
          : "rounded-lg border border-white/30 bg-white/10 px-2 py-1.5",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div
          className={cn(
            "h-12 w-9 shrink-0 overflow-hidden rounded-md border",
            isInput
              ? "border-amber-100/20 bg-zinc-900"
              : "border-white/20 bg-indigo-950/60",
          )}
        >
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={`Poster de ${movie.title}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center",
                isInput ? "text-amber-200/60" : "text-white/70",
              )}
            >
              <ClapperboardIcon className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p
            className={cn(
              "truncate text-xs font-medium",
              isInput ? "text-amber-50" : "text-white/95",
            )}
          >
            {movie.title}
          </p>
          <p
            className={cn(
              "text-[11px]",
              isInput ? "text-amber-100/70" : "text-white/75",
            )}
          >
            {movie.year} · IMDb {movie.imdbId}
          </p>
        </div>
      </div>

      {onRemove && (
        <button
          type="button"
          className={cn(
            "ml-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors",
            isInput
              ? "border-amber-100/20 bg-zinc-900/80 text-amber-100 hover:bg-zinc-800"
              : "border-white/25 bg-white/10 text-white hover:bg-white/20",
          )}
          onClick={onRemove}
          aria-label="Quitar pelicula seleccionada"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
