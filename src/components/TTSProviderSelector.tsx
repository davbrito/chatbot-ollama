import useConfigStore from "../store/configStore";
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
  const setProvider = useConfigStore((s) => s.setTtsProvider);

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
    </FieldGroup>
  );
}

export default TTSProviderSelector;
