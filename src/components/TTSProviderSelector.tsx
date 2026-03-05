import type { TTSProviderName } from "../lib/tts";
import useConfigStore from "../store/configStore";

export function TTSProviderSelector() {
  const provider = useConfigStore((s) => s.ttsProvider);
  const apiKey = useConfigStore((s) => s.elevenlabsApiKey);
  const voice = useConfigStore((s) => s.elevenlabsVoice);
  const setProvider = useConfigStore((s) => s.setTtsProvider);
  const setApiKey = useConfigStore((s) => s.setElevenlabsApiKey);
  const setVoice = useConfigStore((s) => s.setElevenlabsVoice);

  return (
    <div className="flex items-center gap-2">
      <select
        value={provider}
        onChange={(e) => setProvider(e.target.value as TTSProviderName)}
        className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs"
        aria-label="TTS provider"
      >
        <option value="browser">Navegador (WebSpeech)</option>
        <option value="elevenlabs">ElevenLabs</option>
      </select>

      {provider === "elevenlabs" && (
        <div className="flex items-center gap-2">
          <input
            type="password"
            placeholder="API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
          />
          <input
            placeholder="voice (e.g. allay)"
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
          />
        </div>
      )}
    </div>
  );
}

export default TTSProviderSelector;
