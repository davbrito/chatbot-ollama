export interface AppEnv {
  Bindings: {
    OLLAMA_URL?: string;
    OLLAMA_API_KEY: string;
    OMDB_API_KEY: string;
    ELEVENLABS_API_KEY?: string;
    ELEVENLABS_VOICE_ID?: string;
    TURNSTILE_SECRET_KEY?: string;
    JWT_SECRET_KEY?: string;
    SESSION_JWT_TTL_SECONDS?: string;
  };
}
