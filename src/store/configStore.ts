import uniq from "lodash-es/uniq";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setTTSProvider, type TTSProviderName } from "../lib/tts";

const initialTtsProvider =
  (import.meta.env.VITE_TTS_PROVIDER as TTSProviderName) || "browser";
const initialElevenlabsVoice = import.meta.env.VITE_ELEVENLABS_VOICE_ID || "";
const initialDefaultModel = import.meta.env.VITE_DEFAULT_MODEL || "";

interface ConfigState {
  ttsProvider: TTSProviderName;
  elevenlabsVoice: string;
  defaultModel: string;
  omdbApiKey: string;
  favoriteGenres: string[];
  setTtsProvider: (p: TTSProviderName) => void;
  setElevenlabsVoice: (v: string) => void;
  setDefaultModel: (m: string) => void;
  setOmdbApiKey: (k: string) => void;
  setFavoriteGenres: (genres: string[]) => void;
  getElevenlabsVoice(): string;
  getDefaultModel(): string;
  getOmdbApiKey(): string;
  getFavoriteGenres(): string[];
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      ttsProvider: initialTtsProvider,
      elevenlabsVoice: initialElevenlabsVoice,
      defaultModel: initialDefaultModel,
      omdbApiKey: "",
      favoriteGenres: [],
      setTtsProvider: (p: TTSProviderName) => {
        setTTSProvider(p, {
          voice: get().getElevenlabsVoice(),
        });
        return set({ ttsProvider: p });
      },
      setElevenlabsVoice: (v: string) => set({ elevenlabsVoice: v }),
      setDefaultModel: (m: string) => set({ defaultModel: m }),
      setOmdbApiKey: (k: string) => set({ omdbApiKey: k }),
      setFavoriteGenres: (genres: string[]) => {
        const normalized = uniq(
          genres.map((genre) => genre.trim()).filter(Boolean),
        );
        set({ favoriteGenres: normalized });
      },
      getElevenlabsVoice() {
        return get().elevenlabsVoice || initialElevenlabsVoice || "alloy";
      },
      getDefaultModel() {
        return get().defaultModel || initialDefaultModel;
      },
      getOmdbApiKey() {
        return get().omdbApiKey;
      },
      getFavoriteGenres() {
        return get().favoriteGenres;
      },
    }),
    {
      name: "config",
      version: 1,
      onRehydrateStorage() {
        return function afterRehydrate(state) {
          setTTSProvider(state?.ttsProvider || "browser", {
            voice: state?.getElevenlabsVoice(),
          });
        };
      },
    },
  ),
);

export default useConfigStore;
