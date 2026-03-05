import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setTTSProvider, type TTSProviderName } from "../lib/tts";

interface ConfigState {
  ttsProvider: TTSProviderName;
  elevenlabsApiKey: string;
  elevenlabsVoice: string;
  setTtsProvider: (p: TTSProviderName) => void;
  setElevenlabsApiKey: (k: string) => void;
  setElevenlabsVoice: (v: string) => void;
  getElevenlabsApiKey(): string;
  getElevenlabsVoice(): string;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      ttsProvider: "browser",
      elevenlabsApiKey: "",
      elevenlabsVoice: "",
      setTtsProvider: (p: TTSProviderName) => set({ ttsProvider: p }),
      setElevenlabsApiKey: (k: string) => set({ elevenlabsApiKey: k }),
      setElevenlabsVoice: (v: string) => set({ elevenlabsVoice: v }),
      getElevenlabsApiKey() {
        return (
          get().elevenlabsApiKey || import.meta.env.VITE_ELEVENLABS_API_KEY
        );
      },
      getElevenlabsVoice() {
        return (
          get().elevenlabsVoice ||
          import.meta.env.VITE_ELEVENLABS_VOICE_ID ||
          "alloy"
        );
      },
    }),
    {
      name: "config",
      version: 1,
      onRehydrateStorage() {
        return function afterRehydrate(state) {
          setTTSProvider(state?.ttsProvider || "browser");
        };
      },
    },
  ),
);

export default useConfigStore;
