export interface AppEnv {
  Bindings: {
    OLLAMA_URL?: string;
    OLLAMA_API_KEY: string;
    OMDB_API_KEY: string;
    TURNSTILE_SECRET_KEY?: string;
    JWT_SECRET_KEY?: string;
    SESSION_JWT_TTL_SECONDS?: string;
  };
}
