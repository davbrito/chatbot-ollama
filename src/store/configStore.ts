import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setTTSProvider, type TTSProviderName } from "../lib/tts";

const initialTtsProvider =
  (import.meta.env.VITE_TTS_PROVIDER as TTSProviderName) || "browser";
const initialElevenlabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || "";
const initialElevenlabsVoice = import.meta.env.VITE_ELEVENLABS_VOICE_ID || "";
const initialDefaultModel = import.meta.env.VITE_DEFAULT_MODEL || "";
const initialOmdbApiKey = import.meta.env.VITE_OMDB_API_KEY || "";

interface ConfigState {
  ttsProvider: TTSProviderName;
  elevenlabsApiKey: string;
  elevenlabsVoice: string;
  defaultModel: string;
  omdbApiKey: string;
  setTtsProvider: (p: TTSProviderName) => void;
  setElevenlabsApiKey: (k: string) => void;
  setElevenlabsVoice: (v: string) => void;
  setDefaultModel: (m: string) => void;
  setOmdbApiKey: (k: string) => void;
  getElevenlabsApiKey(): string;
  getElevenlabsVoice(): string;
  getDefaultModel(): string;
  getOmdbApiKey(): string;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      ttsProvider: initialTtsProvider,
      elevenlabsApiKey: initialElevenlabsApiKey,
      elevenlabsVoice: initialElevenlabsVoice,
      defaultModel: initialDefaultModel,
      omdbApiKey: initialOmdbApiKey,
      setTtsProvider: (p: TTSProviderName) => {
        setTTSProvider(p, {
          apiKey: get().getElevenlabsApiKey(),
          voice: get().getElevenlabsVoice(),
        });
        return set({ ttsProvider: p });
      },
      setElevenlabsApiKey: (k: string) => set({ elevenlabsApiKey: k }),
      setElevenlabsVoice: (v: string) => set({ elevenlabsVoice: v }),
      setDefaultModel: (m: string) => set({ defaultModel: m }),
      setOmdbApiKey: (k: string) => set({ omdbApiKey: k }),
      getElevenlabsApiKey() {
        return get().elevenlabsApiKey || initialElevenlabsApiKey;
      },
      getElevenlabsVoice() {
        return get().elevenlabsVoice || initialElevenlabsVoice || "alloy";
      },
      getDefaultModel() {
        return get().defaultModel || initialDefaultModel;
      },
      getOmdbApiKey() {
        return get().omdbApiKey || initialOmdbApiKey;
      },
    }),
    {
      name: "config",
      version: 1,
      onRehydrateStorage() {
        return function afterRehydrate(state) {
          setTTSProvider(state?.ttsProvider || "browser", {
            apiKey: state?.getElevenlabsApiKey(),
            voice: state?.getElevenlabsVoice(),
          });
        };
      },
    },
  ),
);

export default useConfigStore;
