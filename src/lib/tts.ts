import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export type TTSProviderName = "browser" | "elevenlabs";

export interface TTSProvider {
  speak(text: string): Promise<void>;
  stop(): void;
  isSpeaking(): boolean;
}

class BrowserTTS implements TTSProvider {
  private speaking = false;

  async speak(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      throw new Error("Web Speech API no disponible en este entorno");
    }

    // stop any current speech
    this.stop();

    return new Promise<void>((resolve, reject) => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = navigator.language || "en-US";
      utter.onend = () => {
        this.speaking = false;
        resolve();
      };
      utter.onerror = (e) => {
        this.speaking = false;
        reject(e);
      };
      this.speaking = true;
      window.speechSynthesis.speak(utter);
    });
  }

  stop() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    this.speaking = false;
  }

  isSpeaking() {
    return this.speaking;
  }
}

class ElevenLabsTTS implements TTSProvider {
  private audio: HTMLAudioElement | null = null;
  private speaking = false;

  async speak(text: string) {
    // stop any existing audio
    this.stop();

    const configResponse = await fetch("/api/tts/config");
    if (!configResponse.ok) {
      throw new Error("Failed to fetch TTS configuration from server");
    }
    const { apiKey, voiceId } = await configResponse.json();

    const client = new ElevenLabsClient({ apiKey });

    const result = await client.textToSpeech.stream(voiceId, {
      text,
      modelId: "eleven_flash_v2_5",
      outputFormat: "mp3_44100_128",
    });

    const blob = await new Response(result).blob();

    const src = URL.createObjectURL(blob);
    const audio = new Audio(src);

    this.audio = audio;
    this.speaking = true;

    return await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        this.speaking = false;
        URL.revokeObjectURL(src);
        this.audio = null;
        resolve();
      };
      audio.onerror = (e) => {
        this.speaking = false;
        URL.revokeObjectURL(src);
        this.audio = null;
        reject(e);
      };
      audio.play().catch((err) => reject(err));
    });
  }

  stop() {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch {
        // ignore
      }
      this.audio = null;
    }
    this.speaking = false;
  }

  isSpeaking() {
    return this.speaking;
  }
}

// Manager / singleton
const browser = new BrowserTTS();
let active: TTSProvider = browser;

export function setTTSProvider(name: TTSProviderName) {
  if (name === "browser") {
    active = browser;
  } else if (name === "elevenlabs") {
    active = new ElevenLabsTTS();
  }
}

export async function speak(text: string) {
  return active.speak(text);
}

export function stop() {
  return active.stop();
}

export function isSpeaking() {
  return active.isSpeaking();
}

export default {
  setTTSProvider,
  speak,
  stop,
  isSpeaking,
};

export function sanitizeForSpeech(text: string) {
  if (!text) return "";
  let t = text.replace(/```[\s\S]*?```/g, "");
  t = t.replace(/`([^`]+)`/g, "$1");
  t = t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  t = t.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");
  t = t.replace(/^#+\s+/gm, "");
  t = t.replace(/\*|_/g, "");
  t = t.replace(/<[^>]*>/g, "");
  return t.trim();
}
