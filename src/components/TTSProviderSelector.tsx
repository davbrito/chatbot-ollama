import useConfigStore from "../store/configStore";
import { Input } from "./ui/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "./ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function TTSProviderSelector() {
  const provider = useConfigStore((s) => s.ttsProvider);
  const apiKey = useConfigStore((s) => s.getElevenlabsApiKey());
  const voice = useConfigStore((s) => s.getElevenlabsVoice());
  const setProvider = useConfigStore((s) => s.setTtsProvider);
  const setApiKey = useConfigStore((s) => s.setElevenlabsApiKey);
  const setVoice = useConfigStore((s) => s.setElevenlabsVoice);

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Motor de voz</FieldLabel>
        <FieldContent>
          <Select
            value={provider}
            onValueChange={(value) => setProvider(value!)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona proveedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="browser">Navegador (WebSpeech)</SelectItem>
              <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
            </SelectContent>
          </Select>
          <FieldDescription>
            Elige entre el motor del navegador o ElevenLabs.
          </FieldDescription>
        </FieldContent>
      </Field>

      {provider === "elevenlabs" && (
        <FieldGroup>
          <Field>
            <FieldLabel>API Key</FieldLabel>
            <FieldContent>
              <Input
                type="password"
                placeholder="API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <FieldDescription>
                Se guarda localmente en este dispositivo.
              </FieldDescription>
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>Voz</FieldLabel>
            <FieldContent>
              <Input
                placeholder="voice (e.g. allay)"
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
              />
              <FieldDescription>
                Usa un voice ID de ElevenLabs.
              </FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      )}
    </FieldGroup>
  );
}

export default TTSProviderSelector;
