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

export function SettingsDialog() {
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configuracion</DialogTitle>
          <DialogDescription>
            Ajusta el motor de voz y otras preferencias.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <TTSProviderSelector />
        </div>
        <DialogFooter>
          <DialogClose render={<Button />}>Listo</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;
