# Chatbot Ollama

A React frontend for chatting with local AI models via [Ollama](https://ollama.ai).

## Stack

- **Vite** — build tool and dev server
- **React 19** — UI framework
- **TypeScript** — type safety
- **Tailwind CSS v4** — styling
- **Zustand** — state management

## Requirements

- [Node.js](https://nodejs.org/) ≥ 18
- [Ollama](https://ollama.ai) running locally (default: `http://localhost:11434`)
- At least one model pulled in Ollama (e.g. `ollama pull llama3`)

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Configuration

Copy `.env.example` to `.env` and adjust the Ollama URL if needed:

```bash
cp .env.example .env
```

| Variable          | Default                      | Description          |
| ----------------- | ---------------------------- | -------------------- |
| `VITE_OLLAMA_URL` | `http://localhost:11434`     | Ollama API base URL  |
| `VITE_TURNSTILE_SITE_KEY` | (empty)              | Cloudflare Turnstile site key (frontend) |
| `TURNSTILE_SECRET_KEY` | (empty)                 | Cloudflare Turnstile secret key (worker) |

If `TURNSTILE_SECRET_KEY` is configured, all `/api/*` requests are protected with invisible Turnstile verification.

## Turnstile (Invisible)

1. Create a Turnstile widget in Cloudflare and set mode to `Managed` or `Invisible`.
2. Add the site key to `VITE_TURNSTILE_SITE_KEY`.
3. Add the secret key to `TURNSTILE_SECRET_KEY`.
4. Run the app normally (`npm run dev` or deploy). Chat requests are verified server-side in the Cloudflare worker.

## Scripts

| Command         | Description                        |
| --------------- | ---------------------------------- |
| `npm run dev`   | Start development server           |
| `npm run build` | Build for production               |
| `npm run lint`  | Run ESLint                         |
| `npm run preview` | Preview production build locally |
