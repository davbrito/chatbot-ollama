import { ClapperboardIcon, LoaderCircleIcon, SearchIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { searchOmdbMovies, type OmdbMovieSummary } from "../lib/omdb";
import type { MovieAttachment } from "../store/chatStore";
import useConfigStore from "../store/configStore";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./ui/popover";
import { Input } from "./ui/input";

interface MoviePickerDialogProps {
  disabled?: boolean;
  onPickMovie: (movie: MovieAttachment) => void;
}

export function MoviePickerDialog({
  disabled = false,
  onPickMovie,
}: MoviePickerDialogProps) {
  const [open, setOpen] = useState(false);
  const omdbApiKey = useConfigStore((state) => state.omdbApiKey);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OmdbMovieSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canSearch = useMemo(
    () => Boolean(omdbApiKey.trim()) && query.trim().length >= 2,
    [omdbApiKey, query],
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (!omdbApiKey.trim()) {
      setResults([]);
      setError("Configura tu OMDb API Key en el tab Integraciones.");
      return;
    }

    if (query.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const movies = await searchOmdbMovies(omdbApiKey, {
          query,
          type: "movie",
          page: 1,
          signal: controller.signal,
        });

        setResults(movies);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setResults([]);
        setError(
          err instanceof Error
            ? err.message
            : "Error consultando la API de peliculas",
        );
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [open, omdbApiKey, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            disabled={disabled}
            className="flex h-10 shrink-0 items-center gap-1 rounded-xl border border-amber-100/25 bg-zinc-950/70 px-3 text-xs text-amber-100 transition-colors hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Seleccionar pelicula"
          />
        }
      >
        <ClapperboardIcon className="h-3.5 w-3.5" />
        Pelicula
      </PopoverTrigger>

      <PopoverContent
        className="w-[min(44rem,calc(100vw-2rem))] gap-3 p-3"
        align="start"
      >
        <PopoverHeader>
          <PopoverTitle>Seleccionar pelicula</PopoverTitle>
          <PopoverDescription>
            Busca y elige la pelicula de la que quieres hablar.
          </PopoverDescription>
        </PopoverHeader>

        <div className="space-y-3">
          <div className="relative">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Escribe el titulo de la pelicula"
              className="pl-8"
            />
          </div>

          <div className="max-h-72 space-y-2 overflow-auto pr-1">
            {!omdbApiKey.trim() && (
              <p className="rounded-md border border-amber-300/30 bg-amber-950/30 p-2 text-xs text-amber-100">
                Debes configurar una OMDb API Key para buscar peliculas.
              </p>
            )}

            {isLoading && canSearch && (
              <div className="border-foreground/10 text-muted-foreground flex items-center gap-2 rounded-md border bg-black/20 p-2 text-xs">
                <LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" />
                Buscando peliculas...
              </div>
            )}

            {!isLoading && error && (
              <p className="rounded-md border border-red-400/40 bg-red-950/30 p-2 text-xs text-red-100">
                {error}
              </p>
            )}

            {!isLoading &&
              !error &&
              results.length === 0 &&
              query.trim().length >= 2 && (
                <p className="border-foreground/10 text-muted-foreground rounded-md border bg-black/20 p-2 text-xs">
                  No hay coincidencias para esa busqueda.
                </p>
              )}

            {results.map((movie) => (
              <button
                key={movie.imdbID}
                type="button"
                className="border-foreground/10 w-full rounded-md border bg-black/20 p-2 text-left transition-colors hover:border-amber-200/30 hover:bg-black/35"
                onClick={() => {
                  onPickMovie({
                    title: movie.Title,
                    year: movie.Year,
                    imdbId: movie.imdbID,
                    poster:
                      movie.Poster && movie.Poster !== "N/A"
                        ? movie.Poster
                        : undefined,
                  });
                  setOpen(false);
                }}
              >
                <p className="text-sm text-amber-50">{movie.Title}</p>
                <p className="text-xs text-amber-100/70">
                  {movie.Year} · IMDb {movie.imdbID}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cerrar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
