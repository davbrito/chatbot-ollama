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
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      ttsProvider: "browser",
      elevenlabsApiKey: "",
      elevenlabsVoice: "alloy",
      setTtsProvider: (p: TTSProviderName) => set({ ttsProvider: p }),
      setElevenlabsApiKey: (k: string) => set({ elevenlabsApiKey: k }),
      setElevenlabsVoice: (v: string) => set({ elevenlabsVoice: v }),
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
