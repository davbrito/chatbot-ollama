import { SettingsIcon } from "lucide-react";
import { TTSProviderSelector } from "./TTSProviderSelector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { PasswordInput } from "./PasswordInput";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "./ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import useConfigStore from "../store/configStore";

export function SettingsDialog() {
  const omdbApiKey = useConfigStore((s) => s.omdbApiKey);
  const setOmdbApiKey = useConfigStore((s) => s.setOmdbApiKey);

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
        <Tabs defaultValue="voz">
          <TabsList>
            <TabsTrigger value="voz">Voz</TabsTrigger>
            <TabsTrigger value="integraciones">Integraciones</TabsTrigger>
          </TabsList>
          <TabsContent value="voz" className="pt-2">
            <TTSProviderSelector />
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
