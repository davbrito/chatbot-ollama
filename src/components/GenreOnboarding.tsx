import { FilmIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { GENRE_OPTIONS } from "../lib/genres";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface GenreOnboardingProps {
  onSubmit: (genres: string[]) => void;
}

export function GenreOnboarding({ onSubmit }: GenreOnboardingProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const selectedSet = useMemo(() => new Set(selectedGenres), [selectedGenres]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((current) =>
      current.includes(genre)
        ? current.filter((item) => item !== genre)
        : [...current, genre],
    );
  };

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-auto p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,color-mix(in_oklab,var(--primary)_24%,transparent)_0%,transparent_38%),radial-gradient(circle_at_80%_0%,color-mix(in_oklab,var(--accent)_30%,transparent)_0%,transparent_42%)]" />

      <Card className="relative z-10 w-full max-w-2xl border border-amber-100/15 bg-black/30 py-5 shadow-2xl backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-1 flex size-10 items-center justify-center rounded-full border border-amber-200/30 bg-amber-300/10 text-amber-300">
            <FilmIcon className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg tracking-[0.14em] uppercase">
            Tu cartelera ideal
          </CardTitle>
          <p className="text-xs text-amber-100/70">
            Antes de empezar, elige los generos que mas te gustan.
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {GENRE_OPTIONS.map((genre) => {
              const isSelected = selectedSet.has(genre);

              return (
                <Button
                  key={genre}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className="h-8 justify-center rounded-full"
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </Button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 text-xs text-amber-100/65">
            <span>
              {selectedGenres.length > 0
                ? `${selectedGenres.length} seleccionados`
                : "Selecciona al menos uno para continuar"}
            </span>

            <Button
              type="button"
              size="lg"
              disabled={selectedGenres.length === 0}
              onClick={() => onSubmit(selectedGenres)}
            >
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
