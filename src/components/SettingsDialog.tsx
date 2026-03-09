import { SettingsIcon } from "lucide-react";
import { GENRE_OPTIONS } from "../lib/genres";
import useConfigStore from "../store/configStore";
import { PasswordInput } from "./PasswordInput";
import { TTSProviderSelector } from "./TTSProviderSelector";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "./ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function SettingsDialog() {
  const omdbApiKey = useConfigStore((s) => s.omdbApiKey);
  const setOmdbApiKey = useConfigStore((s) => s.setOmdbApiKey);
  const favoriteGenres = useConfigStore((s) => s.favoriteGenres);
  const setFavoriteGenres = useConfigStore((s) => s.setFavoriteGenres);

  const hasGenre = (genre: string) => favoriteGenres.includes(genre);

  const toggleGenre = (genre: string) => {
    if (hasGenre(genre)) {
      setFavoriteGenres(favoriteGenres.filter((item) => item !== genre));
      return;
    }

    setFavoriteGenres([...favoriteGenres, genre]);
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir configuracion"
          />
        }
      >
        <SettingsIcon />
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configuracion</DialogTitle>
          <DialogDescription>
            Ajusta el motor de voz y otras preferencias.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="preferencias">
          <TabsList>
            <TabsTrigger value="preferencias">Preferencias</TabsTrigger>
            <TabsTrigger value="voz">Voz</TabsTrigger>
            <TabsTrigger value="integraciones">Integraciones</TabsTrigger>
          </TabsList>
          <TabsContent value="voz" className="pt-2">
            <TTSProviderSelector />
          </TabsContent>
          <TabsContent value="preferencias" className="pt-2">
            <FieldGroup>
              <Field>
                <FieldLabel>Generos favoritos</FieldLabel>
                <FieldContent>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {GENRE_OPTIONS.map((genre) => {
                      const selected = hasGenre(genre);

                      return (
                        <Button
                          key={genre}
                          type="button"
                          variant={selected ? "default" : "outline"}
                          className="h-8 justify-center rounded-full"
                          onClick={() => toggleGenre(genre)}
                        >
                          {genre}
                        </Button>
                      );
                    })}
                  </div>

                  <FieldDescription>
                    Esta seleccion se usa en el system prompt para priorizar tus
                    recomendaciones.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </TabsContent>
          <TabsContent value="integraciones" className="pt-2">
            <FieldGroup>
              <Field>
                <FieldLabel>OMDb API Key</FieldLabel>
                <FieldContent>
                  <PasswordInput
                    placeholder="OMDb API Key"
                    value={omdbApiKey}
                    onChange={(e) => setOmdbApiKey(e.target.value)}
                  />
                  <FieldDescription>
                    Se usa para obtener datos de peliculas desde OMDb.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <DialogClose render={<Button />}>Listo</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;
