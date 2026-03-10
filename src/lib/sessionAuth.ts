import { getTurnstileToken } from "./turnstile";

interface SessionStartResponse {
  authEnabled?: boolean;
}

let sessionReady = false;
let sessionPromise: Promise<void> | null = null;

async function requestSessionCookie() {
  const turnstileToken = await getTurnstileToken();

  const response = await fetch("/api/auth/start-session", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "CF-Turnstile-Token": turnstileToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Session start failed (${response.status})`);
  }

  const body = (await response.json()) as SessionStartResponse;
  if (!body.authEnabled) {
    sessionReady = true;
    return;
  }

  sessionReady = true;
}

export async function ensureSessionCookie() {
  if (sessionReady) {
    return;
  }

  if (!sessionPromise) {
    sessionPromise = requestSessionCookie().finally(() => {
      sessionPromise = null;
    });
  }

  return sessionPromise;
}

export function resetSessionCookieState() {
  sessionReady = false;
}

export async function bootstrapSessionAuth() {
  try {
    await ensureSessionCookie();
  } catch (error) {
    console.error("Could not bootstrap auth session", error);
  }
}
