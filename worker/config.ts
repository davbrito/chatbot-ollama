export interface AppEnv {
  Bindings: {
    OLLAMA_URL?: string;
    OLLAMA_API_KEY: string;
    TURNSTILE_SECRET_KEY?: string;
  };
}
